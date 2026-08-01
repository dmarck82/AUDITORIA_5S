<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Local2s\StoreLocal2Request;
use App\Http\Requests\Local2s\UpdateLocal2Request;
use App\Http\Resources\Local2ListResource;
use App\Http\Resources\Local2Resource;
use App\Models\Local2;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class Local2Controller extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return Local2ListResource::collection(
            Local2::query()
                ->with(['local1:id,name,active', 'updatedBy.user'])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreLocal2Request $request): Local2Resource
    {
        $local2 = Local2::create($request->validated());

        return new Local2Resource($local2->load(['local1:id,name,active', 'updatedBy.user']));
    }

    public function show(Local2 $local2): Local2Resource
    {
        return new Local2Resource($local2->load(['local1:id,name,active', 'updatedBy.user']));
    }

    public function update(UpdateLocal2Request $request, Local2 $local2): Local2Resource
    {
        $local2->update($request->validated());

        return new Local2Resource($local2->load(['local1:id,name,active', 'updatedBy.user']));
    }

    public function destroy(Local2 $local2): Response|JsonResponse
    {
        if ($local2->local3s()->exists()) {
            return response()->json([
                'message' => 'This local2 cannot be deleted because it has local_3s.',
            ], 409);
        }

        if ($local2->users()->exists()) {
            return response()->json([
                'message' => 'This local2 cannot be deleted because it has users linked to it.',
            ], 409);
        }

        $local2->delete();

        return response()->noContent();
    }
}
