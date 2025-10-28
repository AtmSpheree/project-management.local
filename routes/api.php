<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MotorcycleController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::post('/create_admin', [AuthController::class, 'create_admin']);
Route::post('/login', [AuthController::class, 'login']);
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [UserController::class, 'get_profile']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user_id}', [UserController::class, 'update']);
    Route::delete('/users/{user_id}', [UserController::class, 'destroy']);
    Route::get('/users/{user_id}', [UserController::class, 'get_user']);

    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project_id}', [ProjectController::class, 'get_project']);
    Route::put('/projects/{project_id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project_id}', [ProjectController::class, 'destroy']);

    Route::post('/tasks/{project_id}', [TaskController::class, 'store']);
    Route::get('/project_tasks/{project_id}', [TaskController::class, 'index']);
    Route::get('/own_tasks', [TaskController::class, 'own_tasks']);
    Route::get('/tasks/{task_id}', [TaskController::class, 'get_task']);
    Route::put('/tasks/{task_id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task_id}', [TaskController::class, 'destroy']);

    Route::put('/tasks/{task_id}/change_status', [TaskController::class, 'change_status']);

    Route::post('/tasks/{task_id}/{user_id}', [TaskController::class, 'add_task_user']);
    Route::delete('/tasks/{task_id}/{user_id}', [TaskController::class, 'delete_task_user']);
});