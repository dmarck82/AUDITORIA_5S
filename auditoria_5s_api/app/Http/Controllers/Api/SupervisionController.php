<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supervisions\AssumeSupervisionRequest;
use App\Http\Requests\Supervisions\SaveSupervisionAnswersRequest;
use App\Http\Requests\Supervisions\StoreSupervisionRequest;
use App\Http\Requests\Supervisions\UpdateSupervisionRequest;
use App\Http\Resources\SupervisionListResource;
use App\Http\Resources\SupervisionResource;
use App\Models\Operator;
use App\Models\Supervision;
use App\Services\SupervisionAccessService;
use App\Services\SupervisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SupervisionController extends Controller
{
    public function __construct(
        private readonly SupervisionService $service,
        private readonly SupervisionAccessService $access
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return SupervisionListResource::collection(
            $this->access->visibleQuery($this->operator($request))
                ->with(['answers', 'responsibleUser'])
                ->latest('started_at')
                ->paginate()
        );
    }

    public function options(Request $request): JsonResponse
    {
        $operator = $this->operator($request);
        $environments = $this->access->availableEnvironmentsQuery($operator)
            ->with('local3.local2.local1')
            ->withCount([
                'verificationCriteria as active_verification_criteria_count' => fn ($query) => $query->where('verification_criteria.active', true),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($environment): array => [
                'id' => $environment->id,
                'name' => $environment->name,
                'active_verification_criteria_count' => (int) $environment->active_verification_criteria_count,
                'local3' => [
                    'id' => $environment->local3->id,
                    'name' => $environment->local3->name,
                    'local2' => [
                        'id' => $environment->local3->local2->id,
                        'name' => $environment->local3->local2->name,
                    ],
                ],
            ]);
        $users = $this->access->availableResponsibleUsersQuery($operator)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'local_2_id', 'local_3_id']);

        return response()->json([
            'data' => [
                'work_environments' => $environments,
                'responsible_users' => $users,
            ],
        ]);
    }

    public function store(StoreSupervisionRequest $request): JsonResponse
    {
        return (new SupervisionResource(
            $this->service->create($request->validated(), $this->operator($request))
        ))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Supervision $supervision): SupervisionResource
    {
        $this->access->assertCanView($this->operator($request), $supervision);

        return new SupervisionResource($this->service->load($supervision));
    }

    public function update(
        UpdateSupervisionRequest $request,
        Supervision $supervision
    ): SupervisionResource {
        return new SupervisionResource(
            $this->service->update($supervision, $request->validated(), $this->operator($request))
        );
    }

    public function send(Request $request, Supervision $supervision): SupervisionResource
    {
        return new SupervisionResource(
            $this->service->send($supervision, $this->operator($request))
        );
    }

    public function saveAnswers(
        SaveSupervisionAnswersRequest $request,
        Supervision $supervision
    ): SupervisionResource {
        return new SupervisionResource(
            $this->service->saveAnswers(
                $supervision,
                $request->validated()['answers'],
                $this->operator($request)
            )
        );
    }

    public function submit(Request $request, Supervision $supervision): SupervisionResource
    {
        return new SupervisionResource(
            $this->service->submit($supervision, $this->operator($request))
        );
    }

    public function finalize(Request $request, Supervision $supervision): SupervisionResource
    {
        return new SupervisionResource(
            $this->service->finalize($supervision, $this->operator($request))
        );
    }

    public function assume(
        AssumeSupervisionRequest $request,
        Supervision $supervision
    ): SupervisionResource {
        return new SupervisionResource(
            $this->service->assume(
                $supervision,
                $request->validated()['justification'],
                $this->operator($request)
            )
        );
    }

    public function destroy(Request $request, Supervision $supervision): Response
    {
        $this->service->delete($supervision, $this->operator($request));

        return response()->noContent();
    }

    private function operator(Request $request): Operator
    {
        /** @var Operator $operator */
        $operator = $request->user('api');

        return $operator;
    }
}
