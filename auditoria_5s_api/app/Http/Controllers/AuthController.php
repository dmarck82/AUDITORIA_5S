<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::findForLogin($credentials['login']);

        if (!$user || !$user->active || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        $user->loadMissing('person:id,name');

        return response()->json([
            'user' => new AuthenticatedUserResource($user),
            'permissions' => $user->permissions(),
        ]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    private function respondWithToken(string $token, $user): JsonResponse
    {
        $user->loadMissing('person:id,name');

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => new AuthenticatedUserResource($user),
            'permissions' => $user->permissions(),
        ]);
    }
}
