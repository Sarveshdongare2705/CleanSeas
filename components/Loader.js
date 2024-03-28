import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#57DDFB" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor : 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
