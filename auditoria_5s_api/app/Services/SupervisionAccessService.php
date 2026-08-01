<?php

namespace App\Services;

use App\Enums\AccessLevel;
use App\Enums\SupervisionStatus;
use App\Models\Operator;
use App\Models\Supervision;
use App\Models\User;
use App\Models\WorkEnvironment;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class SupervisionAccessService
{
    /** @return Builder<Supervision> */
    public function visibleQuery(Operator $operator): Builder
    {
        $query = Supervision::query();
        $level = $this->level($operator);

        if ($level === AccessLevel::Administrator) {
            return $query;
        }

        if ($level === AccessLevel::Respondent) {
            return $query
                ->where('responsible_user_id', $operator->user_id)
                ->where('status', '!=', SupervisionStatus::Draft->value);
        }

        if (in_array($level, [AccessLevel::Manager, AccessLevel::Operator], true)) {
            return $this->applyHierarchy($query, $operator);
        }

        return $query->whereRaw('1 = 0');
    }

    public function assertCanView(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless(
            $this->visibleQuery($operator)->whereKey($supervision->id)->exists()
        );
    }

    public function canConfigure(Operator $operator, Supervision $supervision): bool
    {
        return $supervision->status === SupervisionStatus::Draft
            && ($this->isAdministrator($operator)
                || ($this->level($operator) === AccessLevel::Manager
                    && $supervision->operator_id === $operator->id
                    && $this->isWithinScope($operator, $supervision->local_2_id_snapshot, $supervision->local_3_id_snapshot)));
    }

    public function canSend(Operator $operator, Supervision $supervision): bool
    {
        return $this->canConfigure($operator, $supervision);
    }

    public function canAnswer(Operator $operator, Supervision $supervision): bool
    {
        if (! in_array($supervision->status, [SupervisionStatus::Pending, SupervisionStatus::InProgress], true)) {
            return false;
        }

        if ($this->isAdministrator($operator)) {
            return true;
        }

        return $supervision->responsible_user_id === $operator->user_id
            && in_array($this->level($operator), [AccessLevel::Manager, AccessLevel::Operator, AccessLevel::Respondent], true);
    }

    public function canSubmit(Operator $operator, Supervision $supervision): bool
    {
        return $this->canAnswer($operator, $supervision);
    }

    public function canAssume(Operator $operator, Supervision $supervision): bool
    {
        return in_array($this->level($operator), [AccessLevel::Manager, AccessLevel::Operator], true)
            && in_array($supervision->status, [SupervisionStatus::Pending, SupervisionStatus::InProgress], true)
            && $supervision->responsible_user_id !== $operator->user_id
            && $this->isWithinScope($operator, $supervision->local_2_id_snapshot, $supervision->local_3_id_snapshot);
    }

    public function canFinalize(Operator $operator, Supervision $supervision): bool
    {
        return $supervision->status === SupervisionStatus::Answered
            && ($this->isAdministrator($operator)
                || ($this->level($operator) === AccessLevel::Manager
                    && $this->isWithinScope($operator, $supervision->local_2_id_snapshot, $supervision->local_3_id_snapshot)));
    }

    public function canDelete(Operator $operator, Supervision $supervision): bool
    {
        return $supervision->status === SupervisionStatus::Draft
            && ($this->isAdministrator($operator)
                || ($this->level($operator) === AccessLevel::Manager
                    && $supervision->operator_id === $operator->id
                    && $this->isWithinScope($operator, $supervision->local_2_id_snapshot, $supervision->local_3_id_snapshot)));
    }

    public function assertCanConfigure(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canConfigure($operator, $supervision));
    }

    public function assertCanSend(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canSend($operator, $supervision));
    }

    public function assertCanAnswer(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canAnswer($operator, $supervision));
    }

    public function assertCanSubmit(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canSubmit($operator, $supervision));
    }

    public function assertCanAssume(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canAssume($operator, $supervision));
    }

    public function assertCanFinalize(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canFinalize($operator, $supervision));
    }

    public function assertCanDelete(Operator $operator, Supervision $supervision): void
    {
        $this->denyUnless($this->canDelete($operator, $supervision));
    }

    public function assertCanCreateFor(Operator $operator, WorkEnvironment $environment, User $responsible): void
    {
        $level = $this->level($operator);
        $environment->loadMissing('local3.local2');

        $allowed = $this->isAdministrator($operator)
            || ($level === AccessLevel::Manager
                && $this->isWithinScope($operator, $environment->local3->local_2_id, $environment->local_3_id));

        $allowed = $allowed
            && $this->responsibleWithinScope($operator, $responsible, $environment)
            && $this->isResponseCapable($responsible);

        $this->denyUnless($allowed);
    }

    /** @return Builder<WorkEnvironment> */
    public function availableEnvironmentsQuery(Operator $operator): Builder
    {
        $query = WorkEnvironment::query()
            ->where('active', true)
            ->whereHas('verificationCriteria', fn (Builder $query) => $query->where('verification_criteria.active', true));

        if ($this->isAdministrator($operator)) {
            return $query;
        }

        $operator->loadMissing('user');

        if ($this->level($operator) !== AccessLevel::Manager || ! $operator->user?->local_2_id) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('local3', function (Builder $query) use ($operator): void {
            $query->where('local_2_id', $operator->user->local_2_id);

            if ($operator->user->local_3_id) {
                $query->whereKey($operator->user->local_3_id);
            }
        });
    }

    /** @return Builder<User> */
    public function availableResponsibleUsersQuery(Operator $operator): Builder
    {
        $query = User::query()
            ->where('active', true)
            ->whereHas('operator', function (Builder $query): void {
                $query->where('active', true)
                    ->whereIn('access_level', [
                        AccessLevel::Respondent->value,
                        AccessLevel::Operator->value,
                        AccessLevel::Manager->value,
                        AccessLevel::Administrator->value,
                    ]);
            });

        if ($this->isAdministrator($operator)) {
            return $query;
        }

        $operator->loadMissing('user');

        if ($this->level($operator) !== AccessLevel::Manager || ! $operator->user?->local_2_id) {
            return $query->whereRaw('1 = 0');
        }

        $query->where('local_2_id', $operator->user->local_2_id);

        if ($operator->user->local_3_id) {
            $query->where(function (Builder $query) use ($operator): void {
                $query->whereNull('local_3_id')->orWhere('local_3_id', $operator->user->local_3_id);
            });
        }

        return $query;
    }

    /** @param Builder<Supervision> $query
     * @return Builder<Supervision>
     */
    private function applyHierarchy(Builder $query, Operator $operator): Builder
    {
        $operator->loadMissing('user');

        if (! $operator->user?->local_2_id) {
            return $query->whereRaw('1 = 0');
        }

        $query->where('local_2_id_snapshot', $operator->user->local_2_id);

        if ($operator->user->local_3_id) {
            $query->where('local_3_id_snapshot', $operator->user->local_3_id);
        }

        return $query;
    }

    private function isWithinScope(Operator $operator, ?int $local2Id, ?int $local3Id): bool
    {
        if ($this->isAdministrator($operator)) {
            return true;
        }

        $operator->loadMissing('user');
        $user = $operator->user;

        return $user?->local_2_id !== null
            && $user->local_2_id === $local2Id
            && ($user->local_3_id === null || $user->local_3_id === $local3Id);
    }

    private function responsibleWithinScope(Operator $operator, User $user, WorkEnvironment $environment): bool
    {
        if ($this->isAdministrator($operator)) {
            return true;
        }

        if ($user->local_2_id !== $environment->local3->local_2_id) {
            return false;
        }

        return $operator->user?->local_3_id === null
            || $user->local_3_id === null
            || $operator->user->local_3_id === $user->local_3_id;
    }

    private function isResponseCapable(User $user): bool
    {
        $user->loadMissing('operator');

        return $user->operator?->active
            && in_array((int) $user->operator->access_level, [
                AccessLevel::Respondent->value,
                AccessLevel::Operator->value,
                AccessLevel::Manager->value,
                AccessLevel::Administrator->value,
            ], true);
    }

    private function isAdministrator(Operator $operator): bool
    {
        return $this->level($operator) === AccessLevel::Administrator;
    }

    private function level(Operator $operator): ?AccessLevel
    {
        return AccessLevel::tryFrom((int) $operator->access_level);
    }

    private function denyUnless(bool $allowed): void
    {
        if (! $allowed) {
            throw new AccessDeniedHttpException('You are not authorized to perform this action on the supervision.');
        }
    }
}
