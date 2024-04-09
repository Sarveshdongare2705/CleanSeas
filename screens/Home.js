import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  RefreshControl,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect , useNavigation} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import Loader from '../components/Loader';
import CalendarGrid from '../components/Calender';

const Home = props => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [location, setLocation] = useState(false);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loc, setLoc] = useState('');

  //initially update flag
  const updateFlags = async () => {
    try {
      const currentDate = new Date();
      const events = await firestore().collection('Events').get();
      await Promise.all(
        events.docs.map(async doc => {
          const eventData = {id: doc.id, ...doc.data()};
          const eD = eventData.Date.split('/');
          const eventDate = new Date(eD[2], eD[1] - 1, eD[0]);
          if (currentDate > eventDate) {
            await firestore().collection('Events').doc(eventData.id).update({
              finished: true,
            });
            console.log('Flags updated');
          }
        }),
      );
    } catch (err) {
      console.error('Error updating flags =', err);
    }
  };

  const getEvents = async user => {
    if (loc) {
      try {
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', user.email)
          .get();
        if (!userSnapShot.empty) {
          const userLoc = userSnapShot.docs[0].data().Location;
          const eventsSnapshot = await firestore()
            .collection('Events')
            .where('City', '==', userLoc)
            .where('finished', '==', false)
            .get();
          const eventsData = [];
          await Promise.all(
            eventsSnapshot.docs.map(async doc => {
              const eventData = {id: doc.id, ...doc.data()};
              const userSnapshot = await firestore()
                .collection('Users')
                .where('Useremail', '==', eventData.Useremail)
                .get();
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const filename = `${`Event${eventData.id}`}`;
                try {
                  const url = await storage().ref(filename).getDownloadURL();
                  eventData.uri = url;
                  const file2 = `${eventData.Useremail}`;
                  const url2 = await storage().ref(file2).getDownloadURL();
                  eventData.uri2 = url2;
                } catch (error) {
                  eventData.uri = null;
                }
              }
              eventsData.push(eventData);
            }),
          );
          setEvents(eventsData);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setEvents([]);
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
        setLoc(userData.Location);
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
  const getLocation = async place => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place,
        )}`,
      );
      const data = await response.json();
      if (data.length > 0) {
        const {lat, lon} = data[0];
        setLocation({latitude: parseFloat(lat), longitude: parseFloat(lon)});
      } else {
        console.log('Location not found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        //first update flags of events
        updateFlags();
        setCurrentUser(user);
        fetchUserData(user);
        getEvents(user);
        requestLocationPermission();
      });

      return unsubscribe;
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents(currentUser);
    setRefreshing(false);
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNumber = currentDate.getMonth() + 1;
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const currentMonthName = monthNames[currentMonthNumber - 1];
  const currentDateNumber = currentDate.getDate();
  const nextMonthNumber = currentDate.getMonth() + 2;
  const nextMonthName = monthNames[currentMonthNumber];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0077be" barStyle="dark-content" />
      <View style={{backgroundColor: '#0077be', marginTop: -20}}>
        <View
          style={[
            styles.heading,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}>
          {currentUser && profileImg ? (
            <Image
              source={{uri: profileImg}}
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
              }}
            />
          ) : (
            <Image
              source={require('../assets/hero1.jpg')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 100,
              }}
            />
          )}
          <Text style={{color: 'white', fontSize: 22}}>
            {currentUser && userData ? userData.Username : 'User'}
          </Text>
          <TouchableOpacity onPress={()=>{navigation.navigate('ApiPage')}}>
          <Image source={require('../assets/beaches.png')} style={{width :  40 , height : 40}} />
        </TouchableOpacity>
        </View>
      </View>
      <View style={{height: '43%'}}>
        <ScrollView>
          <CalendarGrid
            currentMonth={currentMonthNumber}
            month={currentMonthName}
            currentYear={currentYear}
            date={currentDateNumber}
          />
          <CalendarGrid
            currentMonth={nextMonthNumber}
            month={nextMonthName}
            currentYear={currentYear}
            date={currentDateNumber}
          />
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ScrollView>
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                paddingLeft: 10,
              }}>
              Upcoming Events in{' '}
              <Text style={{color: '#0077be'}}>
                {userData && userData.Location}
              </Text>
            </Text>
          </View>
          <ScrollView horizontal style={{margin: 10}}>
            {events.map(event => (
              <View
                key={event.id}
                style={{
                  borderWidth: 0.3,
                  borderColor: 'gray',
                  width: 230,
                  height: 260,
                  marginRight: 10,
                }}>
                {event && (
                  <Image
                    source={{uri: event.uri2}}
                    style={{
                      position: 'absolute',
                      top: 7,
                      width: 36,
                      height: 36,
                      zIndex: 999,
                      right: 7,
                      borderRadius: 100,
                    }}
                  />
                )}
                {event && event.finished == true ? (
                  <Image
                    source={require('../assets/red.png')}
                    style={{
                      position: 'absolute',
                      top: 7,
                      width: 12,
                      height: 12,
                      zIndex: 999,
                      left: 7,
                      borderRadius: 100,
                    }}
                  />
                ) : (
                  <Image
                    source={require('../assets/green.png')}
                    style={{
                      position: 'absolute',
                      top: 7,
                      width: 12,
                      height: 12,
                      zIndex: 999,
                      left: 7,
                      borderRadius: 100,
                    }}
                  />
                )}
                {event.uri && (
                  <Image
                    source={{uri: event.uri}}
                    style={{
                      width: 230,
                      height: 138,
                      padding: 10,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <View style={{padding: 5}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 3,
                      alignItems: 'center',
                      height: 38,
                    }}>
                    <Image
                      source={require('../assets/title.png')}
                      style={{width: 16, height: 16, alignItems: 'center'}}
                    />
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 13,
                        width: 200,
                      }}>
                      {event.Title}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 50,
                      alignItems: 'center',
                    }}>
                    <View style={{flexDirection: 'row', marginTop: 7, gap: 7}}>
                      <Image
                        source={require('../assets/date.png')}
                        style={{width: 16, height: 16}}
                      />
                      <Text style={{color: 'black', fontSize: 12}}>
                        {event.Date}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 7, gap: 7}}>
                      <Image
                        source={require('../assets/time.png')}
                        style={{width: 16, height: 16}}
                      />
                      <Text style={{color: 'black', fontSize: 12}}>
                        {event.Time}
                      </Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 7,
                        gap: 7,
                        width: 115,
                      }}>
                      <Image
                        source={require('../assets/location.png')}
                        style={{width: 16, height: 16}}
                      />
                      <Text style={{color: 'black', fontSize: 12}}>
                        {event.City}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        width: 100,
                        color: 'white',
                        backgroundColor: 'black',
                        alignItems: 'center',
                        height: 30,
                        paddingTop: 5,
                        marginTop: 15,
                        marginRight: 5,
                        borderRadius: 7,
                      }}
                      onPress={() =>
                        props.navigation.navigate('EventDetails', {
                          id: event.id,
                        })
                      }>
                      <Text
                        style={{
                          textAlign: 'center',
                          color: 'white',
                        }}>
                        Check Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

export default Home;

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
    alignItems: 'center',
    padding: 20,
    marginBottom: -7,
    gap: 7,
  },
  imageBackground: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-start',
  },
  value: {
    flexDirection: 'row',
    marginTop: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
