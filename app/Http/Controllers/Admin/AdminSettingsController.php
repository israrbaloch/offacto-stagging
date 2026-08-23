<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Display all site settings.
     */
    public function index()
    {
        $settings = SiteSetting::allGrouped();

        return view('admin.settings.index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update site settings.
     */
    public function update(Request $request)
    {
        $settings = SiteSetting::all();
        
        foreach ($settings as $setting) {
            $key = $setting->key;
            
            if ($request->has($key)) {
                $value = $request->input($key);
                
                // Handle boolean values (checkboxes)
                if ($setting->type === 'boolean') {
                    $value = $request->has($key) ? '1' : '0';
                }
                
                $setting->update(['value' => $value]);
            } elseif ($setting->type === 'boolean') {
                // Unchecked checkboxes don't appear in request
                $setting->update(['value' => '0']);
            }
        }

        // Clear the settings cache
        SiteSetting::clearCache();

        return back()->with('status', 'settings-updated');
    }
}
