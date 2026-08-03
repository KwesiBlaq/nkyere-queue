<?php

namespace Modules\QueueEngine\Services;

use Illuminate\Support\Facades\DB;
use Modules\DeviceBridge\DTOs\PrintableTicket;
use Modules\DeviceBridge\Jobs\PrintTicketJob;
use Modules\QueueEngine\Events\QueueUpdated;
use Modules\QueueEngine\Events\TicketCalled;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Counter;
use Modules\QueueEngine\Models\ServiceType;
use Modules\QueueEngine\Models\Ticket;

class TicketService
{
    public function issueTicket(Branch $branch, ServiceType $serviceType, string $priority = 'normal'): Ticket
    {
        return DB::transaction(function () use ($branch, $serviceType, $priority) {
            $sequence = Ticket::where('service_type_id', $serviceType->id)
                ->whereDate('created_at', now()->toDateString())
                ->max('sequence') + 1;

            $ticket = Ticket::create([
                'branch_id' => $branch->id,
                'service_type_id' => $serviceType->id,
                'ticket_number' => $serviceType->prefix.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT),
                'sequence' => $sequence,
                'status' => 'waiting',
                'priority' => $priority,
            ]);

            $ticket->events()->create(['event' => 'issued']);

            PrintTicketJob::dispatch(new PrintableTicket(
                branchName: $branch->name,
                serviceTypeName: $serviceType->name,
                ticketNumber: $ticket->ticket_number,
                issuedAt: $ticket->created_at,
            ));

            $this->broadcastQueueState($branch);

            return $ticket;
        });
    }

    public function callNext(Counter $counter, ?int $servedBy = null): ?Ticket
    {
        return DB::transaction(function () use ($counter, $servedBy) {
            $ticket = Ticket::where('branch_id', $counter->branch_id)
                ->where('status', 'waiting')
                ->orderByRaw("case priority when 'normal' then 1 else 0 end")
                ->orderBy('sequence')
                ->lockForUpdate()
                ->first();

            if (! $ticket) {
                return null;
            }

            $ticket->update([
                'status' => 'called',
                'counter_id' => $counter->id,
                'served_by' => $servedBy,
                'called_at' => now(),
            ]);

            $ticket->events()->create(['event' => 'called', 'counter_id' => $counter->id]);

            $ticket->load('counter');
            TicketCalled::dispatch($ticket);
            $this->broadcastQueueState($counter->branch);

            return $ticket;
        });
    }

    public function startServing(Ticket $ticket): Ticket
    {
        $ticket->update(['status' => 'serving', 'served_at' => now()]);
        $ticket->events()->create(['event' => 'serving', 'counter_id' => $ticket->counter_id]);

        return $ticket;
    }

    public function complete(Ticket $ticket): Ticket
    {
        $ticket->update(['status' => 'done', 'completed_at' => now()]);
        $ticket->events()->create(['event' => 'done', 'counter_id' => $ticket->counter_id]);

        return $ticket;
    }

    public function markNoShow(Ticket $ticket): Ticket
    {
        $ticket->update(['status' => 'no_show', 'completed_at' => now()]);
        $ticket->events()->create(['event' => 'no_show', 'counter_id' => $ticket->counter_id]);

        return $ticket;
    }

    private function broadcastQueueState(Branch $branch): void
    {
        $waiting = Ticket::where('branch_id', $branch->id)->where('status', 'waiting')->count();
        QueueUpdated::dispatch($branch->id, $waiting);
    }
}
