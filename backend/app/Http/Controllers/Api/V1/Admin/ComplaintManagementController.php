<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintMessage;
use App\Models\ComplaintTicket;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ComplaintManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplaintTicket::with(['order', 'user']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('created_at')->paginate(20),
        ]);
    }

    public function show(int $id)
    {
        $ticket = ComplaintTicket::with(['order.product', 'user', 'messages.user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $ticket = ComplaintTicket::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:open,on_progress,resolved,rejected',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $ticket->update($validated);

        AuditLog::log('update_ticket_status', 'ComplaintTicket', $id);

        return response()->json(['success' => true, 'data' => $ticket->fresh()]);
    }

    public function reply(Request $request, int $id)
    {
        $ticket = ComplaintTicket::findOrFail($id);
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $reply = ComplaintMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'sender_type' => 'admin',
            'message' => $validated['message'],
        ]);

        return response()->json(['success' => true, 'data' => $reply], 201);
    }
}
