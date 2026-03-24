package com.biteoverlay;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.IBinder;
import android.view.View;
import android.view.WindowManager;

/**
 * OverlayService
 *
 * Uses WindowManager to attach a full-screen black view on top of all other
 * windows. The view is transparent by default (alpha = 0.0) and can be set
 * to 80% opacity (alpha = 0.8) via the static setOpacity() method, which is
 * called by OverlayModule from the React Native JS bridge.
 *
 * Overlay lifecycle:
 *   start  → OverlayModule.startOverlay() → context.startService()
 *   adjust → OverlayModule.setOpacity(float)
 *   stop   → OverlayModule.stopOverlay()  → context.stopService()
 */
public class OverlayService extends Service {

    // Singleton reference so OverlayModule can reach the live view
    private static OverlayService instance;

    private WindowManager windowManager;
    private View overlayView;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // Full-screen black view — opacity starts at 0 (fully transparent)
        overlayView = new View(this);
        overlayView.setBackgroundColor(Color.BLACK);
        overlayView.setAlpha(0f);

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            // TYPE_APPLICATION_OVERLAY is required on API 26+ (our minSdk)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );

        windowManager.addView(overlayView, params);
    }

    /**
     * Called by OverlayModule from the JS bridge.
     *
     * @param alpha  0.0 = fully transparent (clear), 0.8 = 80% black (dark)
     */
    public static void setOpacity(float alpha) {
        if (instance != null && instance.overlayView != null) {
            // View mutations must happen on the main thread
            instance.overlayView.post(() -> instance.overlayView.setAlpha(alpha));
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (overlayView != null && windowManager != null) {
            windowManager.removeView(overlayView);
            overlayView = null;
        }
        instance = null;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }
}
