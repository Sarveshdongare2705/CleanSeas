import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {colors} from '../Colors';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';

const BottomNavigation = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
        const filename = `${userData.Useremail}`;
        url = await storage().ref(filename).getDownloadURL();
        setProfileImg(url);
      }
    } else {
      setCurrentUser(null);
      setUserData(null);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const user = await auth().currentUser;
      setCurrentUser(user);
      fetchUserData(user);
    };
    fetchData();
    const intervalId = setInterval(fetchData, 90000);
    return () => clearInterval(intervalId);
  }, []);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../assets/home.png')}
            style={{width: 25, height: 25}}
          />
          <Text style={{color : 'black' , fontSize : 11}}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Explore')}>
          <Image
            source={require('../assets/explore.png')}
            style={{width: 25, height: 25}}
          />
          <Text style={{color : 'black' , fontSize : 11}}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => navigation.navigate('Search')}>
          <Image
            source={require('../assets/search.png')}
            style={{width: 25, height: 25}}
          />
          <Text style={{color : 'black' , fontSize : 11}}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Community')}>
          <Image
            source={require('../assets/community.png')}
            style={{width: 25, height: 25}}
          />
          <Text style={{color : 'black' , fontSize : 11}}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Profile', {email: userData && userData.Useremail})
          }>
          <Image
            source={require('../assets/profile.png')}
            style={{width: 25, height: 25}}
          />
          <Text style={{color : 'black' , fontSize : 11}}>Profile</Text>
        </TouchableOpacity>
      </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: colors.sandyBeige,
    marginBottom: 7,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems : 'center',
    height : 42
  },
});
