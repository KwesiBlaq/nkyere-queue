<?php

namespace Modules\QueueEngine\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'status' => $this->status,
            'priority' => $this->priority,
            'service_type' => $this->serviceType->name,
            'counter' => $this->counter?->label,
            'called_at' => $this->called_at,
            'served_at' => $this->served_at,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
        ];
    }
}
