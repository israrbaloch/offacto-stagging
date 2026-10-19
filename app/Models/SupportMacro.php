<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportMacro extends Model
{
    protected $fillable = ['title', 'category', 'body', 'shortcut'];
}
