import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
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
import {colors} from '../Colors';

const Search = props => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [searcherr, showSearchErr] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [updating, setUpdating] = useState(false);

  const fetchAllUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('Users').get();
      const cache = {};

      usersSnapshot.docs.forEach(doc => {
        const userData = {id: doc.id, ...doc.data()};
        cache[userData.Useremail] = userData.Username;
      });

      setUsersCache(cache);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async searchVal => {
    const searchValLower = searchVal.toLowerCase();
    if (searchValLower.trim() !== '') {
      setUpdating(true);
      showSearchErr(false);
      const matchedEmails = Object.keys(usersCache).filter(email =>
        usersCache[email].toLowerCase().includes(searchValLower),
      );
      if (matchedEmails.length === 0) {
        setUsers([]);
        showSearchErr(true);
        return;
      }
      try {
        const usersData = await Promise.all(
          matchedEmails.map(async email => {
            const userSnapShot = await firestore()
              .collection('Users')
              .where('Useremail', '==', email)
              .get();

            const userDoc = userSnapShot.docs[0];
            const userData = {id: userDoc.id, ...userDoc.data()};

            try {
              const url = await storage().ref(email).getDownloadURL();
              userData.uri = url;
            } catch (error) {
              userData.uri = null;
            }

            return userData;
          }),
        );
        setUpdating(false);
        setUsers(usersData);
        showSearchErr(usersData.length === 0);
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsers([]);
      setUpdating(false);
      showSearchErr(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();

    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        setUpdating(false);
        showSearchErr(false);
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
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: 5,
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderWidth: 0.3,
              borderColor: 'gray',
              paddingLeft: 10,
              color: 'black',
              borderRadius: 3,
              height: 38,
            }}>
            <Image
              source={require('../assets/search.png')}
              style={{width: 17, height: 17}}
            />
            <TextInput
              placeholder={`Search for users`}
              placeholderTextColor="gray"
              style={{
                color: 'black',
                width: '90%',
              }}
              onChangeText={text => {
                setSearch(text);
                handleSearch(text);
              }}
              value={search}
            />
          </View>
        </View>
        <View style={{paddingTop: 7}}>
          {searcherr ? (
            <View>
              <Text style={{color: 'black'}}>{'No users Found'}</Text>
            </View>
          ) : (
            <ScrollView style={{height: '90%'}}>
              {users.length !== 0 ? (
                <View style={{marginBottom: 10}}>
                  <Text style={{color: 'black'}}>
                    {users.length === 1
                      ? users.length + ' User Found '
                      : users.length + ' Users Found '}
                  </Text>
                </View>
              ) : (
                updating && (
                  <View
                    style={{
                      marginBottom: 10,
                      alignItems: 'flex-start',
                      marginLeft: 5,
                    }}>
                    <ActivityIndicator color={'black'} size={'small'} />
                  </View>
                )
              )}
              {users.map(user => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => {
                    navigation.navigate('Profile', {email: user.Useremail});
                  }}>
                  <View
                    key={user.id}
                    style={{
                      borderWidth: 0.5,
                      borderColor: 'lightgray',
                      width: '100%',
                      height: 70,
                      marginRight: 10,
                      flexDirection: 'row',
                      borderRadius: 3,
                      paddingLeft: 10,
                      gap: 5,
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    {user.uri ? (
                      <Image
                        source={{uri: user.uri}}
                        style={{
                          marginTop: -14,
                          top: 7,
                          width: 50,
                          height: 50,
                          borderRadius: 100,
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../assets/profile.png')}
                        style={{
                          marginTop: -14,
                          top: 7,
                          width: 40,
                          height: 40,
                          marginRight: 10,
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
                            {user.Username}
                          </Text>
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 12,
                              width: 270,
                            }}>
                            {'Check out profile'}
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
          )}
        </View>
      </View>
      <View
        style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 7,
    paddingVertical: 7,
    height: '100%',
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
