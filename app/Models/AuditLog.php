<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'module',
        'description',
        'target_type',
        'target_id',
        'ip_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to log an activity.
     */
    public static function record(string $action, string $module, string $description, ?Model $target = null): self
    {
        $user = Auth::user();

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user ? $user->name : 'Système',
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->id,
            'ip_address' => Request::ip(),
        ]);
    }
}
