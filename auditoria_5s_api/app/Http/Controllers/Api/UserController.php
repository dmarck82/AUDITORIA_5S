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
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserListResource::collection(
            User::query()
                ->with([
                    'local1:id,name,active',
                    'local2:id,local_1_id,name,active',
                    'local3:id,local_2_id,name,active',
                    'updatedBy.user',
                ])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $data = $request->validated();
        unset($data['photo']);

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('users/photos');
        }

        $user = User::create($data);

        return new UserResource($user->load(['local1', 'local2', 'local3', 'operator', 'updatedBy.user']));
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load(['local1', 'local2', 'local3', 'operator', 'updatedBy.user']));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $data = $request->validated();
        unset($data['photo']);

        if ($request->hasFile('photo')) {
            if ($user->photo_path) {
                Storage::disk('local')->delete($user->photo_path);
            }

            $data['photo_path'] = $request->file('photo')->store('users/photos');
        }

        $user->update($data);

        return new UserResource($user->load(['local1', 'local2', 'local3', 'operator', 'updatedBy.user']));
    }

    public function destroy(User $user): Response
    {
        if ($user->photo_path) {
            Storage::disk('local')->delete($user->photo_path);
        }

        $user->delete();

        return response()->noContent();
    }

    public function photo(User $user): BinaryFileResponse
    {
        abort_unless($user->photo_path && Storage::disk('local')->exists($user->photo_path), 404);

        return response()->file(Storage::disk('local')->path($user->photo_path));
    }
}
