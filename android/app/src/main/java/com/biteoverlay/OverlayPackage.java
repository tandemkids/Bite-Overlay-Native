package com.biteoverlay;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * OverlayPackage
 *
 * Registers OverlayModule with the React Native runtime.
 * Added to the package list in MainApplication.kt:
 *
 *   PackageList(this).packages.apply {
 *       add(OverlayPackage())
 *   }
 */
public class OverlayPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(new OverlayModule(reactContext));
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
