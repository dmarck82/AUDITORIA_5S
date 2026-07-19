<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Activities\ReorderActivitiesRequest;
use App\Http\Requests\Activities\StoreActivityRequest;
use App\Http\Requests\Activities\UpdateActivityRequest;
use App\Http\Resources\ActivityListResource;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ActivityListResource::collection(
            Activity::query()
                ->with(['process.sector.unit.organization', 'updatedBy.person'])
                ->when($request->filled('process_id'), fn ($query) => $query->where('process_id', $request->integer('process_id')))
                ->orderBy('process_id')
                ->orderBy('sort_order')
                ->paginate()
        );
    }

    public function store(StoreActivityRequest $request): ActivityResource
    {
        $activity = Activity::create($request->validated());

        return new ActivityResource($activity->load($this->relations()));
    }

    public function show(Activity $activity): ActivityResource
    {
        return new ActivityResource($activity->load($this->relations()));
    }

    public function update(UpdateActivityRequest $request, Activity $activity): ActivityResource
    {
        $activity->update($request->validated());

        return new ActivityResource($activity->load($this->relations()));
    }

    public function reorder(ReorderActivitiesRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $processId = (int) $validated['process_id'];
        $activityIds = array_map('intval', $validated['activities']);

        $totalActivities = Activity::query()
            ->where('process_id', $processId)
            ->count();

        if ($totalActivities !== count($activityIds)) {
            return response()->json([
                'message' => 'All process activities must be sent to reorder.',
            ], 422);
        }

        $validActivityIds = Activity::query()
            ->where('process_id', $processId)
            ->whereIn('id', $activityIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        sort($validActivityIds);
        $sortedActivityIds = $activityIds;
        sort($sortedActivityIds);

        if ($validActivityIds !== $sortedActivityIds) {
            return response()->json([
                'message' => 'All activities must belong to the selected process.',
            ], 422);
        }

        DB::transaction(function () use ($activityIds): void {
            foreach ($activityIds as $index => $activityId) {
                Activity::query()
                    ->whereKey($activityId)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json([
            'message' => 'Activities reordered successfully.',
        ]);
    }

    public function destroy(Activity $activity): Response
    {
        $activity->delete();

        return response()->noContent();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function relations(): array
    {
        return [
            'process.sector.unit.organization',
            'updatedBy.person',
        ];
    }
}
