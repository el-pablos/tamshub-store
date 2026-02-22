<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PaymentMethod;
use App\Models\SiteSetting;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    // Site Settings
    public function siteSettings()
    {
        return response()->json([
            'success' => true,
            'data' => SiteSetting::all()->pluck('value', 'key'),
        ]);
    }

    public function updateSiteSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            SiteSetting::setValue($setting['key'], $setting['value']);
        }

        Cache::forget('site_settings_all');
        AuditLog::log('update_site_settings');

        return response()->json(['success' => true, 'message' => 'Pengaturan disimpan.']);
    }

    // Sliders
    public function sliders()
    {
        return response()->json([
            'success' => true,
            'data' => Slider::orderBy('sort_order')->get(),
        ]);
    }

    public function createSlider(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:200',
            'image_url' => 'required|string',
            'link_url' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $slider = Slider::create($validated);
        Cache::forget('sliders_active');

        return response()->json(['success' => true, 'data' => $slider], 201);
    }

    public function updateSlider(Request $request, int $id)
    {
        $slider = Slider::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|nullable|string|max:200',
            'image_url' => 'sometimes|string',
            'link_url' => 'sometimes|nullable|string',
            'sort_order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        $slider->update($validated);
        Cache::forget('sliders_active');

        return response()->json(['success' => true, 'data' => $slider->fresh()]);
    }

    public function deleteSlider(int $id)
    {
        Slider::findOrFail($id)->delete();
        Cache::forget('sliders_active');

        return response()->json(['success' => true, 'message' => 'Slider dihapus.']);
    }

    // Payment Methods
    public function paymentMethods()
    {
        return response()->json([
            'success' => true,
            'data' => PaymentMethod::orderBy('sort_order')->get(),
        ]);
    }

    public function updatePaymentMethod(Request $request, int $id)
    {
        $method = PaymentMethod::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
            'fee_flat' => 'sometimes|numeric|min:0',
            'fee_percent' => 'sometimes|numeric|min:0|max:100',
        ]);

        $method->update($validated);
        Cache::forget('payment_methods_active');

        return response()->json(['success' => true, 'data' => $method->fresh()]);
    }

    // System Mode
    public function updateSystemMode(Request $request)
    {
        $validated = $request->validate([
            'mode' => 'required|in:autopilot,manual',
        ]);

        SiteSetting::setValue('system_mode', $validated['mode']);
        AuditLog::log('update_system_mode', null, null, [
            'new_values' => ['mode' => $validated['mode']],
        ]);

        return response()->json(['success' => true, 'message' => 'Mode sistem diperbarui.']);
    }

    // Audit Log
    public function auditLogs(Request $request)
    {
        $query = AuditLog::with('user')->orderByDesc('created_at');

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(30),
        ]);
    }
}
