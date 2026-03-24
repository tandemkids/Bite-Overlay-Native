package com.biteoverlay;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * OverlayModule — React Native Native Module
 *
 * JS bridge surface:
 *   NativeModules.OverlayModule.startOverlay()       → starts OverlayService
 *   NativeModules.OverlayModule.setOpacity(opacity)  → 0.0 (clear) … 0.8 (dark)
 *   NativeModules.OverlayModule.stopOverlay()         → stops OverlayService
 *
 * Registered in OverlayPackage and added to MainApplication.
 * Requires android.permission.SYSTEM_ALERT_WINDOW granted at runtime.
 *
 * isBiting → opacity mapping (set by App.tsx useEffect):
 *   isBiting = true  (mouth open)   → setOpacity(0.8)  screen darkens
 *   isBiting = false (mouth closed) → setOpacity(0.0)  screen clears
 */
public class OverlayModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "OverlayModule";

    public OverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        // Must match NativeModules.OverlayModule in JS
        return MODULE_NAME;
    }

    /** Start the WindowManager overlay service. Call once on app mount. */
    @ReactMethod
    public void startOverlay() {
        ReactApplicationContext ctx = getReactApplicationContext();
        Intent intent = new Intent(ctx, OverlayService.class);
        ctx.startService(intent);
    }

    /**
     * Adjust the overlay opacity.
     *
     * @param opacity  Double in [0.0, 1.0] — JS passes a number so we accept
     *                 double and cast to float for the View API.
     *                 0.0 = transparent (no overlay visible)
     *                 0.8 = 80% opaque black (screen noticeably darkened)
     */
    @ReactMethod
    public void setOpacity(double opacity) {
        OverlayService.setOpacity((float) opacity);
    }

    /** Stop and remove the overlay. */
    @ReactMethod
    public void stopOverlay() {
        ReactApplicationContext ctx = getReactApplicationContext();
        Intent intent = new Intent(ctx, OverlayService.class);
        ctx.stopService(intent);
    }
}
