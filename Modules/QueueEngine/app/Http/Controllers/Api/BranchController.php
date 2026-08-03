<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;

class BranchController extends Controller
{
    /**
     * Phase 1 is single-branch-per-tenant, so the kiosk/teller/signage
     * clients don't need a branch picker — they just ask for "the" branch.
     */
    public function current()
    {
        return Branch::firstOrFail(['id', 'name', 'code']);
    }
}
