<?php

namespace Modules\QueueEngine\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

// Broadcasts synchronously — see TicketCalled for why (tenant-DB-unaware queue worker).
class QueueUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public int $branchId, public int $waitingCount)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel("branch.{$this->branchId}.queue")];
    }

    public function broadcastAs(): string
    {
        return 'queue.updated';
    }

    public function broadcastWith(): array
    {
        return ['waiting_count' => $this->waitingCount];
    }
}
