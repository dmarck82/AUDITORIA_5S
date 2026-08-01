<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthenticatedOperatorResource;
use App\Models\Operator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $operator = Operator::findForLogin($credentials['login']);

        if (! $operator || ! $operator->active || ! Hash::check($credentials['password'], $operator->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = auth('api')->login($operator);

        return $this->respondWithToken($token, $operator);
    }

    public function me(): JsonResponse
    {
        $operator = auth('api')->user();
        $operator->loadMissing('user:id,name');

        return response()->json([
            'operator' => new AuthenticatedOperatorResource($operator),
            'permissions' => $operator->permissions(),
        ]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    private function respondWithToken(string $token, $operator): JsonResponse
    {
        $operator->loadMissing('user:id,name');

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'operator' => new AuthenticatedOperatorResource($operator),
            'permissions' => $operator->permissions(),
        ]);
    }
}
