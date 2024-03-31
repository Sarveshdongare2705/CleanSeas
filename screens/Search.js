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
import {useNavigation} from '@react-navigation/native';

const Search = props => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [searcherr, showSearchErr] = useState(false);
  const [users, setUsers] = useState([]);

  const handleSearch = async searchVal => {
    if (searchVal.trim() !== '') {
      try {
        const usersSnapshot = await firestore()
          .collection('Users')
          .where('Username', '>=', searchVal.trim())
          .where('Username', '<=', searchVal.trim() + '\uf8ff')
          .get();

        const usersData = await Promise.all(
          usersSnapshot.docs.map(async doc => {
            const userData = {id: doc.id, ...doc.data()};
            const filename = `${userData.Useremail}`;
            try {
              const url = await storage().ref(filename).getDownloadURL();
              userData.uri = url;
            } catch (error) {
              console.error('Error fetching download URL:', error);
            }
            return userData;
          }),
        );

        setUsers(usersData);
      } catch (err) {
        console.error(err);
      }
    }
    else{
      setUsers([]);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        setUsers([]);
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
          Search Users
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
        <View style={{paddingTop: 7}}>
          <ScrollView style={{height: 560}}>
            {users.map(org => (
              <TouchableOpacity
                key={org.id}
                onPress={() => {
                  navigation.navigate('Profile', {email: org.Useremail});
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
                          {'Check our profile'}
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
