import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { colors } from '../Colors';

const CalendarGrid = ({currentMonth, month, currentYear, date}) => {
  const [events, setEvents] = useState([]);
  const [dayEvents, setDayEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();
  const getEvents = async () => {
    try {
      const participationsSnapshot = await firestore()
        .collection('Events')
        .get();
      const eventsData = [];
      await Promise.all(
        participationsSnapshot.docs.map(async doc => {
          const eventData = {id: doc.id, ...doc.data()};
          console.log(eventData);
          const eventDate = parseInt(eventData.Date.split('/')[0]);
          const eventMonth = parseInt(eventData.Date.split('/')[1]);
          const eventYear = parseInt(eventData.Date.split('/')[2]);
          console.log(eventMonth + '/' + eventDate + '/' + eventYear);
          if (eventMonth === currentMonth && currentYear === eventYear) {
            const filename = `${`Event${eventData.id}`}`;
            try {
              const url = await storage().ref(filename).getDownloadURL();
              eventData.date = eventDate;
              eventData.uri = url;
            } catch (error) {
              eventData.uri = null;
            }
            eventsData.push(eventData);
          }
        }),
      );
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    }
  };

  const renderDays = () => {
    let days;
    if (
      currentMonth === 1 ||
      currentMonth === 3 ||
      currentMonth === 5 ||
      currentMonth === 7 ||
      currentMonth === 8 ||
      currentMonth === 10 ||
      currentMonth === 12
    ) {
      days = 31;
    } else {
      if (currentMonth === 2) {
        days = 28;
      } else {
        days = 30;
      }
    }
    const grid = [];
    let dayCounter = 1;

    for (let i = 0; i < 5; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (dayCounter <= days) {
          row.push(dayCounter);
          dayCounter++;
        } else {
          row.push('');
        }
      }
      grid.push(row);
    }
    return grid.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, cellIndex) => {
          const cellEvents = events.filter(event => event.date === cell);
          return (
            <View
              key={cellIndex}
              style={[
                styles.cell,
                {
                  backgroundColor: cell === date ? colors.sandyBeige : 'white',
                  color: cell === date ? colors.aquaBlue : 'white',
                  borderWidth: cell ? 0.7 : 0,
                  borderColor : colors.sandyBeige,
                  borderRadius : 5
                },
              ]}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('DateEvents', {dayEvents: cellEvents , month : month , date : cell})
                }>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 10,
                    color: cell === date ? 'white' : 'black',
                    fontWeight: '500',
                  }}>
                  {cell}
                </Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  <View style={{flexDirection: 'row', marginTop: 5}}>
                    {cellEvents.map((event, index) => (
                      <Image
                        key={index}
                        source={{uri: event.uri}}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 100,
                          marginLeft: index > 0 ? -10 : 0,
                          borderWidth : 2,
                          borderColor : 'white',
                        }}
                      />
                    ))}
                  </View>
                </ScrollView>
            </View>
          );
        })}
      </View>
    ));
  };

  useEffect(() => {
    getEvents();
    const interval = setInterval(() => {
      getEvents();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Text style={styles.monthText}>
          {month + ' '} {currentYear}
        </Text>
      </View>
      {renderDays()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 7,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.aquaBlue,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 2,
    height: 50,
    margin : 3,
    borderColor : colors.aquaBlue
  },
});

export default CalendarGrid;
