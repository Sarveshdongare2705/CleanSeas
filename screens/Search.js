import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const Search = (props) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [searcherr, showSearchErr] = useState(false);
  const [events, setEvents] = useState([]);
  const handleSearch = async searchVal => {
    try {
      const eventsSnapshot = await firestore()
        .collection('Events')
        .where('City', '==', searchVal)
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
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        setEvents([]);
        setSearch('');
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View
      style={[styles.container, {flex: 1, justifyContent: 'space-between'}]}>
      <View>
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            marginBottom: 0,
            marginTop: 15,
            fontSize: 16,
          }}>
          Search Events
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
          <View
            style={{
              marginLeft: 15,
              width: 230,
              height: 45,
              flexDirection: 'row',
              gap: 7,
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderWidth: 0.3,
              borderColor: 'gray',
              paddingLeft: 10,
              color: 'black',
              borderRadius: 20,
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
          <TouchableOpacity onPress={() => handleSearch(search)}>
            <View style={{position: 'relative'}}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  padding: 9,
                  width: 100,
                  height: 36,
                  margin: 10,
                  backgroundColor: 'white',
                  textAlign: 'center',
                  color: '#57DDFB',
                  borderRadius: 20,
                  fontSize: 13,
                  borderWidth: 0.5,
                  borderColor: '#57DDFB',
                }}>
                Search
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View>
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
        </View>
      </View>
      <BottomNavigation />
    </View>
  );
};

export default Search;

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
