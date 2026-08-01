<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Local1s\StoreLocal1Request;
use App\Http\Requests\Local1s\UpdateLocal1Request;
use App\Http\Resources\Local1ListResource;
use App\Http\Resources\Local1Resource;
use App\Models\Local1;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class Local1Controller extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return Local1ListResource::collection(
            Local1::query()
                ->with('updatedBy.user')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreLocal1Request $request): Local1Resource
    {
        $local1 = Local1::create($request->validated());

        return new Local1Resource($local1->load('updatedBy.user'));
    }

    public function show(Local1 $local1): Local1Resource
    {
        return new Local1Resource($local1->load('updatedBy.user'));
    }

    public function update(UpdateLocal1Request $request, Local1 $local1): Local1Resource
    {
        $local1->update($request->validated());

        return new Local1Resource($local1->load('updatedBy.user'));
    }

    public function destroy(Local1 $local1): Response|JsonResponse
    {
        if ($local1->local2s()->exists()) {
            return response()->json([
                'message' => 'This local1 cannot be deleted because it has local_2s.',
            ], 409);
        }

        if ($local1->users()->exists()) {
            return response()->json([
                'message' => 'This local1 cannot be deleted because it has users linked to it.',
            ], 409);
        }

        $local1->delete();

        return response()->noContent();
    }
}
