<?php

namespace Modules\QueueEngine\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'branch_id', 'service_type_id', 'counter_id', 'served_by', 'ticket_number',
        'sequence', 'status', 'priority', 'called_at', 'served_at', 'completed_at',
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'served_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function counter(): BelongsTo
    {
        return $this->belongsTo(Counter::class);
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(TicketEvent::class);
    }
}
