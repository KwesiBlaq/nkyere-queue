<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;

class ServiceTypeController extends Controller
{
    public function index(Branch $branch)
    {
        return $branch->serviceTypes()->orderBy('name')->get(['id', 'name', 'prefix']);
    }
}
