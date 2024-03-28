import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Loader from '../components/Loader';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';

const EditProfile = props => {
  const [image, setImage] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [showErr, setShowErr] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

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
        try {
          url = await storage().ref(filename).getDownloadURL();
          setProfileImg(url);
        } catch (error) {
          setProfileImg(null);
        }
      }
    } else {
      setCurrentUser(null);
      setUserData(null);
      setProfileImg(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        fetchUserData(user);
        setShowErr(false);
      });

      return unsubscribe;
    }, []),
  );
  //pick image
  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    console.log(result);
    setImage(result);
  };

  //upload to firebase
  const handleEditProfile = async () => {
    if (image === null) {
      setShowErr(true);
    } else {
      try {
        setUploading(true);
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', currentUser.email)
          .get();
        if (!userSnapShot.empty) {
          const userRef = userSnapShot.docs[0].ref;
          updatedName !== ''
            ? await userRef.update({
                Username: updatedName,
                role: selectedRole,
              })
            : await userRef.update({
                Username: userData.Username,
                role: selectedRole,
              });
          console.log('Username updated');
        }

        const reference = storage().ref(currentUser ? userData.Useremail : '');

        let pathToFile = '';

        if (image !== null) {
          pathToFile = image.assets[0].uri;
        }

        if (image !== null) {
          await reference.putFile(pathToFile);
        } else {
          await reference.putFile(profileImg);
        }

        console.log('Image uploaded successfully');
        setImage(null);
        setUploading(false);
        props.navigation.navigate('Profile');
      } catch (err) {
        console.error('Error uploading image:', err);
        setUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {uploading ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => props.navigation.navigate('Profile')}>
            <Text
              style={{
                fontWeight: '100',
                fontSize: 15,
                color: 'lightgray',
                marginLeft: -150,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <ScrollView style={styles.scrollview}>
            <TouchableOpacity onPress={pickImage} style={{marginLeft: 68}}>
              {image ? (
                <Image
                  source={{uri: image.assets[0].uri}}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: 'black',
                  }}
                />
              ) : profileImg ? (
                <Image
                  source={{uri: profileImg}}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: 'black',
                  }}
                />
              ) : (
                <Image
                  source={require('../assets/hero1.jpg')}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: 'black',
                  }}
                />
              )}
              <View>
                {showErr && (
                  <Text style={{color: 'red', fontSize: 14, marginTop: 10}}>
                    Please update your profile Image
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={`${currentUser && userData && userData.Username}`}
                placeholderTextColor="gray"
                value={updatedName}
                maxLength={20}
                onChangeText={text => {
                  setUpdatedName(text);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder={`Do you want to Post Drives and Events(Yes)`}
                placeholderTextColor="gray"
                value={selectedRole}
                maxLength={20}
                onChangeText={text => {
                  setSelectedRole(text);
                }}
              />
              <TextInput
                style={styles.input}
                value={currentUser && userData && userData.Useremail}
                editable={false}
              />
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton, {width: '60%'}]}
            onPress={handleEditProfile}>
            <Text style={{fontWeight: '900', fontSize: 15}}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
export default EditProfile;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  scrollview: {
    flexDirection: 'column',
  },
  form: {
    marginTop: 40,
    flexDirection: 'column',
    gap: 10,
  },
  element: {
    marginTop: -10,
    flexDirection: 'column',
    gap: 7,
  },
  inputelement: {
    borderWidth: 0.4,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: 'black',
    borderWidth: 0.5,
    width: 320,
    paddingLeft: 20,
  },
  button: {
    width: '100%',
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
