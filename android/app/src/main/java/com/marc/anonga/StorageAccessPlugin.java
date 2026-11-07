package com.marc.anonga;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Reports and requests the Android "All files access" permission, which the app
 * needs to keep its automatic backup in Documents on Android 11 and newer.
 */
@CapacitorPlugin(name = "StorageAccess")
public class StorageAccessPlugin extends Plugin {

    @PluginMethod
    public void isGranted(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasAllFilesAccess());
        call.resolve(result);
    }

    @PluginMethod
    public void request(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasAllFilesAccess());

        if (hasAllFilesAccess() || Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            call.resolve(result);
            return;
        }

        try {
            Intent intent = new Intent(
                Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                Uri.parse("package:" + getContext().getPackageName())
            );
            getActivity().startActivity(intent);
        } catch (Exception appIntentError) {
            try {
                getActivity().startActivity(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
            } catch (Exception settingsIntentError) {
                call.reject("Could not open the file access settings.", settingsIntentError);
                return;
            }
        }

        call.resolve(result);
    }

    private boolean hasAllFilesAccess() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            return Environment.isExternalStorageManager();
        }
        return true;
    }
}
