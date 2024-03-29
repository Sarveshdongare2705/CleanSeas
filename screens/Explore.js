import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import BottomNavigation from '../components/BottomNavigation';

const Explore = props => {
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [participatedEvents, setParticiatedEvents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const getEvents = async () => {
    try {
      const participationsSnapshot = await firestore()
        .collection('Events')
        .get();
      const eventsData = [];
      await Promise.all(
        participationsSnapshot.docs.map(async doc => {
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
  };
  const getParticipatedEvents = async () => {
    try {
      const participationsSnapshot = await firestore()
        .collection('Participations')
        .where('Useremail', '==', currentUser && currentUser.email)
        .get();
      const eventsData = [];

      await Promise.all(
        participationsSnapshot.docs.map(async doc => {
          const participationData = {id: doc.id, ...doc.data()};
          const eventSnapshot = await firestore()
            .collection('Events')
            .doc(participationData.EventId)
            .get();

          if (eventSnapshot.exists) {
            const eventData = {id: eventSnapshot.id, ...eventSnapshot.data()};
            try {
              const filename = `Event${eventData.id}`;
              const url = await storage().ref(filename).getDownloadURL();
              eventData.uri = url;
            } catch (err) {
              console.log(err);
            }
            eventsData.push(eventData);
          } else {
            console.log(`Event with ID ${participationData.eventId} not found`);
          }
        }),
      );

      setParticiatedEvents(eventsData);
    } catch (err) {
      console.error(err);
    }
  };

  const getOrgs = async () => {
    try {
      const data = 'Organization';
      const participationsSnapshot = await firestore()
        .collection('Users')
        .where('Role', '==', 'Organization')
        .get();
      console.log(participationsSnapshot.docs);
      const eventsData = [];
      await Promise.all(
        participationsSnapshot.docs.map(async doc => {
          const eventData = {id: doc.id, ...doc.data()};
          try {
            const filename = `${eventData.Useremail}`;
            const url = await storage().ref(filename).getDownloadURL();
            eventData.uri = url;
          } catch (error) {
            eventData.uri = null;
          }
          eventsData.push(eventData);
        }),
      );
      setOrgs(eventsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        getEvents();
        getParticipatedEvents();
        getOrgs();
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents();
    await getOrgs();
    await getParticipatedEvents();
    setRefreshing(false);
  };

  console.log('Orgs', participatedEvents);

  return (
    <View
      style={[
        styles.container,
        {flexDirection: 'column', justifyContent: 'space-between'},
      ]}>
      <View>
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            marginBottom: 0,
            marginTop: 15,
            fontSize: 16,
          }}>
          Explore
        </Text>
        <ScrollView
          style={{height: 620}}
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
              {events && 'All Events'}
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
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                padding: 10,
              }}>
              My Participations
            </Text>
          </View>
          <ScrollView horizontal style={{margin: 10}}>
            {participatedEvents.map(event => (
              <View
                key={event.id}
                style={{
                  borderWidth: 0.3,
                  borderColor: 'gray',
                  width: 230,
                  height: 260,
                  marginRight: 10,
                }}>
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
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                padding: 10,
                marginBottom: -20,
              }}>
              Organizations
            </Text>
          </View>
          <View style={{paddingTop: 7}}>
            {orgs.map(org => (
              <TouchableOpacity
                key={org.id}
                onPress={() => {
                  props.navigation.navigate('Chat', {email: org.Useremail , senderEmail : currentUser && currentUser.email});
                }}>
                <View
                  key={org.id}
                  style={{
                    borderWidth: 0.5,
                    borderColor: 'lightgray',
                    width: '97%',
                    height: 70,
                    marginRight: 10,
                    flexDirection: 'row',
                    margin: 5,
                    borderRadius: 20,
                    paddingLeft: 10,
                    gap: 5,
                    alignItems: 'center',
                  }}>
                  {org && (
                    <Image
                      source={{uri: org.uri}}
                      style={{
                        marginTop: -14,
                        top: 7,
                        width: 50,
                        height: 50,
                        borderRadius: 100,
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
                      <View>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 17,
                            width: 270,
                          }}>
                          {org.Username}
                        </Text>
                        <Text
                          style={{
                            color: 'gray',
                            fontSize: 12,
                            width: 270,
                          }}>
                          {org.Useremail}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 50,
                        alignItems: 'center',
                      }}></View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
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
    gap: 7,
  },
});
