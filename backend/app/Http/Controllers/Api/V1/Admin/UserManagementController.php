<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        if ($level = $request->input('member_level')) {
            $query->where('member_level', $level);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('created_at')->paginate(20),
        ]);
    }

    public function show(int $id)
    {
        $user = User::withCount('orders')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|in:admin,user',
            'member_level' => 'sometimes|in:guest,bronze,silver,gold,reseller',
            'is_active' => 'sometimes|boolean',
        ]);

        $old = $user->toArray();
        $user->update($validated);

        AuditLog::log('update_user', 'User', $id, [
            'old_values' => $old,
            'new_values' => $validated,
        ]);

        return response()->json(['success' => true, 'data' => $user->fresh()]);
    }

    public function resetPassword(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        $newPassword = $request->input('password', 'TamsHub123!');
        $user->update(['password' => Hash::make($newPassword)]);

        AuditLog::log('reset_password', 'User', $id);

        return response()->json(['success' => true, 'message' => 'Password direset.']);
    }

    public function toggleActive(int $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'data' => ['is_active' => $user->is_active],
        ]);
    }
}
