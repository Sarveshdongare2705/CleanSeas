import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const ApiPage = () => {
  const [search, setSearch] = useState('');
  const [beachData, setBeachData] = useState(null);
  const [err , showErr] = useState(false);

  useEffect(() => {
    if (search!=='') {
      fetchBeaches(search);
    }
    else{
        setBeachData([]);
    }
  }, [search]);

  const fetchBeaches = async searchTerm => {
    try {
      const response = await fetch(
        `https://ae39-2401-4900-1aa6-bd6f-e599-c8f6-d197-5330.ngrok-free.app/beaches?country=${searchTerm}`,
      );
      if (!response.ok) {
        showErr(true)
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBeachData(data);
      if (data && data.length > 0) {
        fetchImages(data);
      }
    } catch (error) {
      console.error('Error fetching beaches:', error);
      setBeachData([]);
    }
  };

  const fetchImages = async beachData => {
    try {
      const images = await Promise.all(
        beachData.map(async beach => {
          const response = await axios.get(
            'https://api.unsplash.com/search/photos',
            {
              params: {
                query:
                  beach['Beach Name'] +
                  'beach' +
                  beach['Location'] +
                  beach['City'],
                per_page: 1,
                client_id: 'yfprYqQxeVYxV9Bzx_B0i6RFV9qL4yrpMiNr6_v2W_k',
              },
            },
          );
          return response.data.results[0]?.urls.small;
        }),
      );
      // Update beachData with images
      setBeachData(prevState => {
        return prevState.map((beach, index) => ({
          ...beach,
          image: images[index],
        }));
      });
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  return (
    <View style={{backgroundColor: 'white' , height : '100%'}}>
      <StatusBar backgroundColor="#0077be" barStyle="dark-content" />
      <View style={{backgroundColor: '#0077be'}}>
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            marginTop: 20,
            textAlign: 'center',
            marginBottom: 20,
          }}>
          Search Beaches Across the World
        </Text>
      </View>
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
            placeholder={`Search in your country`}
            placeholderTextColor="gray"
            style={{
              color: 'black',
              borderRadius: 20,
              width: 180,
            }}
            onChangeText={text => {
              setSearch(text);
            }}
            value={search}
          />
        </View>
        <TouchableOpacity onPress={() => fetchBeaches(search)}>
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
      {beachData !== null ? (
        <View style={{paddingBottom : 120}}>
          <ScrollView>
            <View>
              {beachData.map((beach, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                  }}>
                  {beach.image && (
                    <Image
                      source={{uri: beach.image}}
                      style={{width: 100, height: 60}}
                    />
                  )}
                  <View style={{flexDirection: 'column', gap: 10}}>
                    <Text
                      style={{color: 'black', marginLeft: 10, fontSize: 15}}>
                      {beach['Beach Name'] + '-' + beach['Location']}
                    </Text>
                    <Text style={{color: 'gray', marginLeft: 10}}>
                      {beach['City'] + '  ' + beach['Country']}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )
      :
      (
        err &&<View><Text style={{color : 'gray' , alignItems : 'center' , justifyContent : 'center'}}>Currently No Data Found</Text></View>
      )
    }
    </View>
  );
};

export default ApiPage;
