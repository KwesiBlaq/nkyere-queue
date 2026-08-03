<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\QueueEngine\Http\Resources\TicketResource;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Counter;
use Modules\QueueEngine\Models\ServiceType;
use Modules\QueueEngine\Models\Ticket;
use Modules\QueueEngine\Services\TicketService;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $tickets)
    {
    }

    public function store(Request $request, Branch $branch)
    {
        $data = $request->validate([
            'service_type_id' => 'required|integer|exists:service_types,id',
            'priority' => 'in:normal,vip,accessibility',
        ]);

        $serviceType = ServiceType::where('branch_id', $branch->id)->findOrFail($data['service_type_id']);

        $ticket = $this->tickets->issueTicket($branch, $serviceType, $data['priority'] ?? 'normal');

        return new TicketResource($ticket->load('serviceType', 'counter'));
    }

    public function callNext(Request $request, Counter $counter)
    {
        $ticket = $this->tickets->callNext($counter, $request->user()->id);

        if (! $ticket) {
            return response()->json(['message' => 'No tickets waiting.'], 404);
        }

        return new TicketResource($ticket->load('serviceType', 'counter'));
    }

    public function serve(Ticket $ticket)
    {
        return new TicketResource($this->tickets->startServing($ticket)->load('serviceType', 'counter'));
    }

    public function complete(Ticket $ticket)
    {
        return new TicketResource($this->tickets->complete($ticket)->load('serviceType', 'counter'));
    }

    public function noShow(Ticket $ticket)
    {
        return new TicketResource($this->tickets->markNoShow($ticket)->load('serviceType', 'counter'));
    }
}
