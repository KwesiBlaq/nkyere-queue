<?php

use Illuminate\Support\Facades\Route;

// Serves the React SPA shell on any domain (central or tenant) — the app
// itself figures out what to render from the path; API calls it makes are
// what actually get tenant-scoped, via routes/tenant.php. Route::fallback()
// only activates when no other route (including tenant.php's /api/*) matches,
// regardless of registration order.
Route::fallback(function () {
    return view('app');
});
