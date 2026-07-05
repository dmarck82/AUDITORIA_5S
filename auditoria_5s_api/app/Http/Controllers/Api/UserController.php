<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserListResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserListResource::collection(
            User::query()
                ->with('person:id,name,email,phone,active', 'updatedBy.person')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $user = User::create($request->validated());

        return new UserResource($user->load('person.organization', 'person.unit', 'person.sector', 'updatedBy.person'));
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('person.organization', 'person.unit', 'person.sector', 'updatedBy.person'));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return new UserResource($user->load('person.organization', 'person.unit', 'person.sector', 'updatedBy.person'));
    }

    public function destroy(User $user): Response
    {
        $user->delete();

        return response()->noContent();
    }
}
