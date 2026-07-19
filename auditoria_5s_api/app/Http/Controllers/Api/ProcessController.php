<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Processes\StoreProcessRequest;
use App\Http\Requests\Processes\UpdateProcessRequest;
use App\Http\Resources\ProcessListResource;
use App\Http\Resources\ProcessResource;
use App\Models\Process;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProcessController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProcessListResource::collection(
            Process::query()
                ->with(['sector.unit.organization', 'updatedBy.person'])
                ->withCount('activities')
                ->when($request->filled('sector_id'), fn ($query) => $query->where('sector_id', $request->integer('sector_id')))
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreProcessRequest $request): ProcessResource
    {
        $process = Process::create($request->validated());

        return new ProcessResource($process->load($this->relations())->loadCount('activities'));
    }

    public function show(Process $process): ProcessResource
    {
        return new ProcessResource($process->load($this->relations())->loadCount('activities'));
    }

    public function update(UpdateProcessRequest $request, Process $process): ProcessResource
    {
        $process->update($request->validated());

        return new ProcessResource($process->load($this->relations())->loadCount('activities'));
    }

    public function destroy(Process $process): Response|JsonResponse
    {
        if ($process->activities()->exists()) {
            return response()->json([
                'message' => 'This process cannot be deleted because it has activities linked to it.',
            ], 409);
        }

        $process->delete();

        return response()->noContent();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function relations(): array
    {
        return [
            'sector.unit.organization',
            'updatedBy.person',
            'activities' => fn ($query) => $query->with('updatedBy.person')->orderBy('sort_order'),
        ];
    }
}
