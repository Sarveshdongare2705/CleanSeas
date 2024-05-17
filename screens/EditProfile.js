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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {colors} from '../Colors';

const EditProfile = props => {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [desc, setDesc] = useState('');
  const [Location, setLocation] = useState('');
  const [showErr, setShowErr] = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [locErr, setLocErr] = useState(false);
  const [descErr, setDescErr] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [ageErr, setAgeErr] = useState(false);
  const [genderErr, setGenderErr] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
        setUpdatedName(userData.Username);
        userData.desc && setDesc(userData.desc);
        setLocation(userData.Location);
        userData.age && setAge(userData.age);
        userData.gender && setGender(userData.gender);
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
        setShowMenu(false);
        setCurrentUser(user);
        fetchUserData(user);
      });
      return unsubscribe;
    }, []),
  );
  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
    } else {
      console.log(result);
      setImage(result);
    }
  };
  useEffect(() => {
    setNameErr(updatedName === '');
  }, [updatedName]);
  useEffect(() => {
    setDescErr(desc === '');
  }, [desc]);
  useEffect(() => {
    setLocErr(Location === '');
  }, [Location]);
  useEffect(() => {
    setAgeErr(age === '');
  }, [age]);
  useEffect(() => {
    setGenderErr(gender === '');
  }, [gender]);

  const handleEditProfile = async () => {
    try {
      if (
        nameErr === false &&
        descErr === false &&
        locErr === false &&
        ageErr === false &&
        genderErr === false
      ) {
        console.log(nameErr);
        setUploading(true);
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', currentUser.email)
          .get();
        if (!userSnapShot.empty) {
          const userRef = userSnapShot.docs[0].ref;
          await userRef.update({Username: updatedName});
          await userRef.update({Location: Location});
          await userRef.update({desc: desc});
          await userRef.update({age: age});
          userData &&
            userData.Role.trim() !== 'Organization' &&
            (await userRef.update({gender: gender}));
        }
        if (image !== null) {
          const reference = storage().ref(
            currentUser ? userData.Useremail : '',
          );
          let pathToFile = image.assets[0].uri;
          await reference.putFile(pathToFile);
        }
        setImage(null);
        setUploading(false);
        navigation.navigate('Profile', {email: currentUser.email});
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploading(false);
    }
  };
  return (
    <View style={{height: '100%', backgroundColor: 'white'}}>
      <View style={{flexDirection : 'row' , gap : 10}}>
        <TouchableOpacity
          style={{paddingTop: 10, paddingHorizontal: 20}}
          onPress={() =>
            props.navigation.navigate('Profile', {email: currentUser.email})
          }>
          <FastImage
            source={require('../assets/back.png')}
            style={{width: 20, height: 20, alignItems: 'flex-start'}}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        {uploading ? (
          <Loader />
        ) : (
          <View style={styles.content}>
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image source={{uri: image.assets[0].uri}} style={styles.img} />
              ) : profileImg ? (
                <Image source={{uri: profileImg}} style={styles.img} />
              ) : (
                <Image
                  source={require('../assets/profile.png')}
                  style={styles.img}
                />
              )}
              <View></View>
            </TouchableOpacity>
            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  nameErr && {borderColor: 'red', borderWidth: 1},
                ]}
                placeholder={`Enter your name`}
                placeholderTextColor="gray"
                value={updatedName}
                maxLength={25}
                onChangeText={text => {
                  setUpdatedName(text);
                }}
              />
              <TextInput
                style={[
                  styles.input,
                  locErr && {borderColor: 'red', borderWidth: 1},
                ]}
                placeholder={`Enter your Location`}
                placeholderTextColor="gray"
                value={Location}
                maxLength={20}
                onChangeText={text => {
                  setLocation(text);
                }}
              />
              <TextInput
                style={[
                  styles.input,
                  {height: 130},
                  descErr && {borderColor: 'red', borderWidth: 1},
                ]}
                placeholder={`Enter your Description`}
                placeholderTextColor="gray"
                value={desc}
                maxLength={400}
                multiline={true}
                numberOfLines={5}
                onChangeText={text => {
                  setDesc(text);
                }}
              />
              {userData && userData.Role.trim() !== 'Organization' ? (
                <TextInput
                  style={[
                    styles.input,
                    ageErr && {borderColor: 'red', borderWidth: 1},
                  ]}
                  placeholder={`Enter your Age`}
                  placeholderTextColor="gray"
                  value={age}
                  maxLength={20}
                  onChangeText={text => {
                    setAge(text);
                  }}
                />
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    ageErr && {borderColor: 'red', borderWidth: 1},
                  ]}
                  placeholder={`Year Established?`}
                  placeholderTextColor="gray"
                  value={age}
                  maxLength={20}
                  onChangeText={text => {
                    setAge(text);
                  }}
                />
              )}
              {userData && userData.Role.trim() !== 'Organization' && (
                <TouchableOpacity
                  style={[
                    styles.input,
                    genderErr && {borderColor: 'red', borderWidth: 1},
                  ]}
                  onPress={() => setShowMenu(!showMenu)}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginRight: 20,
                    }}>
                    <TextInput
                      placeholder={`Select Gender`}
                      placeholderTextColor="gray"
                      value={gender}
                      maxLength={20}
                      editable={false}
                      style={{color: 'black'}}
                    />
                    <Image
                      source={
                        showMenu
                          ? require('../assets/up.png')
                          : require('../assets/down.png')
                      }
                      style={{width: 13, height: 13, alignItems: 'flex-start'}}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {showMenu ? (
                <View style={styles.menu}>
                  <TouchableOpacity
                    style={styles.opt}
                    onPress={() => {
                      setGender('Male');
                      setShowMenu(false);
                    }}>
                    <Text style={{color: 'black', marginBottom: -7}}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.opt}
                    onPress={() => {
                      setGender('Female');
                      setShowMenu(false);
                    }}>
                    <Text style={{color: 'black', marginBottom: -7}}>
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View></View>
              )}
              <TextInput
                style={styles.input}
                value={currentUser && userData && userData.Useremail}
                editable={false}
              />
            </View>
            <TouchableOpacity style={[styles.btn]} onPress={handleEditProfile}>
              <Text style={styles.btntext}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  element: {
    marginTop: -10,
    flexDirection: 'column',
    gap: 7,
  },
  input: {
    color: 'black',
    borderWidth: 0.2,
    width: '96%',
    paddingLeft: 20,
    borderColor: 'gray',
    borderRadius: 3,
    height: 50,
  },
  btn: {
    width: '60%',
    height: 36,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    marginTop: 20,
  },
  btntext: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 0.3,
    borderColor: 'black',
  },
  menu: {
    width: '96%',
    borderWidth: 0.3,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: -10,
    borderRadius: 3,
  },
  opt: {
    paddingVertical: 15,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 0.3,
  },
});
