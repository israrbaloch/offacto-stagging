<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportKnowledgeArticle extends Model
{
    protected $fillable = ['slug', 'title', 'category', 'body', 'published'];
}
