import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import Loader from '../components/Loader';
import CalendarGrid from '../components/Calender';
import {colors} from '../Colors';
import FastImage from 'react-native-fast-image';
import Event from '../components/Event';

const Home = props => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [profileImg, setProfileImg] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [bg1, setBg1] = useState('white');
  const [bg2, setBg2] = useState('white');
  const [bg3, setBg3] = useState('white');

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

  const getAllEvents = async () => {
    try {
      setLoading(true);
      updateFlags();
      const eventsSnapshot = await firestore()
        .collection('Events')
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
      setLoading(false);
      setText('Upcoming Events');
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    }
  };
  const getEvents = async loc => {
    if (loc) {
      try {
        setBg2('white');
        setBg3('white');
        setBg1(colors.sandyBeige);
        setText('Upcoming Events in ' + loc);
        setEvents([]);
        setLoading(true);
        [];
        const userSnapShot = await firestore()
          .collection('Users')
          .where('Useremail', '==', userData.Useremail)
          .get();
        if (!userSnapShot.empty) {
          const eventsSnapshot = await firestore()
            .collection('Events')
            .where('City', '==', loc)
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
          setLoading(false);
          setEvents(eventsData);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setEvents([]);
    }
  };
  const fetchUserData = async currentUser => {
    console.log('hi');
    const userSnapShot = await firestore()
      .collection('Users')
      .where('Useremail', '==', currentUser.email)
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
    console.log('User Data : ', userData);
  };
  const getMyParticipations = async user => {
    try {
      setBg3('white');
      setBg1('white');
      setBg2(colors.sandyBeige);
      setText('My Participations');
      setLoading(true);
      setText('My Participations');
      const userSnapShot = await firestore()
        .collection('Participations')
        .where('Useremail', '==', user.email)
        .get();

      const events = [];
      userSnapShot.forEach(async doc => {
        const participation = doc.data();
        const eventId = participation.EventId;

        const eventSnapshot = await firestore()
          .collection('Events')
          .doc(eventId).get();

        if (eventSnapshot.exists) {
          const eventData = {id: eventId, ...eventSnapshot.data()};
          const filename = `${`Event${eventId}`}`;
          try {
            const url = await storage().ref(filename).getDownloadURL();
            eventData.uri = url;
            const file2 = `${eventData.Useremail}`;
            const url2 = await storage().ref(file2).getDownloadURL();
            eventData.uri2 = url2;
          } catch (error) {
            eventData.uri = null;
          }
          events.push(eventData);
        }
      });
      setEvents(events);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        updateFlags();
        setCurrentUser(user);
        fetchUserData(user);
      });

      return unsubscribe;
    }, []),
  );
  useEffect(() => {
    const fetchData = async () => {
      setBg3('white');
      setBg1('white');
      setBg2('white');
      const user = await auth().currentUser;
      getAllEvents();
    };
    fetchData();
    const intervalId = setInterval(fetchData, 100000);
    return () => clearInterval(intervalId);
  }, []);

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

  const [emoji, setEmoji] = useState('🌊');
  const emojis = ['🌊', '🌴', '🏖️', '🐠'];
  const emojiInterval = 5000;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentIndex = emojis.indexOf(emoji);
      const nextIndex = (currentIndex + 1) % emojis.length;
      setEmoji(emojis[nextIndex]);
    }, emojiInterval);
    return () => clearInterval(intervalId);
  }, [emoji, emojis]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          alignItems: 'center',
          paddingHorizontal: '3%',
          paddingTop: 15,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={styles.heading}>{emoji + 'CleanSeas'}</Text>
        <View style={{flexDirection: 'row', gap: 5}}>
          <FastImage
            source={{uri: profileImg}}
            style={{width: 27, height: 27, borderRadius: 20}}
            resizeMode={FastImage.resizeMode.cover}
          />
          <FastImage
            source={require('../assets/chat.png')}
            style={{width: 26, height: 26, alignItems: 'flex-end'}}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </View>
      <View style={{height: '45%'}}>
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
      <View style={{paddingLeft: '2%', paddingTop: '1%', left: 0}}>
        <ScrollView horizontal>
          <TouchableOpacity
            style={{
              padding: 2,
              width: 170,
              borderWidth: 1,
              borderColor: colors.sandyBeige,
              borderRadius: 10,
              alignItems: 'center',
              marginRight: 6,
              backgroundColor: bg1,
            }}
            onPress={() => getEvents(userData.Location)}>
            <Text
              style={{
                fontSize: 14,
                color: colors.aquaBlue,
                textAlign: 'center',
                fontWeight: '900',
              }}>
              {userData && userData.Location}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 2,
              borderWidth: 1,
              borderColor: colors.sandyBeige,
              width: 170,
              borderRadius: 10,
              alignItems: 'center',
              marginRight: 5,
              backgroundColor: bg2,
            }}
            onPress={() => getMyParticipations(currentUser)}>
            <Text
              style={{
                fontSize: 14,
                color: colors.aquaBlue,
                textAlign: 'center',
                fontWeight: '900',
              }}>
              {'My Participations'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Text
        style={{
          fontSize: 15,
          color: 'black',
          paddingLeft: '3%',
          paddingTop: '2%',
          paddingBottom: '-5%',
        }}>
        {text}
      </Text>
      {loading ? (
        <View
          style={{height: '40.5%', alignItems: 'center', paddingTop: '25%'}}>
          <ActivityIndicator size="large" color={colors.aquaBlue} />
        </View>
      ) : (
        <ScrollView horizontal style={{margin: 10}}>
          {events.map(event => (
            <Event event={event} />
          ))}
        </ScrollView>
      )}
      <View
        style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
        <BottomNavigation />
      </View>
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
    color: 'black',
    fontSize: 25,
    fontWeight: '700',
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
