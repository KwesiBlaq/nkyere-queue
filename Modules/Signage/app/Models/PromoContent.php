<?php

namespace Modules\Signage\Models;

use Illuminate\Database\Eloquent\Model;

class PromoContent extends Model
{
    protected $table = 'promo_content';

    protected $fillable = [
        'branch_id', 'title', 'body', 'image_url', 'display_seconds', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
