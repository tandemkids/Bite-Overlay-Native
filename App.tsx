import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import {detectFaces, FaceContourType} from 'vision-camera-face-detector';
import {Worklets} from 'react-native-worklets-core';

// Minimum vertical gap between upper and lower lip (frame pixels) = mouth open
const OPEN_THRESHOLD = 15;

// How long the mouth must stay closed before triggering the screen-darken log
const CLOSED_DURATION_MS = 5_000;

export default function App(): React.JSX.Element {
  const device = useCameraDevice('front');
  const [isBiting, setIsBiting] = useState(false);

  // Timestamp of when the mouth first closed; null while mouth is open
  const closedSinceRef = useRef<number | null>(null);
  // Guard so the log fires at most once per closed session
  const logFiredRef = useRef(false);

  // Called on the JS thread whenever a new mouth-open measurement arrives
  const onMouthUpdate = Worklets.createRunOnJS((isOpen: boolean) => {
    setIsBiting(isOpen);

    if (isOpen) {
      // Mouth opened — reset the closed-mouth timer
      closedSinceRef.current = null;
      logFiredRef.current = false;
    } else {
      // Mouth is closed — start or advance the timer
      if (closedSinceRef.current === null) {
        closedSinceRef.current = Date.now();
      } else if (
        !logFiredRef.current &&
        Date.now() - closedSinceRef.current >= CLOSED_DURATION_MS
      ) {
        logFiredRef.current = true;
        console.log('Threshold met: Darkening screen');
      }
    }
  });

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      runAtTargetFps(10, () => {
        'worklet';

        const faces = detectFaces(frame, {
          performanceMode: 'fast',
          contourMode: 'all',
          landmarkMode: 'none',
          classificationMode: 'none',
        });

        if (faces.length === 0) {
          return;
        }

        const face = faces[0];
        const upperLip = face.contours?.[FaceContourType.UPPER_LIP_TOP];
        const lowerLip = face.contours?.[FaceContourType.LOWER_LIP_BOTTOM];

        if (!upperLip?.length || !lowerLip?.length) {
          return;
        }

        // Sample the vertical centre of each lip contour
        const upperMid = upperLip[Math.floor(upperLip.length / 2)];
        const lowerMid = lowerLip[Math.floor(lowerLip.length / 2)];

        const lipGap = Math.abs(lowerMid.y - upperMid.y);
        onMouthUpdate(lipGap > OPEN_THRESHOLD);
      });
    },
    [onMouthUpdate],
  );

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>No front camera available</Text>
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
      <View style={styles.badge}>
        <Text style={styles.status}>{isBiting ? 'BITING' : 'IDLE'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  badge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  status: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
