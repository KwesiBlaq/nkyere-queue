<?php

namespace Modules\QueueEngine\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Modules\QueueEngine\Models\Ticket;

/**
 * Broadcasts synchronously (not queued): a queued broadcast would be
 * deserialized by a worker process with no tenant database selected,
 * since stancl/tenancy's queue tagging doesn't cover ShouldBroadcast's
 * internal queued job. Call-outs are small and infrequent, so sync is fine.
 */
class TicketCalled implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Ticket $ticket)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel("branch.{$this->ticket->branch_id}.signage")];
    }

    public function broadcastAs(): string
    {
        return 'ticket.called';
    }

    public function broadcastWith(): array
    {
        return [
            'ticket_number' => $this->ticket->ticket_number,
            'counter_label' => $this->ticket->counter?->label,
            'priority' => $this->ticket->priority,
        ];
    }
}
