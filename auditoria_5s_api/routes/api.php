<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\EvaluationDimensionController;
use App\Http\Controllers\Api\EvaluationModelController;
use App\Http\Controllers\Api\MethodologyController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\ProcessController;
use App\Http\Controllers\Api\PublicAssessmentController;
use App\Http\Controllers\Api\PublicAssessmentEvidenceController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuestionnaireController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Olá, mundo!',
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::get('/public/assessments/{accessCode}', [PublicAssessmentController::class, 'showByAccessCode']);
Route::post('/public/assessments/{accessCode}/answers', [PublicAssessmentController::class, 'saveAnswers']);
Route::post('/public/assessments/{accessCode}/complete', [PublicAssessmentController::class, 'complete']);
Route::get('/public/assessments/{accessCode}/answers/{answer}/evidences/{evidence}/file', [PublicAssessmentEvidenceController::class, 'showFile'])
    ->name('public.assessment.evidences.show');
Route::post('/public/assessments/{accessCode}/answers/{answer}/evidences', [PublicAssessmentEvidenceController::class, 'store']);
Route::delete('/public/assessments/{accessCode}/answers/{answer}/evidences/{evidence}', [PublicAssessmentEvidenceController::class, 'destroy']);

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('organizations', [OrganizationController::class, 'index'])->middleware('permission:organizations.view');
    Route::post('organizations', [OrganizationController::class, 'store'])->middleware('permission:organizations.create');
    Route::get('organizations/{organization}', [OrganizationController::class, 'show'])->middleware('permission:organizations.view');
    Route::match(['put', 'patch'], 'organizations/{organization}', [OrganizationController::class, 'update'])->middleware('permission:organizations.update');
    Route::delete('organizations/{organization}', [OrganizationController::class, 'destroy'])->middleware('permission:organizations.delete');

    Route::get('units', [UnitController::class, 'index'])->middleware('permission:units.view');
    Route::post('units', [UnitController::class, 'store'])->middleware('permission:units.create');
    Route::get('units/{unit}', [UnitController::class, 'show'])->middleware('permission:units.view');
    Route::match(['put', 'patch'], 'units/{unit}', [UnitController::class, 'update'])->middleware('permission:units.update');
    Route::delete('units/{unit}', [UnitController::class, 'destroy'])->middleware('permission:units.delete');

    Route::get('sectors', [SectorController::class, 'index'])->middleware('permission:sectors.view');
    Route::post('sectors', [SectorController::class, 'store'])->middleware('permission:sectors.create');
    Route::get('sectors/{sector}', [SectorController::class, 'show'])->middleware('permission:sectors.view');
    Route::match(['put', 'patch'], 'sectors/{sector}', [SectorController::class, 'update'])->middleware('permission:sectors.update');
    Route::delete('sectors/{sector}', [SectorController::class, 'destroy'])->middleware('permission:sectors.delete');

    Route::get('processes', [ProcessController::class, 'index'])->middleware('permission:processes.view');
    Route::post('processes', [ProcessController::class, 'store'])->middleware('permission:processes.create');
    Route::get('processes/{process}', [ProcessController::class, 'show'])->middleware('permission:processes.view');
    Route::match(['put', 'patch'], 'processes/{process}', [ProcessController::class, 'update'])->middleware('permission:processes.update');
    Route::delete('processes/{process}', [ProcessController::class, 'destroy'])->middleware('permission:processes.delete');

    Route::get('activities', [ActivityController::class, 'index'])->middleware('permission:activities.view');
    Route::post('activities', [ActivityController::class, 'store'])->middleware('permission:activities.create');
    Route::post('activities/reorder', [ActivityController::class, 'reorder'])->middleware('permission:activities.update');
    Route::get('activities/{activity}', [ActivityController::class, 'show'])->middleware('permission:activities.view');
    Route::match(['put', 'patch'], 'activities/{activity}', [ActivityController::class, 'update'])->middleware('permission:activities.update');
    Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])->middleware('permission:activities.delete');

    Route::get('methodologies', [MethodologyController::class, 'index'])->middleware('permission:methodologies.view');
    Route::post('methodologies', [MethodologyController::class, 'store'])->middleware('permission:methodologies.create');
    Route::get('methodologies/{methodology}', [MethodologyController::class, 'show'])->middleware('permission:methodologies.view');
    Route::match(['put', 'patch'], 'methodologies/{methodology}', [MethodologyController::class, 'update'])->middleware('permission:methodologies.update');
    Route::delete('methodologies/{methodology}', [MethodologyController::class, 'destroy'])->middleware('permission:methodologies.delete');

    Route::get('evaluation-dimensions', [EvaluationDimensionController::class, 'index'])->middleware('permission:evaluation_dimensions.view');
    Route::post('evaluation-dimensions', [EvaluationDimensionController::class, 'store'])->middleware('permission:evaluation_dimensions.create');
    Route::post('evaluation-dimensions/reorder', [EvaluationDimensionController::class, 'reorder'])->middleware('permission:evaluation_dimensions.update');
    Route::get('evaluation-dimensions/{evaluationDimension}', [EvaluationDimensionController::class, 'show'])->middleware('permission:evaluation_dimensions.view');
    Route::match(['put', 'patch'], 'evaluation-dimensions/{evaluationDimension}', [EvaluationDimensionController::class, 'update'])->middleware('permission:evaluation_dimensions.update');
    Route::delete('evaluation-dimensions/{evaluationDimension}', [EvaluationDimensionController::class, 'destroy'])->middleware('permission:evaluation_dimensions.delete');

    Route::get('evaluation-models', [EvaluationModelController::class, 'index'])->middleware('permission:evaluation_models.view');
    Route::post('evaluation-models', [EvaluationModelController::class, 'store'])->middleware('permission:evaluation_models.create');
    Route::get('evaluation-models/{evaluationModel}', [EvaluationModelController::class, 'show'])->middleware('permission:evaluation_models.view');
    Route::match(['put', 'patch'], 'evaluation-models/{evaluationModel}', [EvaluationModelController::class, 'update'])->middleware('permission:evaluation_models.update');
    Route::delete('evaluation-models/{evaluationModel}', [EvaluationModelController::class, 'destroy'])->middleware('permission:evaluation_models.delete');

    Route::get('people', [PersonController::class, 'index'])->middleware('permission:people.view');
    Route::post('people', [PersonController::class, 'store'])->middleware('permission:people.create');
    Route::get('people/{person}/photo', [PersonController::class, 'photo'])->middleware('permission:people.view');
    Route::get('people/{person}', [PersonController::class, 'show'])->middleware('permission:people.view');
    Route::match(['put', 'patch'], 'people/{person}', [PersonController::class, 'update'])->middleware('permission:people.update');
    Route::delete('people/{person}', [PersonController::class, 'destroy'])->middleware('permission:people.delete');

    Route::get('users', [UserController::class, 'index'])->middleware('permission:users.view');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:users.create');
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:users.view');
    Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->middleware('permission:users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

    Route::get('questionnaires', [QuestionnaireController::class, 'index'])->middleware('permission:questionnaires.view');
    Route::post('questionnaires', [QuestionnaireController::class, 'store'])->middleware('permission:questionnaires.create');
    Route::get('questionnaires/{questionnaire}', [QuestionnaireController::class, 'show'])->middleware('permission:questionnaires.view');
    Route::match(['put', 'patch'], 'questionnaires/{questionnaire}', [QuestionnaireController::class, 'update'])->middleware('permission:questionnaires.update');
    Route::delete('questionnaires/{questionnaire}', [QuestionnaireController::class, 'destroy'])->middleware('permission:questionnaires.delete');

    Route::get('questions/categories', [QuestionController::class, 'categories'])->middleware('permission:questions.view');
    Route::get('questions', [QuestionController::class, 'index'])->middleware('permission:questions.view');
    Route::post('questions', [QuestionController::class, 'store'])->middleware('permission:questions.create');
    Route::post('questions/reorder', [QuestionController::class, 'reorder'])->middleware('permission:questions.update');
    Route::get('questions/{question}', [QuestionController::class, 'show'])->middleware('permission:questions.view');
    Route::match(['put', 'patch'], 'questions/{question}', [QuestionController::class, 'update'])->middleware('permission:questions.update');
    Route::delete('questions/{question}', [QuestionController::class, 'destroy'])->middleware('permission:questions.delete');

    Route::get('assessments/statuses', [AssessmentController::class, 'statuses'])->middleware('permission:assessments.view');
    Route::get('assessments', [AssessmentController::class, 'index'])->middleware('permission:assessments.view');
    Route::post('assessments', [AssessmentController::class, 'store'])->middleware('permission:assessments.create');
    Route::get('assessments/{assessment}', [AssessmentController::class, 'show'])->middleware('permission:assessments.view');
    Route::match(['put', 'patch'], 'assessments/{assessment}', [AssessmentController::class, 'update'])->middleware('permission:assessments.update');
    Route::delete('assessments/{assessment}', [AssessmentController::class, 'destroy'])->middleware('permission:assessments.delete');
});
