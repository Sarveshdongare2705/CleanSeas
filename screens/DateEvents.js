import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const DateEvents = ({route}) => {
    const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  useEffect(() => {
    setEvents(route.params.dayEvents);
  }, [route.params.dayEvents]);
  console.log('Day--->', events);
  return (
    <View>
      <View>
        <Text
          style={{
            color: 'black',
            fontSize: 20,
            padding: 10,
            marginTop: 0,
            marginBottom: -10,
          }}>
          {'Scheduled Events on  '+route.params.date+ '  ' + route.params.month}
        </Text>
      </View>
      <ScrollView style={{margin: 10 , marginBottom : 50}}>
        {events.map(event => (
          <View
            key={event.id}
            style={{
              borderWidth: 0.3,
              borderColor: 'gray',
              width: '100%',
              height: 360,
              marginRight: 10,
              marginBottom : 10
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
                  width: '100%',
                  height: 208,
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
                  style={{width: 25, height: 25, alignItems: 'center'}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: 17,
                    width: '90%',
                    height : 60,
                    marginTop : 40
                  }}>
                  {event.Title}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 120,
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', marginTop: 20, gap: 7, alignItems : 'center'}}>
                  <Image
                    source={require('../assets/date.png')}
                    style={{width: 25, height: 25}}
                  />
                  <Text style={{color: 'black', fontSize: 16}}>
                    {event.Date}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 20, gap: 7 , alignItems : 'center'}}>
                  <Image
                    source={require('../assets/time.png')}
                    style={{width: 25, height: 25}}
                  />
                  <Text style={{color: 'black', fontSize: 16}}>
                    {event.Time}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center' , gap : 110}}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 7,
                    gap: 7,
                    width: 115,
                  }}>
                  <Image
                    source={require('../assets/location.png')}
                    style={{width: 25, height: 25}}
                  />
                  <Text style={{color: 'black', fontSize: 20}}>
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
    </View>
  );
};

export default DateEvents;
