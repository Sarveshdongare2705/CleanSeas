import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  PermissionsAndroid,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Loader from '../components/Loader';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';

import DateTimePicker from '@react-native-community/datetimepicker';
import Geolocation from 'react-native-geolocation-service';

const CreateDrive = props => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [title, setTitle] = useState('');
  const [loc, setLoc] = useState('');
  const [city, setCity] = useState('');
  const [inputHeight, setInputHeight] = useState(100);
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [org, setOrg] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [imgerr, showImgErr] = useState(false);
  const [titleerr, showTitleErr] = useState(false);
  const [locerr, showLocErr] = useState(false);
  const [descerr, showDescErr] = useState(false);
  const [contacterr, showContactErr] = useState(false);
  const [orgerr, showOrgErr] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [mode, setMode] = useState('time');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDate(Platform.OS === 'ios');
    setShowTime(Platform.OS === 'ios');
    setDate(currentDate);
    setTime(currentDate.toLocaleTimeString());
  };

  const showDatePicker = () => {
    setShowDate(true);
    setShowTime(false);
  };

  const showTimePicker = () => {
    setShowTime(true);
    setShowDate(false);
  };

  const handleContentSizeChange = event => {
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const requestLocationPermission = async () => {
    try {
      console.log('Location permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };
  const getLocation = async (loc, city) => {
    try {
      const responseLoc = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          loc,
        )}`,
      );
      const dataLoc = await responseLoc.json();
      let lat, lon;
      if (dataLoc.length > 0) {
        lat = dataLoc[0].lat;
        lon = dataLoc[0].lon;
      } else {
        const responseCity = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            city,
          )}`,
        );
        const dataCity = await responseCity.json();
        if (dataCity.length > 0) {
          lat = dataCity[0].lat;
          lon = dataCity[0].lon;
        }
      }
      return {lat, lon};
    } catch (error) {
      console.error('Error:', error);
      return {lat: undefined, lon: undefined};
    }
  };

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
        requestLocationPermission();
        fetchUserData(user);
        setUploading(false);
        setDate(new Date());
        setTime('');
        setImage(null);
        showImgErr(false);
        showLocErr(false);
        showTitleErr(false);
        showDescErr(false);
        showContactErr(false);
        showOrgErr(false);
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
  const handleCreatePost = async () => {
    showImgErr(false);
    showLocErr(false);
    showTitleErr(false);
    showDescErr(false);
    showContactErr(false);
    showOrgErr(false);
    if (title === '') {
      showTitleErr(true);
    }
    if (description === '') {
      showDescErr(true);
    }
    if (contact === '') {
      showContactErr(true);
    }
    if (org === '') {
      showOrgErr(true);
    }
    if (loc === '' || city === '') {
      showLocErr(true);
    }
    if (image === null) {
      showImgErr(true);
    } else {
      try {
        console.log('Started');
        const {lat, lon} = await getLocation(loc, city);
        console.log(lat, lon);
        setUploading(true);
        const EventData = {
          Title: title,
          Description: description,
          Location: loc,
          City: city,
          Contact: contact,
          Organization: org,
          Date: date.toLocaleDateString(),
          Time: time,
          Latitude: lat,
          Longitude: lon,
          Useremail : userData.Useremail,
        };
        const driveRef = await firestore().collection('Events').add(EventData);
        if (image !== null) {
          const driveId = driveRef && driveRef.id;
          const reference = storage().ref(`Event${driveId}`);
          await reference.putFile(image.assets[0].uri);
          console.log('Event Image uploaded successfullly');
        }
        setUploading(false);
        props.navigation.navigate('Home');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {uploading ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
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
          <View>
            <Text style={{color: 'black'}}>Create Event</Text>
          </View>
          <ScrollView style={styles.scrollview}>
            <TouchableOpacity onPress={pickImage} style={{marginLeft: 68}}>
              {image ? (
                <Image
                  source={{uri: image.assets[0].uri}}
                  style={{
                    borderWidth: 0.3,
                    borderColor: 'black',
                    width: 310,
                    height: 180,
                    marginTop: 20,
                    marginLeft: -62,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    borderStyle: 'dashed',
                    objectFit: 'cover',
                  }}></Image>
              ) : (
                <View
                  style={{
                    borderWidth: 0.3,
                    borderColor: 'black',
                    width: 320,
                    height: 180,
                    marginTop: 20,
                    marginLeft: -68,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                  }}>
                  <Text style={{color: 'gray'}}>Upload Image here</Text>
                </View>
              )}
            </TouchableOpacity>
            {imgerr ? (
              <Text style={styles.err}>PLease upload a image</Text>
            ) : (
              ''
            )}
            <View style={styles.form}>
              <View
                style={[
                  styles.input,
                  {
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  },
                ]}>
                <Image
                  source={require('../assets/title.png')}
                  style={{width: 20, height: 20}}
                />
                <TextInput
                  placeholder={`Please enter title`}
                  style={{width: 250, color: 'black'}}
                  placeholderTextColor="gray"
                  value={title}
                  maxLength={50}
                  onChangeText={text => {
                    setTitle(text);
                  }}
                />
              </View>
              {titleerr ? (
                <Text style={styles.err}>PLease enter valid Title</Text>
              ) : (
                ''
              )}
              <View style={{flexDirection: 'row'}}>
                <View
                  style={[
                    styles.input,
                    {
                      width: '48%',
                      height: 50,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      marginRight: 12,
                    },
                  ]}>
                  <Image
                    source={require('../assets/location.png')}
                    style={{width: 20, height: 20}}
                  />
                  <TextInput
                    placeholder={`Location`}
                    style={{width: 90, color: 'black'}}
                    placeholderTextColor="gray"
                    value={loc}
                    maxLength={40}
                    onChangeText={text => {
                      setLoc(text);
                    }}
                  />
                </View>
                <View
                  style={[
                    styles.input,
                    {
                      width: '48%',
                      height: 50,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    },
                  ]}>
                  <Image
                    source={require('../assets/city.png')}
                    style={{width: 20, height: 20}}
                  />
                  <TextInput
                    placeholder={`City`}
                    style={{width: 90, color: 'black'}}
                    placeholderTextColor="gray"
                    value={city}
                    maxLength={40}
                    onChangeText={text => {
                      setCity(text);
                    }}
                  />
                </View>
              </View>
              {locerr ? (
                <Text style={styles.err}>PLease enter a location</Text>
              ) : (
                ''
              )}
              <View
                style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <View>
                  <TouchableOpacity
                    onPress={showDatePicker}
                    style={[
                      styles.input,
                      {
                        width: 154,
                        height: 40,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingRight: 20,
                      },
                    ]}>
                    <Image
                      source={require('../assets/date.png')}
                      style={{width: 20, height: 20}}
                    />
                    <Text style={{color: 'black', fontSize: 18}}>
                      {date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showDate && (
                    <DateTimePicker
                      testID="datePicker"
                      value={date}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={onChange}
                    />
                  )}
                </View>
                <View>
                  <TouchableOpacity
                    onPress={showTimePicker}
                    style={[
                      styles.input,
                      {
                        width: 154,
                        height: 40,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingRight: 20,
                      },
                    ]}>
                    <Image
                      source={require('../assets/time.png')}
                      style={{width: 20, height: 20}}
                    />
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 18,
                        textAlign: 'center',
                      }}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                  {showTime && (
                    <DateTimePicker
                      testID="timePicker"
                      value={date}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={onChange}
                    />
                  )}
                </View>
              </View>

              <TextInput
                style={[styles.input, {height: Math.max(100, inputHeight)}]}
                maxLength={10000}
                placeholder={`Enter Description`}
                placeholderTextColor="gray"
                multiline={true}
                numberOfLines={100}
                value={description}
                onChangeText={setDescription}
                onContentSizeChange={handleContentSizeChange}
              />
              {descerr ? (
                <Text style={styles.err}>PLease enter valid description</Text>
              ) : (
                ''
              )}
              <View
                style={[
                  styles.input,
                  {
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  },
                ]}>
                <Image
                  source={require('../assets/contact.png')}
                  style={{width: 20, height: 20}}
                />
                <TextInput
                  placeholder={`Enter contact details`}
                  style={{width: 250, color: 'black'}}
                  placeholderTextColor="gray"
                  value={contact}
                  maxLength={40}
                  onChangeText={text => {
                    setContact(text);
                  }}
                  keyboardType="numeric"
                />
              </View>
              {contacterr ? (
                <Text style={styles.err}>PLease enter contact details</Text>
              ) : (
                ''
              )}
              <View
                style={[
                  styles.input,
                  {
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  },
                ]}>
                <Image
                  source={require('../assets/org.png')}
                  style={{width: 20, height: 20}}
                />
                <TextInput
                  placeholder={`Enter organization name`}
                  style={{width: 250, color: 'black'}}
                  placeholderTextColor="gray"
                  value={org}
                  maxLength={40}
                  onChangeText={text => {
                    setOrg(text);
                  }}
                />
              </View>
              {orgerr ? (
                <Text style={styles.err}>PLease enter organization</Text>
              ) : (
                ''
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton, {width: '60%'}]}
            onPress={handleCreatePost}>
            <Text style={{fontWeight: '900', fontSize: 15}}>Upload Drive</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
export default CreateDrive;

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
    borderWidth: 0.4,
    borderColor: 'lightgray',
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
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: 'red',
    textAlign: 'right',
    paddingRight: 10,
  },
  signUpButton: {
    backgroundColor: '#57DDFB',
  },
});
