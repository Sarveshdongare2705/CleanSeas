import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import BottomNavigation from '../components/BottomNavigation';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const OrgEvents = ({route}) => {
  const navigation = useNavigation();
  const routeEmail = route.params.email;
  const [events, setEvents] = useState([]);
  const [completedEvents , setCompletedEvents] = useState([]);
  const [summaryEvents , setSummaryEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const getEvents = async user => {
    if (user) {
      try {
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', user.email)
          .get();
        if (!userSnapShot.empty) {
          const userLoc = userSnapShot.docs[0].data().Location;
          const currentDate = new Date();
          const eventsSnapshot = await firestore()
            .collection('Events')
            .where('Useremail', '==', routeEmail)
            .where('finished' , '==',false)
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
  const getCompletedEvents = async user => {
    if (user) {
      try {
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', user.email)
          .get();
        if (!userSnapShot.empty) {
          const userLoc = userSnapShot.docs[0].data().Location;
          const currentDate = new Date();
          const eventsSnapshot = await firestore()
            .collection('Events')
            .where('Useremail', '==', routeEmail)
            .where('finished' , '==',true)
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
          setCompletedEvents(eventsData);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCompletedEvents([]);
    }
  }

  const getSummaryEvents = async user => {
    if (user) {
      try {
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', user.email)
          .get();
        if (!userSnapShot.empty) {
          const userLoc = userSnapShot.docs[0].data().Location;
          const currentDate = new Date();
          const eventsSnapshot = await firestore()
            .collection('Events')
            .where('Useremail', '==', routeEmail)
            .where('finished' , '==',true)
            .where('summaryProvided','==',false)
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
          setSummaryEvents(eventsData);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSummaryEvents([]);
    }
  }

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', routeEmail)
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
        getEvents(user);
        getCompletedEvents(user);
        getSummaryEvents(user);
      });

      return unsubscribe;
    }, []),
  );
  return (
    <View>
      <View>
        <Text
          style={{
            color: 'black',
            fontSize: 17,
            padding: 10,
            marginTop: 20,
          }}>
          Clean Up Events by{' '}
          <Text style={{color: '#0077be'}}>
            {userData && userData.Username}
          </Text>
        </Text>
      </View>
      <View style={{flexDirection : 'column' , justifyContent : 'space-between'}}>
      <ScrollView style={{height : '85%'}}>
        <View>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              padding: 10,
              marginBottom: -10,
            }}>
            Upcoming Events
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
                )
                :
                (
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
                )
              }
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
                      navigation.navigate('EventDetails', {
                        id: event.id,
                      })
                    }>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
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
        <View>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              padding: 10,
              marginTop: 10,
              marginBottom: -10,
            }}>
            Completed Events
          </Text>
        </View>
        <ScrollView horizontal style={{margin: 10}}>
          {completedEvents.map(event => (
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
                )
                :
                (
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
                )
              }
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
                      navigation.navigate('EventDetails', {
                        id: event.id,
                      })
                    }>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
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
      <BottomNavigation />
      </View>
    </View>
  );
};

export default OrgEvents;
