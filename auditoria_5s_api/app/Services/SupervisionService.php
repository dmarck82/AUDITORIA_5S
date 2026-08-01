<?php

namespace App\Services;

use App\Enums\SupervisionStatus;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\WorkEnvironment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class SupervisionService
{
    public function __construct(private readonly SupervisionAccessService $access) {}

    /** @param array{work_environment_id: int, responsible_user_id: int} $data */
    public function create(array $data, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($data, $operator): Supervision {
            $workEnvironment = $this->workEnvironment((int) $data['work_environment_id']);
            $responsibleUser = User::query()->with('operator')->findOrFail($data['responsible_user_id']);
            $this->access->assertCanCreateFor($operator, $workEnvironment, $responsibleUser);
            $operator->loadMissing('user');
            $criteria = $this->activeCriteria($workEnvironment);

            if ($criteria->isEmpty()) {
                throw ValidationException::withMessages([
                    'criteria' => 'At least one active verification criterion must be linked to the work environment.',
                ]);
            }

            $supervision = Supervision::query()->create([
                'work_environment_id' => $workEnvironment->id,
                'responsible_user_id' => $responsibleUser->id,
                'operator_id' => $operator->id,
                'status' => SupervisionStatus::Draft,
                'started_at' => now(),
                ...$this->snapshotData($workEnvironment, $responsibleUser, $operator),
            ]);

            $this->createAnswers($supervision, $criteria);

            return $this->load($supervision);
        });
    }

    /** @param array{work_environment_id: int, responsible_user_id: int} $data */
    public function update(Supervision $supervision, array $data, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $data, $operator): Supervision {
            $locked = Supervision::query()->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatus($locked, SupervisionStatus::Draft);
            $this->access->assertCanConfigure($operator, $locked);
            $workEnvironment = $this->workEnvironment((int) $data['work_environment_id']);
            $responsibleUser = User::query()->with('operator')->findOrFail($data['responsible_user_id']);
            $this->access->assertCanCreateFor($operator, $workEnvironment, $responsibleUser);

            if ($locked->work_environment_id !== $workEnvironment->id) {
                $criteria = $this->activeCriteria($workEnvironment);

                if ($criteria->isEmpty()) {
                    throw ValidationException::withMessages([
                        'criteria' => 'At least one active verification criterion must be linked to the work environment.',
                    ]);
                }

                $locked->answers()->delete();
                $this->createAnswers($locked, $criteria);
            }

            $locked->update([
                'work_environment_id' => $workEnvironment->id,
                'responsible_user_id' => $responsibleUser->id,
                ...$this->snapshotData($workEnvironment, $responsibleUser, $locked->operator()->with('user')->first()),
            ]);

            return $this->load($locked);
        });
    }

    public function send(Supervision $supervision, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $operator): Supervision {
            $locked = Supervision::query()->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatus($locked, SupervisionStatus::Draft);
            $this->access->assertCanSend($operator, $locked);
            $locked->update([
                'status' => SupervisionStatus::Pending,
                'sent_at' => now(),
            ]);

            return $this->load($locked);
        });
    }

    /** @param array<int, array<string, mixed>> $answers */
    public function saveAnswers(Supervision $supervision, array $answers, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $answers, $operator): Supervision {
            $locked = Supervision::query()->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatusIn($locked, [SupervisionStatus::Pending, SupervisionStatus::InProgress]);
            $this->access->assertCanAnswer($operator, $locked);
            $storedAnswers = $locked->answers()->get()->keyBy('id');

            foreach ($answers as $index => $answerData) {
                $answer = $storedAnswers->get((int) $answerData['id']);

                if (! $answer) {
                    throw ValidationException::withMessages([
                        "answers.{$index}.id" => 'The answer does not belong to this supervision.',
                    ]);
                }

                $notApplicable = (bool) $answerData['not_applicable'];
                $answer->update([
                    'selected_value' => $notApplicable ? null : ($answerData['selected_value'] ?? null),
                    'not_applicable' => $notApplicable,
                    'observation' => $this->nullableText($answerData['observation'] ?? null),
                    'evidence' => $this->nullableText($answerData['evidence'] ?? null),
                ]);
            }

            $locked->update([
                'status' => SupervisionStatus::InProgress,
                'response_started_at' => $locked->response_started_at ?? now(),
            ]);

            return $this->load($locked);
        });
    }

    public function submit(Supervision $supervision, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $operator): Supervision {
            $locked = Supervision::query()->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatusIn($locked, [SupervisionStatus::Pending, SupervisionStatus::InProgress]);
            $this->access->assertCanSubmit($operator, $locked);
            $answers = $locked->answers()->lockForUpdate()->get();
            $this->assertAllAnswered($answers);
            $locked->update([
                'status' => SupervisionStatus::Answered,
                'response_started_at' => $locked->response_started_at ?? now(),
                'answered_at' => now(),
            ]);

            return $this->load($locked);
        });
    }

    public function finalize(Supervision $supervision, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $operator): Supervision {
            $locked = Supervision::query()->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatus($locked, SupervisionStatus::Answered);
            $this->access->assertCanFinalize($operator, $locked);
            $locked->update([
                'status' => SupervisionStatus::Finalized,
                'finalized_at' => now(),
            ]);

            return $this->load($locked);
        });
    }

    public function assume(Supervision $supervision, string $justification, Operator $operator): Supervision
    {
        return DB::transaction(function () use ($supervision, $justification, $operator): Supervision {
            $locked = Supervision::query()->with('responsibleUser')->lockForUpdate()->findOrFail($supervision->id);
            $this->assertStatusIn($locked, [SupervisionStatus::Pending, SupervisionStatus::InProgress]);
            $this->access->assertCanAssume($operator, $locked);
            $operator->loadMissing('user');
            $previous = $locked->responsibleUser;

            $locked->responsibilityTransfers()->create([
                'from_user_id' => $previous?->id,
                'from_user_name_snapshot' => $previous?->name ?? $locked->responsible_user_name_snapshot,
                'to_user_id' => $operator->user_id,
                'to_user_name_snapshot' => $operator->user?->name ?? 'Operator',
                'assumed_by_operator_id' => $operator->id,
                'assumed_by_name_snapshot' => $operator->user?->name ?? 'Operator',
                'justification' => trim($justification),
            ]);

            $locked->update([
                'responsible_user_id' => $operator->user_id,
                'status' => SupervisionStatus::InProgress,
                'response_started_at' => $locked->response_started_at ?? now(),
            ]);

            return $this->load($locked);
        });
    }

    public function delete(Supervision $supervision, Operator $operator): void
    {
        $this->assertStatus($supervision, SupervisionStatus::Draft);
        $this->access->assertCanDelete($operator, $supervision);
        $supervision->delete();
    }

    public function load(Supervision $supervision): Supervision
    {
        return $supervision->fresh()->load([
            'workEnvironment.local3.local2.local1',
            'responsibleUser',
            'operator.user',
            'updatedBy.user',
            'answers',
            'responsibilityTransfers' => fn ($query) => $query->oldest(),
        ]);
    }

    private function assertAllAnswered($answers): void
    {
        $errors = [];

        foreach ($answers as $answer) {
            if (! $answer->not_applicable && $answer->selected_value === null) {
                $errors["answers.{$answer->id}.selected_value"] = 'All criteria must be answered before submission.';
            }

            if ($answer->isNonconformity() && blank($answer->observation)) {
                $errors["answers.{$answer->id}.observation"] = 'Observation is required for answers with value 0 or 5.';
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function assertStatus(Supervision $supervision, SupervisionStatus $status): void
    {
        $this->assertStatusIn($supervision, [$status]);
    }

    /** @param array<int, SupervisionStatus> $statuses */
    private function assertStatusIn(Supervision $supervision, array $statuses): void
    {
        if (! in_array($supervision->status, $statuses, true)) {
            throw new ConflictHttpException('The supervision is not in a valid status for this action.');
        }
    }

    private function workEnvironment(int $id): WorkEnvironment
    {
        return WorkEnvironment::query()
            ->with('local3.local2.local1')
            ->findOrFail($id);
    }

    private function activeCriteria(WorkEnvironment $workEnvironment)
    {
        return $workEnvironment->verificationCriteria()
            ->where('verification_criteria.active', true)
            ->orderBy('sense')
            ->orderBy('code')
            ->get();
    }

    private function createAnswers(Supervision $supervision, $criteria): void
    {
        $supervision->answers()->createMany($criteria->map(fn ($criterion): array => [
            'verification_criterion_id' => $criterion->id,
            'criterion_code_snapshot' => $criterion->code,
            'sense_snapshot' => $criterion->sense,
            'criterion_question_snapshot' => $criterion->question,
            'response_0_label_snapshot' => $criterion->response_0_label,
            'response_5_label_snapshot' => $criterion->response_5_label,
            'response_10_label_snapshot' => $criterion->response_10_label,
            'response_15_label_snapshot' => $criterion->response_15_label,
        ])->all());
    }

    /** @return array<string, int|string|null> */
    private function snapshotData(
        WorkEnvironment $workEnvironment,
        User $responsibleUser,
        ?Operator $operator
    ): array {
        return [
            'local_1_id_snapshot' => $workEnvironment->local3->local2->local_1_id,
            'local_2_id_snapshot' => $workEnvironment->local3->local_2_id,
            'local_3_id_snapshot' => $workEnvironment->local_3_id,
            'work_environment_name_snapshot' => $workEnvironment->name,
            'local_1_name_snapshot' => $workEnvironment->local3->local2->local1->name,
            'local_2_name_snapshot' => $workEnvironment->local3->local2->name,
            'local_3_name_snapshot' => $workEnvironment->local3->name,
            'responsible_user_name_snapshot' => $responsibleUser->name,
            'operator_name_snapshot' => $operator?->user?->name ?? 'Operator',
        ];
    }

    private function nullableText(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
