<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'surname',
        'language',
        'self_employed_activity',
        'email',
        'phone',
        'vat_number',
        'company_name',
        'street',
        'house',
        'postal_code',
        'city',
        'is_active',
        'status',
        'approved_at',
        'approved_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user that owns the company.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the company settings for the company.
     */
    public function companySetting()
    {
        return $this->hasOne(CompanySetting::class);
    }

    /**
     * Get the numbering series for the company.
     */
    public function numberingSeries()
    {
        return $this->hasMany(NumberingSeries::class);
    }

    /**
     * Get the language for the company.
     */
    public function languageRelation()
    {
        return $this->belongsTo(Language::class, 'language');
    }

    /**
     * Get the services for the company.
     */
    public function services()
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get the customers for the company.
     */
    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get the offers for the company.
     */
    public function offers()
    {
        return $this->hasMany(Offer::class);
    }

    /**
     * Get the invoices for the company.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the status relation for the company.
     */
    public function statusRelation()
    {
        return $this->belongsTo(Status::class, 'status');
    }

    /**
     * Get the user who approved the company.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include active companies.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive companies.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope a query to only include pending approval companies.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->whereHas('statusRelation', function ($q) {
            $q->where('name', 'Pending Approval')->where('for', 'companies');
        });
    }

    /**
     * Scope a query to only include approved companies.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->whereHas('statusRelation', function ($q) {
            $q->where('name', 'Approved')->where('for', 'companies');
        });
    }

    /**
     * Approve the company.
     *
     * @param int $approverId
     * @return bool
     */
    public function approve(int $approverId): bool
    {
        $approvedStatus = Status::where('name', 'Approved')->where('for', 'companies')->first();
        
        return $this->update([
            'status' => $approvedStatus?->id,
            'approved_at' => now(),
            'approved_by' => $approverId,
            'is_active' => true,
        ]);
    }

    /**
     * Reject the company.
     *
     * @return bool
     */
    public function reject(): bool
    {
        $rejectedStatus = Status::where('name', 'Rejected')->where('for', 'companies')->first();
        
        return $this->update([
            'status' => $rejectedStatus?->id,
            'is_active' => false,
        ]);
    }

    /**
     * Suspend the company.
     *
     * @return bool
     */
    public function suspend(): bool
    {
        $suspendedStatus = Status::where('name', 'Suspended')->where('for', 'companies')->first();
        
        return $this->update([
            'status' => $suspendedStatus?->id,
            'is_active' => false,
        ]);
    }

    /**
     * Activate the company.
     *
     * @return bool
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the company.
     *
     * @return bool
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Check if the company is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Check if the company is pending approval.
     *
     * @return bool
     */
    public function isPendingApproval(): bool
    {
        return $this->statusRelation && $this->statusRelation->name === 'Pending Approval';
    }

    /**
     * Check if the company is approved.
     *
     * @return bool
     */
    public function isApproved(): bool
    {
        return $this->statusRelation && $this->statusRelation->name === 'Approved';
    }
}
