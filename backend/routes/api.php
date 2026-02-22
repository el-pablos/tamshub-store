<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SiteController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\LeaderboardController;
use App\Http\Controllers\Api\V1\CallbackController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\OrderManagementController;
use App\Http\Controllers\Api\V1\Admin\ProductManagementController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;
use App\Http\Controllers\Api\V1\Admin\ComplaintManagementController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;

/*
|--------------------------------------------------------------------------
| API Routes — TamsHub Store v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public ──────────────────────────────────────────
    Route::get('site/settings', [SiteController::class, 'settings']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [ProductController::class, 'categories']);
    Route::get('brands', [ProductController::class, 'brands']);
    Route::get('leaderboard', [LeaderboardController::class, 'index']);
    Route::get('payment/methods', [PaymentController::class, 'methods']);

    // ── Auth ────────────────────────────────────────────
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // ── Checkout (bisa guest, anti double) ──────────────
    Route::post('orders/checkout', [OrderController::class, 'checkout'])
        ->middleware('throttle:10,1');
    Route::get('orders/{invoice}/status', [OrderController::class, 'status']);

    // ── Callback / Webhook (no auth, tapi ada validasi) ─
    Route::post('callbacks/duitku', [CallbackController::class, 'duitku']);
    Route::post('webhooks/digiflazz', [WebhookController::class, 'digiflazz']);

    // ── Authenticated User ─────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('orders/history', [OrderController::class, 'history']);
        Route::post('orders/{order}/complaint', [OrderController::class, 'complaint']);
    });

    // ── Admin ────────────────────────────────────────────
    Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])
        ->prefix('admin')
        ->group(function () {
            // Dashboard
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);

            // Orders
            Route::get('orders', [OrderManagementController::class, 'index']);
            Route::get('orders/{id}', [OrderManagementController::class, 'show']);
            Route::post('orders/{id}/approve', [OrderManagementController::class, 'approve']);
            Route::post('orders/{id}/retry', [OrderManagementController::class, 'retry']);
            Route::get('orders-manual-queue', [OrderManagementController::class, 'manualQueue']);

            // Products
            Route::get('products', [ProductManagementController::class, 'index']);
            Route::put('products/{id}', [ProductManagementController::class, 'update']);
            Route::post('products/{id}/toggle', [ProductManagementController::class, 'toggleStatus']);
            Route::post('products/mass-toggle', [ProductManagementController::class, 'massToggle']);
            Route::post('products/sync', [ProductManagementController::class, 'syncFromProvider']);
            Route::get('products/{id}/pricing', [ProductManagementController::class, 'pricing']);
            Route::put('products/{id}/pricing', [ProductManagementController::class, 'updatePricing']);

            // Categories
            Route::get('categories', [ProductManagementController::class, 'categories']);
            Route::post('categories', [ProductManagementController::class, 'createCategory']);
            Route::put('categories/{id}', [ProductManagementController::class, 'updateCategory']);

            // Users
            Route::get('users', [UserManagementController::class, 'index']);
            Route::get('users/{id}', [UserManagementController::class, 'show']);
            Route::put('users/{id}', [UserManagementController::class, 'update']);
            Route::post('users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
            Route::post('users/{id}/toggle-active', [UserManagementController::class, 'toggleActive']);

            // Complaints
            Route::get('complaints', [ComplaintManagementController::class, 'index']);
            Route::get('complaints/{id}', [ComplaintManagementController::class, 'show']);
            Route::put('complaints/{id}/status', [ComplaintManagementController::class, 'updateStatus']);
            Route::post('complaints/{id}/reply', [ComplaintManagementController::class, 'reply']);

            // Settings
            Route::get('settings/site', [SettingsController::class, 'siteSettings']);
            Route::put('settings/site', [SettingsController::class, 'updateSiteSettings']);
            Route::get('settings/sliders', [SettingsController::class, 'sliders']);
            Route::post('settings/sliders', [SettingsController::class, 'createSlider']);
            Route::put('settings/sliders/{id}', [SettingsController::class, 'updateSlider']);
            Route::delete('settings/sliders/{id}', [SettingsController::class, 'deleteSlider']);
            Route::get('settings/payment-methods', [SettingsController::class, 'paymentMethods']);
            Route::put('settings/payment-methods/{id}', [SettingsController::class, 'updatePaymentMethod']);
            Route::put('settings/system-mode', [SettingsController::class, 'updateSystemMode']);
            Route::get('audit-logs', [SettingsController::class, 'auditLogs']);
        });
});
