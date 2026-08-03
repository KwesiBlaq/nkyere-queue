<?php

namespace Modules\QueueEngine\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Counter extends Model
{
    protected $fillable = ['branch_id', 'label', 'is_open'];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function currentTicket(): ?Ticket
    {
        return $this->tickets()->where('status', 'serving')->first();
    }
}
