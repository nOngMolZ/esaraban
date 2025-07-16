<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentStamp extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'stamp_id',
        'user_id',
        'position_data',
        'page_number',
    ];

    protected $casts = [
        'position_data' => 'array',
    ];

    /**
     * ความสัมพันธ์กับตาราง documents
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * ความสัมพันธ์กับตาราง stamps
     */
    public function stamp(): BelongsTo
    {
        return $this->belongsTo(Stamp::class);
    }

    /**
     * ความสัมพันธ์กับตาราง users (ผู้เพิ่มตรา)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 