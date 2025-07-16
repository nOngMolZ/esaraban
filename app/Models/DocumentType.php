<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    /**
     * ความสัมพันธ์กับตาราง documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}