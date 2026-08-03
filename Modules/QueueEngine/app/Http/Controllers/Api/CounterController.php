<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;

class CounterController extends Controller
{
    public function index(Branch $branch)
    {
        return $branch->counters()->where('is_open', true)->orderBy('label')->get(['id', 'label']);
    }
}
