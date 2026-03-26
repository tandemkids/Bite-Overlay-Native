package com.biteoverlay;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * OverlayModule — React Native Native Module
 *
 * JS bridge surface (NativeModules.OverlayModule):
 *   startOverlay()   → starts OverlayService (call once on mount)
 *   showOverlay()    → sets overlay to 80% black  (isDark = true)
 *   hideOverlay()    → sets overlay to transparent (isDark = false)
 *   setOpacity(n)    → raw opacity control 0.0–1.0 (advanced use)
 *   stopOverlay()    → stops OverlayService (call on unmount)
 *
 * Registered in OverlayPackage → MainApplication.kt.
 * Requires android.permission.SYSTEM_ALERT_WINDOW at runtime.
 *
 * isDark state → overlay mapping (driven by App.tsx useEffect):
 *   isDark = true   → showOverlay()  → opacity 0.8  (screen darkens)
 *   isDark = false  → hideOverlay()  → opacity 0.0  (screen clears)
 */
public class OverlayModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "OverlayModule";

    // Opacity applied when the overlay is shown (80% black)
    private static final float OPACITY_DARK = 0.8f;

    public OverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /** Start the WindowManager overlay service. Call once when the app mounts. */
    @ReactMethod
    public void startOverlay() {
        ReactApplicationContext ctx = getReactApplicationContext();
        ctx.startService(new Intent(ctx, OverlayService.class));
    }

    /**
     * Show the overlay at 80% opacity.
     * Called when isDark becomes true (no bite detected for 10 s).
     */
    @ReactMethod
    public void showOverlay() {
        OverlayService.setOpacity(OPACITY_DARK);
    }

    /**
     * Hide the overlay (fully transparent).
     * Called when isDark becomes false (bite detected, countdown reset).
     */
    @ReactMethod
    public void hideOverlay() {
        OverlayService.setOpacity(0.0f);
    }

    /**
     * Raw opacity control — kept for debugging / advanced use.
     *
     * @param opacity  0.0 = transparent, 1.0 = fully opaque black
     */
    @ReactMethod
    public void setOpacity(double opacity) {
        OverlayService.setOpacity((float) opacity);
    }

    /** Stop and tear down the overlay. Call when the app unmounts. */
    @ReactMethod
    public void stopOverlay() {
        ReactApplicationContext ctx = getReactApplicationContext();
        ctx.stopService(new Intent(ctx, OverlayService.class));
    }
}
