<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Token-based auth only (Bearer token via Sanctum)
        // statefulApi() removed — it enforces CSRF on first-party requests
        // which conflicts with our SPA's token-based auth approach
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
