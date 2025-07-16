<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'user_id',
        'recipient_type',
        'accessed_at',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับตาราง documents
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * ความสัมพันธ์กับตาราง users
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark ว่าผู้ใช้เข้าถึงเอกสารแล้ว
     */
    public function markAsAccessed(): void
    {
        $this->update(['accessed_at' => now()]);
    }
}
