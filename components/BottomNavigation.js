import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const BottomNavigation = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
      }
    } else {
      setCurrentUser(null);
      setUserData(null);
    }
  };
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        fetchUserData(user);
      });

      return unsubscribe;
    }, []),
  );
  const navigation = useNavigation();
  return (
    <View style={styles.shadowContainer}>
      <View
        style={[
          styles.container,
          {borderTopColor: 'lightgray', borderTopWidth: 0.3},
        ]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../assets/home.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Explore')}>
          <Image
            source={require('../assets/explore.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
          ]}
          onPress={() => navigation.navigate('Search')}>
          <Image
            source={require('../assets/search.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Community')}>
          <Image
            source={require('../assets/community.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Profile', {email: userData.Useremail})
          }>
          <Image
            source={require('../assets/profile.png')}
            style={{width: 25, height: 25}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    borderTopColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 2,
    backgroundColor: 'white',
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
});
