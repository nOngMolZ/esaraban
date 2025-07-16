<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stamp extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'file_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * ความสัมพันธ์กับตาราง document_stamps
     */
    public function documentStamps(): HasMany
    {
        return $this->hasMany(DocumentStamp::class);
    }
} 