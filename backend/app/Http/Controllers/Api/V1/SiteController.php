<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\Slider;
use Illuminate\Support\Facades\Cache;

class SiteController extends Controller
{
    public function settings()
    {
        $settings = SiteSetting::getAllSettings();
        $sliders = Cache::remember('sliders_active', 3600, function () {
            return Slider::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'title', 'image_url', 'link_url']);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'site_name' => $settings['site_name'] ?? 'TamsHub Store',
                'site_description' => $settings['site_description'] ?? 'Menyediakan segala kebutuhan online anda dengan harga terjangkau, proses cepat, dan layanan 24/7.',
                'site_logo' => $settings['site_logo'] ?? null,
                'site_favicon' => $settings['site_favicon'] ?? null,
                'admin_whatsapp' => $settings['admin_whatsapp'] ?? '',
                'hero_text' => $settings['hero_text'] ?? 'Top Up Game & Online Service',
                'meta_title' => $settings['meta_title'] ?? 'TamsHub Store | Top Up Game & Online Service',
                'meta_description' => $settings['meta_description'] ?? 'Platform top up game dan layanan online terpercaya.',
                'system_mode' => $settings['system_mode'] ?? config('services.system_mode', 'autopilot'),
                'sliders' => $sliders,
            ],
        ]);
    }
}
