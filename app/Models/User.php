<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fname',
        'lname',
        'email',
        'password',
        'role_id',
        'position_id',
        'department_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * ความสัมพันธ์กับตาราง roles
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * ความสัมพันธ์กับตาราง departments
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * ความสัมพันธ์กับตาราง positions
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * ความสัมพันธ์กับตาราง documents (เอกสารที่สร้าง)
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * ความสัมพันธ์กับตาราง document_signers
     */
    public function documentSigners(): HasMany
    {
        return $this->hasMany(DocumentSigner::class);
    }

    /**
     * ความสัมพันธ์กับตาราง documents ผ่าน document_viewers
     */
    public function viewableDocuments(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_viewers')->withTimestamps();
    }

    /**
     * ความสัมพันธ์กับตาราง notifications
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * รวมชื่อและนามสกุล
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->fname} {$this->lname}";
    }

    /**
     * ตรวจสอบว่าผู้ใช้มีบทบาทที่กำหนดหรือไม่
     */
    public function hasRole(array|string $roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return in_array($this->role?->name, $roles);
    }
}
