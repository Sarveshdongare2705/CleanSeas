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
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import BottomNavigation from '../components/BottomNavigation';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Event from '../components/Event';
import {colors} from '../Colors';

const Explore = props => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [searcherr, showSearchErr] = useState(false);
  const [searching, setSearching] = useState(false);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const getEvents = async () => {
    try {
      const participationsSnapshot = await firestore()
        .collection('Events')
        .where('finished', '==', false)
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
  const getCompletedEvents = async user => {
    try {
      const participationsSnapshot = await firestore()
        .collection('Events')
        .where('finished', '==', true)
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

      setCompletedEvents(eventsData);
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
  const handleSearch = async searchVal => {
    if (searchVal.trim() !== '') {
      setText('Searching Events in ' + searchVal);
      setSearching(true);
      try {
        setLoading(true);
        const eventsSnapshot = await firestore()
          .collection('Events')
          .where('City', '>=', searchVal.trim())
          .where('City', '<=', searchVal.trim() + '\uf8ff')
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
        setText('Search Results');
        setLoading(false);
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearching(false);
      setText('');
      getEvents();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = await auth().currentUser;
      setLoading(false);
      setCurrentUser(user);
      getEvents();
      getCompletedEvents(user);
      setSearching(false);
      setSearch('');
      getOrgs();
    };
    if (isFocused) {
      fetchData();
    }
    const intervalId = setInterval(fetchData, 600000);
    return () => clearInterval(intervalId);
  }, [isFocused]);

  return (
    <View
      style={[
        styles.container,
        {flexDirection: 'column', justifyContent: 'space-between'},
      ]}>
      <View>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
          <View
            style={{
              width: '100%',
              height: 45,
              flexDirection: 'row',
              gap: 7,
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderWidth: 0.3,
              borderColor: 'gray',
              paddingLeft: 10,
              color: 'black',
              borderRadius: 3,
              height: 37,
            }}>
            <Image
              source={require('../assets/search.png')}
              style={{width: 17, height: 17}}
            />
            <TextInput
              placeholder={`Search for events in your city`}
              placeholderTextColor="gray"
              style={{
                color: 'black',
                borderRadius: 20,
                width: 180,
              }}
              onChangeText={text => {
                setSearch(text);
                handleSearch(text);
              }}
              value={search}
            />
          </View>
        </View>
        <ScrollView style={{height : '87%'}}>
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 15,
                paddingVertical: 5,
              }}>
              {searching ? text : 'Upcoming Events'}
            </Text>
          </View>
          {loading ? (
            <View
              style={{
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color={colors.aquaBlue} />
            </View>
          ) : (
            <ScrollView horizontal>
              {events.map(event => (
                <Event event={event} />
              ))}
            </ScrollView>
          )}
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 15,
                paddingVertical: 5,
              }}>
              Completed Events
            </Text>
          </View>
          <ScrollView horizontal>
            {completedEvents.map(event => (
              <Event event={event} />
            ))}
          </ScrollView>
          {orgs && (
            <View>
              <Text
                style={{
                  color: 'black',
                  fontSize: 15,
                  paddingVertical: 5,
                }}>
                Organizations
              </Text>
            </View>
          )}
          <ScrollView horizontal>
            {orgs.map(org => (
              <View
                key={org.id}
                style={{
                  borderWidth: 0.5,
                  borderColor: 'lightgray',
                  width: 170,
                  height: 180,
                  flexDirection: 'column',
                  margin: 3,
                  borderRadius: 3,
                  alignItems: 'center',
                  gap: 20,
                }}>
                {org && (
                  <Image
                    source={{uri: org.uri}}
                    style={{
                      top: 10,
                      width: 80,
                      height: 80,
                      borderRadius: 100,
                    }}
                  />
                )}
                <View>
                  <View
                    style={{
                      flexDirection: 'column',
                      gap: 20,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 16,
                        width: 150,
                        textAlign: 'center',
                      }}>
                      {org.Username}
                    </Text>
                    <TouchableOpacity
                      style={{
                        padding: 5,
                        width: '100%',
                        backgroundColor: colors.sandyBeige,
                        borderRadius: 3,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        navigation.navigate('Profile', {email: org.Useremail});
                      }}>
                      <Text style={{color: 'black'}}>Check Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
      <View
        style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal : 7 , 
    paddingVertical : 5,
  },
  content: {
    flex: 1,
  },
});
