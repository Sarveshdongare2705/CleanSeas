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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import Loader from '../components/Loader';

const Home = props => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [location, setLocation] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventUser, setEventUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loc , setLoc] = useState('');

  const getEvents = async () => {
    if (loc) {
      try {
        const eventsSnapshot = await firestore()
          .collection('Events')
          .where('City', '==', loc)
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
      } catch (err) {
        console.error(err);
      }
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
        setLoc(userData.Location)
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
        // Do something with the coordinates, such as setting state
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
        setCurrentUser(user);
        fetchUserData(user);
        getEvents();
        requestLocationPermission();
      });

      return unsubscribe;
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.heading}>
            {currentUser && profileImg ? (
              <Image
                source={{uri: profileImg}}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: '#57DDFB',
                }}
              />
            ) : (
              <Image
                source={require('../assets/hero1.jpg')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: 'black',
                }}
              />
            )}
            <Text style={{color: 'black', fontSize: 24, fontWeight: '900'}}>
              {currentUser && userData ? userData.Username : 'User'}
            </Text>
          </View>
          <ImageBackground
            source={require('../assets/waves.png')}
            style={styles.imageBackground}
            resizeMode="cover">
            <View style={styles.value}>
              <Text style={{color: '#fff', fontSize: 60, fontWeight: '300'}}>
                35,271,268
              </Text>
            </View>
          </ImageBackground>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                padding: 10,
              }}>
              Upcoming Events in {userData && userData.Location}
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
                {event && (
                  <Image
                    source={require('../assets/beach.png')}
                    style={{
                      position: 'absolute',
                      top: 7,
                      width: 25,
                      height: 25,
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
                      }}
                      onPress={() =>
                        props.navigation.navigate('EventDetails', {
                          id: event.id,
                        })
                      }>
                      <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
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
