import React from 'react';
  import {StyleSheet, Text, View} from 'react-native';

  function App(): React.JSX.Element {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hello Bite Overlay</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '600',
    },
  });

  export default App;
  