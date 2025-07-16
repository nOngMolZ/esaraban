<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DocumentViewer extends Pivot
{
    protected $table = 'document_viewers';
}