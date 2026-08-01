<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operators\StoreOperatorRequest;
use App\Http\Requests\Operators\UpdateOperatorRequest;
use App\Http\Resources\OperatorListResource;
use App\Http\Resources\OperatorResource;
use App\Models\Operator;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class OperatorController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return OperatorListResource::collection(
            Operator::query()
                ->with('user:id,name,email,phone,active', 'updatedBy.user')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreOperatorRequest $request): OperatorResource
    {
        $operator = Operator::create($request->validated());

        return new OperatorResource($operator->load('user.local1', 'user.local2', 'user.local3', 'updatedBy.user'));
    }

    public function show(Operator $operator): OperatorResource
    {
        return new OperatorResource($operator->load('user.local1', 'user.local2', 'user.local3', 'updatedBy.user'));
    }

    public function update(UpdateOperatorRequest $request, Operator $operator): OperatorResource
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $operator->update($data);

        return new OperatorResource($operator->load('user.local1', 'user.local2', 'user.local3', 'updatedBy.user'));
    }

    public function destroy(Operator $operator): Response
    {
        $operator->delete();

        return response()->noContent();
    }
}
