module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Required for react-native-vision-camera frame processors
    // Must come before any other plugins that transform arrow functions
    'react-native-worklets-core/plugin',
  ],
};
