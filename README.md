# BiteOverlay

  A React Native (non-Expo) Android app scaffolded with the standard React Native CLI.

  ## Getting Started

  ### Prerequisites
  - Node.js >= 18
  - Android Studio with Android SDK
  - Java Development Kit (JDK) 17+

  ### Installation

  ```bash
  npm install
  # or
  yarn install
  ```

  ### Running on Android

  ```bash
  npm run android
  ```

  ### Running Metro Bundler

  ```bash
  npm start
  ```

  ## Project Structure

  ```
  BiteOverlay/
  ├── android/                 # Native Android project
  │   ├── app/
  │   │   ├── src/main/
  │   │   │   ├── java/com/biteoverlay/
  │   │   │   │   ├── MainActivity.kt
  │   │   │   │   └── MainApplication.kt
  │   │   │   ├── res/
  │   │   │   └── AndroidManifest.xml
  │   │   └── build.gradle
  │   ├── build.gradle
  │   ├── settings.gradle
  │   └── gradle.properties
  ├── __tests__/
  ├── App.tsx                  # Main React Native component
  ├── index.js                 # App entry point
  └── package.json
  ```

  ## App

  The app displays a black screen with "Hello Bite Overlay" centered in white text.
  