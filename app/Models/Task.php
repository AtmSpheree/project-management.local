<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'starting_date',
        'ending_date',
        'status',
        'priority'
    ];

    public function users() {
        return $this->belongsToMany(User::class);
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }
}
