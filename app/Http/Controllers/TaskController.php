<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeStatusRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\AdminTaskResource;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request, $project_id) {
        $user = Auth::user();
        if ($user->role) {
            $project = Project::where('id', $project_id)->first();
            if ($project) {
                return response()->json(['data' => AdminTaskResource::collection($project->tasks)]);
            }
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function store(StoreTaskRequest $request, $project_id) {
        $user = Auth::user();
        if ($user->role) {
            $project = Project::where('id', $project_id)->first();
            if ($project) {
                $task = new Task($request->all());
                $task->project_id = $project_id;
                $task->save();
                return response()->json(['data' => new AdminTaskResource($task)]);
            }
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function get_task(Request $request, $task_id) {
        $user = Auth::user();
        $task = Task::where('id', $task_id)->first();
        if ($task) {
            if ($user->id == $task->project->user->id) {
                return response()->json(['data' => new AdminTaskResource($task)]);
            }
            foreach ($task->users as $check_user) {
                if ($check_user->id == $user->id) {
                    return response()->json(['data' => new TaskResource($task)]);
                }
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function update(UpdateTaskRequest $request, $task_id) {
        $user = Auth::user();
        $task = Task::where('id', $task_id);
        if ($task->first()) {
            if ($user->id == $task->first()->project->user->id) {
                $task->update($request->only(['name', 'description', 'starting_date', 'ending_date', 'status', 'priority']));
                return response()->json(['data' => new AdminTaskResource($task->first())]);
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function destroy(Request $request, $task_id) {
        $user = Auth::user();
        $task = Task::where('id', $task_id);
        if ($task->first()) {
            if ($user->id == $task->first()->project->user->id) {
                $task->delete();
                return response()->noContent(204);
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function own_tasks(Request $request) {
        $user = Auth::user();
        return response()->json(['data' => TaskResource::collection($user->tasks)]);
    }

    public function change_status(ChangeStatusRequest $request, $task_id) {
        $user = Auth::user();
        $task = Task::where('id', $task_id);
        if ($task->first()) {
            foreach ($user->tasks as $check_task) {
                if ($check_task->id == $task->first()->id) {
                    $task->update($request->only(['status']));
                    return response()->json(['data' => new TaskResource($task->first())]);
                }
            }
        return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function add_task_user(Request $request, $task_id, $user_id) {
        $user = Auth::user();
        if ($user->role) {
            $task = Task::where('id', $task_id)->first();
            if ($task) {
                $check_user = User::where('id', $user_id)->first();
                if ($check_user) {
                    if ($check_user->role or $check_user->id == $user->id) {
                        return response()->json(['message' => 'Forbidden.'], 403);
                    }
                    foreach ($task->users as $test_user) {
                        if ($test_user->id == $check_user->id) {
                            return response()->json(['message' => 'User is already attached.'], 400);
                        }
                    }
                    $task->users()->attach($check_user->id);
                    return response()->json(['data' => new AdminTaskResource(Task::where('id', $task_id)->first())]);
                }
                return response()->json(['message' => 'User not found.'], 404);
            }
            return response()->json(['message' => 'Task not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function delete_task_user(Request $request, $task_id, $user_id) {
        $user = Auth::user();
        if ($user->role) {
            $task = Task::where('id', $task_id)->first();
            if ($task) {
                $check_user = User::where('id', $user_id)->first();
                if ($check_user) {
                    if ($check_user->role or $check_user->id == $user->id) {
                        return response()->json(['message' => 'Forbidden.'], 403);
                    }
                    $flag = false;
                    foreach ($task->users as $test_user) {
                        if ($test_user->id == $check_user->id) {
                            $flag = true;
                            break;
                        }
                    }
                    if (!$flag) {
                        return response()->json(['message' => 'User is not attached.'], 400);
                    }
                    $task->users()->detach($check_user->id);
                    return response()->json(['data' => new AdminTaskResource(Task::where('id', $task_id)->first())]);
                }
                return response()->json(['message' => 'User not found.'], 404);
            }
            return response()->json(['message' => 'Task not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }
}
