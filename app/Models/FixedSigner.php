<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedSigner extends Model
{
    use HasFactory;

    protected $fillable = [
        'position_type',
        'user_id',
        'priority_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * ความสัมพันธ์กับตาราง users
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 