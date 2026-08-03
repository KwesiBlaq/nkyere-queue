<?php

namespace Modules\Signage\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;

class PromoContentController extends Controller
{
    public function index(Branch $branch)
    {
        return $branch->promoContent()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'body', 'image_url', 'display_seconds']);
    }
}
