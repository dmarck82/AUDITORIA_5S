<?php

use App\Http\Controllers\Api\Local1Controller;
use App\Http\Controllers\Api\Local2Controller;
use App\Http\Controllers\Api\Local3Controller;
use App\Http\Controllers\Api\OperatorController;
use App\Http\Controllers\Api\SupervisionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VerificationCriterionController;
use App\Http\Controllers\Api\WorkEnvironmentController;
use App\Http\Controllers\Api\WorkEnvironmentCriteriaController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('local1s', [Local1Controller::class, 'index'])->middleware('permission:local1s.view');
    Route::post('local1s', [Local1Controller::class, 'store'])->middleware('permission:local1s.create');
    Route::get('local1s/{local1}', [Local1Controller::class, 'show'])->middleware('permission:local1s.view');
    Route::match(['put', 'patch'], 'local1s/{local1}', [Local1Controller::class, 'update'])->middleware('permission:local1s.update');
    Route::delete('local1s/{local1}', [Local1Controller::class, 'destroy'])->middleware('permission:local1s.delete');

    Route::get('local2s', [Local2Controller::class, 'index'])->middleware('permission:local2s.view');
    Route::post('local2s', [Local2Controller::class, 'store'])->middleware('permission:local2s.create');
    Route::get('local2s/{local2}', [Local2Controller::class, 'show'])->middleware('permission:local2s.view');
    Route::match(['put', 'patch'], 'local2s/{local2}', [Local2Controller::class, 'update'])->middleware('permission:local2s.update');
    Route::delete('local2s/{local2}', [Local2Controller::class, 'destroy'])->middleware('permission:local2s.delete');

    Route::get('local3s', [Local3Controller::class, 'index'])->middleware('permission:local3s.view');
    Route::post('local3s', [Local3Controller::class, 'store'])->middleware('permission:local3s.create');
    Route::get('local3s/{local3}', [Local3Controller::class, 'show'])->middleware('permission:local3s.view');
    Route::match(['put', 'patch'], 'local3s/{local3}', [Local3Controller::class, 'update'])->middleware('permission:local3s.update');
    Route::delete('local3s/{local3}', [Local3Controller::class, 'destroy'])->middleware('permission:local3s.delete');
    Route::get('work-environments', [WorkEnvironmentController::class, 'index'])->middleware('permission:work_environments.view');
    Route::post('work-environments', [WorkEnvironmentController::class, 'store'])->middleware('permission:work_environments.create');
    Route::get('work-environments/{workEnvironment}', [WorkEnvironmentController::class, 'show'])->middleware('permission:work_environments.view');
    Route::match(['put', 'patch'], 'work-environments/{workEnvironment}', [WorkEnvironmentController::class, 'update'])->middleware('permission:work_environments.update');
    Route::delete('work-environments/{workEnvironment}', [WorkEnvironmentController::class, 'destroy'])->middleware('permission:work_environments.delete');
    Route::get('work-environments/{workEnvironment}/criteria', [WorkEnvironmentCriteriaController::class, 'index'])->middleware('permission:work_environments.view');
    Route::put('work-environments/{workEnvironment}/criteria', [WorkEnvironmentCriteriaController::class, 'update'])->middleware('permission:work_environments.update');

    Route::get('verification-criteria', [VerificationCriterionController::class, 'index'])->middleware('permission:verification_criteria.view');
    Route::post('verification-criteria', [VerificationCriterionController::class, 'store'])->middleware('permission:verification_criteria.create');
    Route::get('verification-criteria/{verificationCriterion}', [VerificationCriterionController::class, 'show'])->middleware('permission:verification_criteria.view');
    Route::match(['put', 'patch'], 'verification-criteria/{verificationCriterion}', [VerificationCriterionController::class, 'update'])->middleware('permission:verification_criteria.update');
    Route::delete('verification-criteria/{verificationCriterion}', [VerificationCriterionController::class, 'destroy'])->middleware('permission:verification_criteria.delete');

    Route::get('supervisions/options', [SupervisionController::class, 'options'])->middleware('permission:supervisions.create');
    Route::get('supervisions', [SupervisionController::class, 'index'])->middleware('permission:supervisions.view');
    Route::post('supervisions', [SupervisionController::class, 'store'])->middleware('permission:supervisions.create');
    Route::get('supervisions/{supervision}', [SupervisionController::class, 'show'])->middleware('permission:supervisions.view');
    Route::match(['put', 'patch'], 'supervisions/{supervision}', [SupervisionController::class, 'update'])->middleware('permission:supervisions.update');
    Route::post('supervisions/{supervision}/send', [SupervisionController::class, 'send'])->middleware('permission:supervisions.send');
    Route::put('supervisions/{supervision}/answers', [SupervisionController::class, 'saveAnswers'])->middleware('permission:supervisions.answer');
    Route::post('supervisions/{supervision}/submit', [SupervisionController::class, 'submit'])->middleware('permission:supervisions.submit');
    Route::post('supervisions/{supervision}/finalize', [SupervisionController::class, 'finalize'])->middleware('permission:supervisions.finalize');
    Route::post('supervisions/{supervision}/assume', [SupervisionController::class, 'assume'])->middleware('permission:supervisions.assume');
    Route::delete('supervisions/{supervision}', [SupervisionController::class, 'destroy'])->middleware('permission:supervisions.delete');

    Route::get('users', [UserController::class, 'index'])->middleware('permission:users.view');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:users.create');
    Route::get('users/{user}/photo', [UserController::class, 'photo'])->middleware('permission:users.view');
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:users.view');
    Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->middleware('permission:users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

    Route::get('operators', [OperatorController::class, 'index'])->middleware('permission:operators.view');
    Route::post('operators', [OperatorController::class, 'store'])->middleware('permission:operators.create');
    Route::get('operators/{operator}', [OperatorController::class, 'show'])->middleware('permission:operators.view');
    Route::match(['put', 'patch'], 'operators/{operator}', [OperatorController::class, 'update'])->middleware('permission:operators.update');
    Route::delete('operators/{operator}', [OperatorController::class, 'destroy'])->middleware('permission:operators.delete');
});
