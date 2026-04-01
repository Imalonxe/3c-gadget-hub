<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Traits\LogsActivity;

class AnnouncementController extends Controller
{
    use LogsActivity;
    public function index()
    {
        $announcements = Announcement::latest()->get();
        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'canCreate' => Announcement::count() === 0
        ]);
    }

    public function create()
    {
        if (Announcement::count() > 0) {
            return redirect()->route('admin.announcements.index')
                ->with('error', 'You can only have one announcement. Please edit the existing one.');
        }
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        if (Announcement::count() > 0) {
            return redirect()->route('admin.announcements.index')
                ->with('error', 'You can only have one announcement. Please edit the existing one.');
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:10240', // 10MB Max
            'content' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        Announcement::create($data);

        $this->logActivity('create_announcement', [
            'title' => $data['title'] ?? 'Untitled'
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Create', [
            'announcement' => $announcement
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:10240', // 10MB Max
            'content' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'remove_image' => 'boolean'
        ]);

        $data = $request->except(['image', 'remove_image']);

        if ($request->boolean('remove_image')) {
            if ($announcement->image_path) {
                $oldPath = str_replace('/storage/', '', $announcement->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $data['image_path'] = null;
        }

        if ($request->hasFile('image')) {
            // Delete old image
            if ($announcement->image_path) {
                $oldPath = str_replace('/storage/', '', $announcement->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('image')->store('announcements', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        $announcement->update($data);

        $this->logActivity('update_announcement', [
            'id' => $announcement->id,
            'changes' => $announcement->getChanges()
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->image_path) {
            $oldPath = str_replace('/storage/', '', $announcement->image_path);
            Storage::disk('public')->delete($oldPath);
        }
        
        $announcement->delete();

        $this->logActivity('delete_announcement', [
            'id' => $announcement->id,
            'title' => $announcement->title
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }
}
