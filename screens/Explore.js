import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';

const Explore = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={{ color: '#57DDFB', fontSize: 34, fontWeight: '900' }}>Explore</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  heading: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 20,
    marginBottom: -7,
    gap : 7,
  },
});
