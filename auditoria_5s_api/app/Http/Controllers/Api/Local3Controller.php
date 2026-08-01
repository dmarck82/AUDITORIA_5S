<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Local3s\StoreLocal3Request;
use App\Http\Requests\Local3s\UpdateLocal3Request;
use App\Http\Resources\Local3ListResource;
use App\Http\Resources\Local3Resource;
use App\Models\Local3;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class Local3Controller extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return Local3ListResource::collection(
            Local3::query()
                ->with(['local2:id,name,local_1_id,active', 'updatedBy.user'])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreLocal3Request $request): Local3Resource
    {
        $local3 = Local3::create($request->validated());

        return new Local3Resource($local3->load('local2.local1', 'updatedBy.user'));
    }

    public function show(Local3 $local3): Local3Resource
    {
        return new Local3Resource($local3->load('local2.local1', 'updatedBy.user'));
    }

    public function update(UpdateLocal3Request $request, Local3 $local3): Local3Resource
    {
        $local3->update($request->validated());

        return new Local3Resource($local3->load('local2.local1', 'updatedBy.user'));
    }

    public function destroy(Local3 $local3): Response|JsonResponse
    {
        if ($local3->users()->exists()) {
            return response()->json([
                'message' => 'This local3 cannot be deleted because it has users linked to it.',
            ], 409);
        }

        if ($local3->workEnvironments()->exists()) {
            return response()->json([
                'message' => 'This local3 cannot be deleted because it has work environments linked to it.',
            ], 409);
        }

        $local3->delete();

        return response()->noContent();
    }
}
