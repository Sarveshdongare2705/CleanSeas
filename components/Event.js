import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../Colors';
import {useNavigation} from '@react-navigation/native';

const Event = ({event}) => {
  const navigation = useNavigation();
  return (
    <View
      key={event.id}
      style={{
        borderWidth: 0.4,
        
        borderColor: 'gray',
        width: 200,
        height: 220,
        marginRight: 10,
        padding: 5,
        borderRadius: 12,
      }}>
      {event && (
        <Image
          source={{uri: event.uri2}}
          style={{
            position: 'absolute',
            top: 10,
            width: 30,
            height: 30,
            zIndex: 999,
            right: 10,
            borderRadius: 100,
            borderColor: 'white',
            borderWidth: 2,
          }}
        />
      )}
      {event.uri && (
        <Image
          source={{uri: event.uri}}
          style={{
            width: 189,
            height: 100,
            padding: 10,
            objectFit: 'cover',
            borderRadius: 12,
          }}
        />
      )}
      <View>
        <View
          style={{
            flexDirection: 'row',
            gap: 3,
            alignItems: 'center',
            height: 35,
          }}>
          <Image
            source={require('../assets/title.png')}
            style={{width: 16, height: 16, alignItems: 'center'}}
          />
          <Text
            style={{
              color: 'black',
              fontWeight: '700',
              fontSize: 12,
              width: 170,
            }}>
            {event.Title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 189,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 5,
          }}>
          <View style={{flexDirection: 'row', gap: 3}}>
            <Image
              source={require('../assets/date.png')}
              style={{width: 16, height: 16}}
            />
            <Text style={{color: 'black', fontSize: 11}}>{event.Date}</Text>
          </View>
          <View style={{flexDirection: 'row', gap: 3}}>
            <Image
              source={require('../assets/time.png')}
              style={{width: 16, height: 16}}
            />
            <Text style={{color: 'black', fontSize: 11}}>{event.Time}</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginTop: 7,
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              width: 115,
            }}>
            <Image
              source={require('../assets/location.png')}
              style={{width: 16, height: 16}}
            />
            <Text style={{color: 'black', fontSize: 12}}>{event.City}</Text>
          </View>
          <TouchableOpacity
            style={{
              width: 189,
              color: 'white',
              backgroundColor: colors.aquaBlue,
              alignItems: 'center',
              height: 25,
              marginTop: 5,
              alignItems: 'center',
              borderRadius: 10,
            }}
            onPress={() =>
              navigation.navigate('EventDetails', {
                id: event.id,
              })
            }>
            <Text
              style={{
                textAlign: 'center',
                color: 'black',
                fontWeight: '700',
                paddingTop: 4,
                fontSize: 12,
              }}>
              Check Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default Event;
