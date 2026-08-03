<?php

namespace Modules\QueueEngine\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Signage\Models\PromoContent;

class Branch extends Model
{
    protected $fillable = ['name', 'code', 'timezone'];

    public function serviceTypes(): HasMany
    {
        return $this->hasMany(ServiceType::class);
    }

    public function counters(): HasMany
    {
        return $this->hasMany(Counter::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function promoContent(): HasMany
    {
        return $this->hasMany(PromoContent::class);
    }
}
