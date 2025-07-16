<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentSigner extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id', 
        'user_id', 
        'step', 
        'signer_type',
        'status', 
        'signed_at', 
        'rejection_reason',
        'signature_data',
        'signing_order'
    ];

    protected $casts = [
        'signed_at' => 'datetime',
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
}