<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request) {
        $user = Auth::user();
        if ($user->role) {
            $users = User::where('role', false)->get();
            return UserResource::collection($users);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function store(StoreUserRequest $request) {
        $user = Auth::user();
        if ($user->role) {
            $new_user = new User($request->all());
            $new_user->role = 0;
            $new_user->save();
            return response()->json(['data' => new UserResource($new_user)], 201);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function get_user(Request $request, $user_id) {
        $user = Auth::user();
        if ($user->role) {
            $result_user = User::where('id', $user_id)->first();
            if ($result_user) {
                return response()->json(['data' => new UserResource($result_user)]);
            }
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function update(UpdateUserRequest $request, $user_id) {
        $user = Auth::user();
        if ($user->role) {
            $result_user = User::where('id', $user_id);
            if ($result_user->first()) {
                if ($result_user->first()->role and $user_id != $user->id) {
                    return response()->json(['message' => 'Forbidden.'], 403);
                }
                $result_user->update($request->only(['fullname']));
                if ($request->has('password')) {
                    $result_user->update(['password' => Hash::make($request->input('password'))]);
                }
                return response()->json(['data' => new UserResource($result_user->first())]);
            }
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function destroy(Request $request, $user_id) {
        $user = Auth::user();
        if ($user->role) {
            $result_user = User::where('id', $user_id);
            if ($result_user->first()) {
                if ($result_user->first()->role and $user_id != $user->id) {
                    return response()->json(['message' => 'Forbidden.'], 403);
                }
                $result_user->delete();
                return response()->noContent();
            }
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    public function get_profile(Request $request) {
        $user = Auth::user();
        return new UserResource($user);
    }
}
