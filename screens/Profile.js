import React, {useEffect, useState, useCallback} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect} from '@react-navigation/native';
import Loader from '../components/Loader';

const Profile = ({navigation}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchUserData = async user => {
    if (user) {
      setUploading(true);
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
        const filename = `${user.email}`;
        try {
          url = await storage().ref(filename).getDownloadURL();
          setProfileImg(url);
        } catch (error) {
          setProfileImg(null);
        }
      }
      setUploading(false);
    } else {
      setCurrentUser(null);
      setUserData(null);
      setProfileImg(null);
    }
  };
  const handleLogout = async () => {
    try {
      await auth().signOut();
      setCurrentUser(null);
      setUserData(null);
      setProfileImg(null);
      navigation.navigate('Welcome');
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        fetchUserData(user);
        setProfileImg(null);
      });

      return unsubscribe;
    }, []),
  );

  return (
    <View style={styles.container}>
      {uploading ? (
        <Loader />
      ) : (
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text style={{color: '#57DDFB', fontSize: 34, fontWeight: '900'}}>
                Profile
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}>
              {currentUser && profileImg ? (
                <TouchableOpacity onPress={()=>navigation.navigate('Image' , {uri : profileImg , path : 'Profile'})}>
                  <Image
                    source={{uri: profileImg}}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: '#57DDFB',
                      shadowColor: 'black',
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <Image
                  source={require('../assets/hero1.jpg')}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: '#57DDFB',
                  }}
                />
              )}
              <Text
                style={{
                  color: 'black',
                  fontSize: 33,
                  fontWeight: '900',
                  marginTop: 10,
                }}>
                {currentUser && userData ? userData.Username : ''}
              </Text>
              {currentUser && userData && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.signUpButton,
                    {
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#57DDFB',
                    },
                  ]}
                  onPress={() => navigation.navigate('EditProfile')}>
                  <Text
                    style={{fontWeight: '900', fontSize: 15, color: '#57DDFB'}}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              )}
              {currentUser && userData && userData.role === 'Yes' ? (
                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    height: 50,
                    width: 260,
                    borderTopColor: 'lightgray',
                    borderBottomColor: 'lightgray',
                    borderTopWidth: 0.5,
                    borderBottomWidth: 0.5,
                    justifyContent: 'center',
                    gap: 20,
                    aligenItems: 'center',
                    padding: 10,
                  }}>
                  <Text style={{color: 'black', fontSize: 18}}>
                    Create New Drive
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreateDrive')}
                    style={{
                      borderWidth: 1,
                      padding: 7,
                      borderRadius: 10,
                      width: 30,
                      height: 30,
                      borderColor: '#57DDFB',
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 36,
                        textAlign: 'center',
                        marginTop: -18,
                        marginLeft: -2.5,
                        color: '#57DDFB',
                      }}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View></View>
              )}
              {currentUser && userData && (
                <TouchableOpacity
                  style={[styles.button, styles.signUpButton]}
                  onPress={handleLogout}>
                  <Text style={{fontWeight: '900', fontSize: 15}}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
      <BottomNavigation />
    </View>
  );
};

export default Profile;

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
    gap: 7,
  },
  button: {
    width: '60%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: '#57DDFB',
  },
});
