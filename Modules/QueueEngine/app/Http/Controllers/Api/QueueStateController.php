<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\QueueEngine\Http\Resources\TicketResource;
use Modules\QueueEngine\Models\Branch;

class QueueStateController extends Controller
{
    public function show(Branch $branch)
    {
        $waiting = $branch->tickets()
            ->where('status', 'waiting')
            ->with('serviceType', 'counter')
            ->orderByRaw("case priority when 'normal' then 1 else 0 end")
            ->orderBy('sequence')
            ->get();

        $inService = $branch->tickets()
            ->whereIn('status', ['called', 'serving'])
            ->with('serviceType', 'counter')
            ->get();

        return response()->json([
            'waiting_count' => $waiting->count(),
            'waiting' => TicketResource::collection($waiting),
            'in_service' => TicketResource::collection($inService),
        ]);
    }
}
