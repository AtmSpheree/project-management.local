<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request) {
        $user = Auth::user();
        if ($user->role) {
            return response()->json(['data' => ProjectResource::collection($user->projects)]);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function store(StoreProjectRequest $request) {
        $user = Auth::user();
        if ($user->role) {
            $project = new Project($request->all());
            $project->user_id = $user->id;
            $project->save();
            return response()->json(['data' => new ProjectResource($project)]);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function get_project(Request $request, $project_id) {
        $user = Auth::user();
        $project = Project::where('id', $project_id)->first();
        if ($project) {
            if ($user->id == $project->user->id) {
                return response()->json(['data' => new ProjectResource($project)]);
            }
            foreach ($project->tasks as $task) {
                foreach ($task->users as $check_user) {
                    if ($check_user->id == $user->id) {
                        return response()->json(['data' => new ProjectResource($project)]);
                    }
                }
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function update(UpdateProjectRequest $request, $project_id) {
        $user = Auth::user();
        $project = Project::where('id', $project_id);
        if ($project->first()) {
            if ($user->id == $project->first()->user->id) {
                $project->update($request->only(['name', 'description', 'starting_date', 'ending_date']));
                return response()->json(['data' => new ProjectResource($project->first())]);
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function destroy(Request $request, $project_id) {
        $user = Auth::user();
        $project = Project::where('id', $project_id);
        if ($project->first()) {
            if ($user->id == $project->first()->user->id) {
                $project->delete();
                return response()->noContent(204);
            }
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }
}
