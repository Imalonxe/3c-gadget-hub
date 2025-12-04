<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\LogsActivity;

class UserController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of the resource.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $usersQuery = \App\Models\User::select('id', 'name', 'email', 'user_type', 'email_verified_at', 'created_at', 'updated_at', 'banned_until', 'ban_reason')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->verified_filter, function ($q, $filter) {
                if ($filter === 'verified') {
                    $q->whereNotNull('email_verified_at');
                } elseif ($filter === 'unverified') {
                    $q->whereNull('email_verified_at');
                }
            });

        // Return as collection (no pagination) to keep existing UI simple.
        $users = $usersQuery->get();

        return \Inertia\Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'verified_filter'])
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit($id)
    {
        $user = \App\Models\User::findOrFail($id);
        return \Inertia\Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        // Log raw request data
        \Log::info('Raw request data:', $request->all());
        
        $user = \App\Models\User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:User,Admin',
        ]);

        // Log incoming data
        \Log::info('Update user request data:', [
            'validated' => $validated,
            'user_id' => $user->id,
            'current_user_type' => $user->user_type
        ]);

        // Convert role to user_type format
        $isAdmin = $validated['role'] === 'Admin';
        $user_type = $isAdmin ? 'admin' : 'customer';
        
        // Log what we're going to update
        \Log::info('Updating user with:', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'user_type' => $user_type,
            'is_admin' => $isAdmin
        ]);

        try {
            // Update user with correct fields
            $updated = $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'user_type' => $user_type,
                'is_admin' => $isAdmin,
            ]);

            // Log result
            \Log::info('Update result:', ['success' => $updated, 'new_user_type' => $user->fresh()->user_type]);

            if (!$updated) {
                return back()->withErrors(['update' => 'Failed to update user']);
            }

            $this->logActivity('update_user', [
                'target_user_id' => $user->id,
                'target_user_email' => $user->email,
                'changes' => $user->getChanges()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating user:', ['error' => $e->getMessage()]);
            return back()->withErrors(['update' => $e->getMessage()]);
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        // Prevent deleting self while logged in
        if (auth()->id() == $id) {
            return redirect()->route('admin.users.index')
                ->with('error', 'You cannot delete your own account while logged in.');
        }

        $user = \App\Models\User::findOrFail($id);

        // Prevent deleting the last admin
        if ($user->is_admin) {
            $adminCount = \App\Models\User::where('is_admin', true)->count();
            if ($adminCount <= 1) {
                return redirect()->route('admin.users.index')
                    ->with('error', 'Cannot delete the last administrator account.');
            }
        }

        try {
            // Optionally cleanup related resources here (avatars, sessions, etc.)
            $user->delete();

            $this->logActivity('delete_user', [
                'target_user_id' => $user->id,
                'target_user_email' => $user->email
            ]);

            return redirect()->route('admin.users.index')
                ->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting user: ' . $e->getMessage());
            return back()->withErrors(['delete' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(Request $request, $id)
    {
        // Implementation for toggling user active status
        return response()->json(['success' => true]);
    }

    /**
     * Ban the specified user.
     */
    public function ban(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);

        // Prevent banning self
        if (auth()->id() == $id) {
            return back()->withErrors(['ban' => 'You cannot ban yourself.']);
        }

        // Prevent banning other admins
        if ($user->is_admin) {
            return back()->withErrors(['ban' => 'You cannot ban an administrator.']);
        }

        $validated = $request->validate([
            'banned_until' => 'required|date|after:now',
            'ban_reason' => 'required|string|max:255',
        ]);

        \Log::info('Ban user request', [
            'user_id' => $id,
            'validated_data' => $validated,
            'raw_request' => $request->all()
        ]);

        $user->update([
            'banned_until' => $validated['banned_until'],
            'ban_reason' => $validated['ban_reason'],
        ]);

        // Refresh to get updated data
        $user = $user->fresh();

        \Log::info('User after ban', [
            'user_id' => $user->id,
            'banned_until' => $user->banned_until,
            'ban_reason' => $user->ban_reason
        ]);

        $this->logActivity('ban_user', [
            'target_user_id' => $user->id,
            'target_user_email' => $user->email,
            'banned_until' => $user->banned_until,
            'ban_reason' => $user->ban_reason
        ]);

        return back()->with('success', 'User has been banned successfully.');
    }

    /**
     * Unban the specified user.
     */
    public function unban($id)
    {
        $user = \App\Models\User::findOrFail($id);

        $user->update([
            'banned_until' => null,
            'ban_reason' => null,
        ]);

        $this->logActivity('unban_user', [
            'target_user_id' => $user->id,
            'target_user_email' => $user->email
        ]);

        return back()->with('success', 'User has been unbanned successfully.');
    }
}
