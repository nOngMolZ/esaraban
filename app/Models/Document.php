<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'current_file_path',
        'document_type_id',
        'user_id',
        'is_public',
        'access_type',
        'status',
        'current_step',
        'completed_at',
        'is_fully_signed'  // เพิ่มฟิลด์ is_fully_signed
    ];

    // เพิ่ม cast เพื่อแปลงค่าให้เป็น boolean
    protected $casts = [
        'is_public' => 'boolean',
        'is_fully_signed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับตาราง document_types
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * ความสัมพันธ์กับตาราง users (ผู้สร้างเอกสาร)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ความสัมพันธ์กับตาราง document_signers
     */
    public function signers(): HasMany
    {
        return $this->hasMany(DocumentSigner::class);
    }

    /**
     * ความสัมพันธ์กับตาราง users ผ่าน document_viewers
     */
    public function viewers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'document_viewers')->withTimestamps();
    }

    /**
     * ความสัมพันธ์กับตาราง document_recipients
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    /**
     * ความสัมพันธ์กับตาราง document_stamps
     */
    public function stamps(): HasMany
    {
        return $this->hasMany(DocumentStamp::class);
    }

    /**
     * ตรวจสอบว่าผู้ใช้คนปัจจุบันเป็นผู้ลงนามในขั้นตอนปัจจุบันหรือไม่
     */
    public function isCurrentUserSigner(): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return $this->signers()
            ->where('user_id', Auth::id())
            ->where('step', $this->current_step)
            ->where('status', 'waiting')
            ->exists();
    }

    /**
     * ตรวจสอบว่าเอกสารเสร็จสิ้นกระบวนการแล้วหรือไม่
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && $this->completed_at !== null;
    }

    /**
     * ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงเอกสารหรือไม่
     */
    public function userCanAccess(User $user): bool
    {
        // แอดมินเข้าถึงได้ทุกเอกสาร
        if ($user->role?->name === 'แอดมิน') {
            return true;
        }

        // เจ้าของเอกสาร
        if ($this->user_id === $user->id) {
            return true;
        }

        // เอกสารสาธารณะ
        if ($this->is_public && $this->access_type === 'public') {
            return true;
        }

        // ผู้รับเอกสารที่กำหนด
        if ($this->recipients()->where('user_id', $user->id)->exists()) {
            return true;
        }

        // ผู้ที่ได้รับมอบหมายดูเอกสาร
        if ($this->viewers()->where('user_id', $user->id)->exists()) {
            return true;
        }

        // ผู้ลงนาม
        if ($this->signers()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }
}
