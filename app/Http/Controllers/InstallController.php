<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Installer controller removed.
 *
 * This class is a lightweight stub to ensure references to the
 * controller fail cleanly. The real installer functionality has
 * been permanently removed from the application.
 */
class InstallController extends Controller
{
    public function __call($method, $parameters)
    {
        abort(404);
    }
}
