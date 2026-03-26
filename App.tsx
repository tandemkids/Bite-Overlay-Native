import React, {useCallback, useEffect, useRef, useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import {detectFaces} from 'vision-camera-face-detector';
import {Worklets} from 'react-native-worklets-core';

// JS↔Native bridge — see OverlayModule.java
// Methods: startOverlay(), showOverlay(), hideOverlay(), stopOverlay()
const {OverlayModule} = NativeModules;

// ML Kit mouthOpenProbability threshold (0–1).
// Values >= 0.5 are treated as an active bite / mouth-open event.
const MOUTH_OPEN_THRESHOLD = 0.5;

// Seconds without a detected bite before the overlay activates.
const COUNTDOWN_SECONDS = 10;

export default function App(): React.JSX.Element {
  const device = useCameraDevice('front');

  // true  → screen is darkened (no bite detected for COUNTDOWN_SECONDS)
  // false → screen is clear   (recent bite or app just started)
  const [isDark, setIsDark] = useState(false);

  // Visible countdown so the user can see the timer ticking
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Refs so the interval callback can read/write without stale closures
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef(COUNTDOWN_SECONDS);

  /**
   * (Re)start the 10-second countdown from scratch.
   * Called on mount and every time a bite is detected.
   */
  const startCountdown = useCallback(() => {
    // Clear any running interval
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset counter
    countdownRef.current = COUNTDOWN_SECONDS;
    setCountdown(COUNTDOWN_SECONDS);
    setIsDark(false);

    timerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        // Timer expired — darken the screen
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsDark(true);
      }
    }, 1000);
  }, []);

  // Mount: start overlay service and kick off the first countdown
  useEffect(() => {
    OverlayModule?.startOverlay();
    startCountdown();
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      OverlayModule?.stopOverlay();
    };
  }, [startCountdown]);

  // Whenever isDark changes, tell the native overlay to show or hide
  useEffect(() => {
    if (isDark) {
      OverlayModule?.showOverlay();
    } else {
      OverlayModule?.hideOverlay();
    }
  }, [isDark]);

  /**
   * Receives mouth-open boolean from the worklet thread.
   * A detected bite resets the countdown and clears the overlay.
   */
  const onMouthUpdate = Worklets.createRunOnJS((mouthIsOpen: boolean) => {
    if (mouthIsOpen) {
      startCountdown();
    }
  });

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      runAtTargetFps(10, () => {
        'worklet';

        const faces = detectFaces(frame, {
          performanceMode: 'fast',
          contourMode: 'none',
          landmarkMode: 'none',
          // 'all' enables mouthOpenProbability from ML Kit classifier
          classificationMode: 'all',
        });

        if (faces.length === 0) {
          return;
        }

        const face = faces[0];

        // mouthOpenProbability is a float 0–1 from ML Kit's face classifier.
        // Falls back to 0 if the value is not available on this device.
        const prob =
          (face as any).classificationData?.mouthOpenProbability ??
          (face as any).mouthOpenProbability ??
          0;

        onMouthUpdate(prob >= MOUTH_OPEN_THRESHOLD);
      });
    },
    [onMouthUpdate],
  );

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>No front camera available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        frameProcessor={frameProcessor}
      />

      <View style={styles.hud}>
        {isDark ? (
          <Text style={styles.darkLabel}>SCREEN DARK</Text>
        ) : (
          <>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.label}>seconds until dark</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hud: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  darkLabel: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
