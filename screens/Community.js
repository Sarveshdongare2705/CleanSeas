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
  TextInput,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import BottomNavigation from '../components/BottomNavigation';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';

const Community = props => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [userimages, Setuserimages] = useState({});
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [searcherr, showSearchErr] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menu, showMenu] = useState(false);

  const getPosts = async () => {
    try {
      setUploading(false);
      const postsSnapshot = await firestore()
        .collection('Posts')
        .orderBy('time', 'desc')
        .get();
      const postsData = [];
      await Promise.all(
        postsSnapshot.docs.map(async doc => {
          const postData = {id: doc.id, ...doc.data()};
          const userSnapshot = await firestore()
            .collection('Users')
            .where('Useremail', '==', postData.Useremail)
            .get();
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            const filename = `${`Post${postData.id}`}`;
            try {
              const url = await storage().ref(filename).getDownloadURL();
              postData.uri = url;
            } catch (error) {
              postData.uri = null;
            }
          }
          postsData.push(postData);
        }),
      );
      setPosts(postsData);
      setUploading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getPosts();
    setRefreshing(false);
  };

  const fetchUserDetails = async () => {
    const userDetails = {};
    const userImages = {};
    await Promise.all(
      posts.map(async post => {
        const userSnapshot = await firestore()
          .collection('Users')
          .where('Useremail', '==', post.Useremail)
          .get();
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          userDetails[post.Useremail] = userData.Username;
          const filename = `${userData.Useremail}`;
          try {
            const url = await storage().ref(filename).getDownloadURL();
            userImages[post.Useremail] = url;
          } catch (error) {
            userImages[post.Useremail] = null;
          }
        }
      }),
    );
    setUsernames(userDetails);
    Setuserimages(userImages);
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        showSearchErr(false);
        getPosts();
        setSearch('');
        showMenu(false);
      });
      return unsubscribe;
    }, []),
  );

  useEffect(() => {
    fetchUserDetails();
  }, [posts]);

  const handleSearch = async searchVal => {
    if (searchVal !== '') {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Username', '==', searchVal)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        const email = userSnapShot.docs[0].data().Useremail;
        try {
          const postsSnapshot = await firestore()
            .collection('Posts')
            .where('Useremail', '==', email)
            .get();
          const postsData = [];
          await Promise.all(
            postsSnapshot.docs.map(async doc => {
              const postData = {id: doc.id, ...doc.data()};
              const userSnapshot = await firestore()
                .collection('Users')
                .where('Useremail', '==', postData.Useremail)
                .get();
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const filename = `${`Post${postData.id}`}`;
                try {
                  const url = await storage().ref(filename).getDownloadURL();
                  postData.uri = url;
                } catch (error) {
                  postData.uri = null;
                }
              }
              postsData.push(postData);
            }),
          );
          setPosts(postsData);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      getPosts();
    }
  };

  const handleDelete = async postId => {
    try {
      await firestore().collection('Posts').doc(postId).delete();
      setPosts(prevPosts =>
        prevPosts.filter(post => post.id !== postId),
      );
      console.log('Delete completed');
    } catch (error) {
      console.error('Error deleting message: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0077be" barStyle="dark-content" />
      <View style={{backgroundColor : '#0077be'}}>
        <Text style={{color: 'white', fontSize: 18, marginTop : 10 , textAlign : 'center' , marginBottom : 10}}>
          Community
        </Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
        <View
          style={{
            marginLeft: 7,
            width: '67%',
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
            placeholder={`Enter whom to search ?`}
            placeholderTextColor="gray"
            style={{
              color: 'black',
              borderRadius: 20,
              width: '90%',
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
                color: '#0077be',
                borderRadius: 20,
                fontSize: 13,
                borderWidth: 0.5,
                borderColor: '#0077be',
              }}>
              Search
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{position: 'absolute', top: '1040%', right: 7, zIndex: 999}}
          onPress={() => props.navigation.navigate('CreatePost')}>
          <View>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                padding: 13,
                width: 120,
                height: 45,
                backgroundColor: 'white',
                textAlign: 'center',
                color: '#0077be',
                borderRadius: 18,
                backgroundColor: '#0077be',
                color: 'white',
                borderColor: '#0077be',
                borderWidth: 0.4,
                marginRight :5,
              }}>
              Create Post
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{padding: 10, paddingBottom: 0, marginTop: 5}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {uploading ? (
          <Loader />
        ) : posts.length > 0 ? (
          posts.map(post => (
            <View
              key={post.id}
              style={{
                marginBottom: 10,
                borderWidth: 0.4,
                borderColor: 'lightgray',
                padding: 10,
                borderRadius: 20,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                {userimages && userimages[post.Useremail] !== null ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Profile', {email: post.Useremail})
                    }>
                    <Image
                      source={{
                        uri:
                          userimages[post.Useremail] !== null &&
                          userimages[post.Useremail],
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 100,
                        borderWidth: 0.3,
                        borderColor: 'lightgray',
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <View></View>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 110,
                  }}>
                  <View
                    style={{
                      flexDirection: 'ro',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{width : 240}}>
                      <Text style={{color: '#0077be', fontSize: 18}}>
                        {usernames[post.Useremail] || 'Loading...'}
                      </Text>
                      <Text style={{color: 'gray', fontSize: 10}}>
                        {post.time.toDate().toLocaleString()}
                      </Text>
                    </View>
                    <View>
                      {currentUser.email === post.Useremail && (
                        <TouchableOpacity onPress={() => handleDelete(post.id)}>
                          <Image
                            source={require('../assets/delete.png')}
                            style={{
                              width: 15,
                              height: 15,
                              borderRadius: 100,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
              <View style={{padding: 10}}>
                <Text style={{color: 'black', fontWeight: '600', fontSize: 13}}>
                  {post.title}
                </Text>
                <Text style={{color: 'black', fontSize: 12}}>{post.desc}</Text>
              </View>
              <View>
                {post && post.uri && post.uri !== null ? (
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate('Image', {
                        uri: post.uri,
                        path: 'Community',
                      })
                    }>
                    <Image
                      source={{uri: post.uri !== null && post.uri}}
                      style={{
                        width: 320,
                        height: 240,
                        borderRadius: 20,
                        padding: 10,
                        objectFit: 'cover',
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <View></View>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text>No posts available</Text>
        )}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

export default Community;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
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
