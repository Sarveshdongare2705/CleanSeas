import React, {useEffect, useState, useCallback} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {colors} from '../Colors';
import FastImage from 'react-native-fast-image';
import Post from '../components/Post';

const Profile = ({route}) => {
  const navigation = useNavigation();
  const routeEmail = route.params.email;
  console.log('Route email= ', routeEmail);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [participations, setParticipations] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [events, setEvents] = useState(0);
  const [hasFollowed, setHasFolllowed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsCount, setPostsCount] = useState(0);

  const fetchUserData = async () => {
    if (routeEmail) {
      setUploading(true);
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', routeEmail)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
        const filename = `${routeEmail}`;
        try {
          url = await storage().ref(filename).getDownloadURL();
          setProfileImg(url);
        } catch (error) {
          setProfileImg(null);
        }
      }
      setUploading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await auth().signOut();
      setCurrentUser(null);
      setUserData(null);
      setProfileImg(null);
      navigation.navigate('Welcome');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParticipations = async () => {
    try {
      const participantsSnapshot = await firestore()
        .collection('Participations')
        .where('Useremail', '==', routeEmail)
        .get();

      setParticipations(participantsSnapshot.docs.length);

      const followersSnapshot = await firestore()
        .collection('Followers')
        .where('followedEmail', '==', routeEmail)
        .get();

      setFollowers(followersSnapshot.docs.length);

      const followingSnapshot = await firestore()
        .collection('Followers')
        .where('followerEmail', '==', routeEmail)
        .get();

      setFollowing(followingSnapshot.docs.length);

      const eventsSnapshot = await firestore()
        .collection('Posts')
        .where('Useremail', '==', routeEmail)
        .get();

      setPostsCount(eventsSnapshot.docs.length);
    } catch (err) {
      console.error(err);
    }
  };

  const checkFollow = async user => {
    const partSnapshot = await firestore()
      .collection('Followers')
      .where('followerEmail', '==', user.email)
      .where('followedEmail', '==', routeEmail)
      .get();

    if (!partSnapshot.empty) {
      setHasFolllowed(true);
    } else {
      setHasFolllowed(false);
    }
  };

  const handleFollow = async () => {
    try {
      await firestore().collection('Followers').add({
        followerEmail: currentUser.email,
        followedEmail: userData.Useremail,
      });
      setHasFolllowed(true);
      setFollowers(followers + 1);
    } catch (error) {
      console.error('Error participating:', error);
    }
  };
  const cancelFollow = async () => {
    try {
      const partSnapshot = await firestore()
        .collection('Followers')
        .where('followerEmail', '==', currentUser.email)
        .where('followedEmail', '==', userData.Useremail)
        .get();

      if (!partSnapshot.empty) {
        const partDoc = partSnapshot.docs[0];
        await partDoc.ref.delete();
        setHasFolllowed(false);
        setFollowers(followers - 1);
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
    }
  };
  const getPosts = async email => {
    console.log(email);
    try {
      const postsSnapshot = await firestore()
        .collection('Posts')
        .where('Useremail', '==', email)
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
            const user = userSnapshot.docs[0].data();
            postData.Username = user.Username;
            const profileImg = `${user.Useremail}`;
            const postImg = `${`Post${postData.id}`}`;
            try {
              const url2 = await storage().ref(profileImg).getDownloadURL();
              postData.profileImg = url2;
              const url1 = await storage().ref(postImg).getDownloadURL();
              postData.postImg = url1;
            } catch (error) {
              postData.postImg = null;
            }
          }
          postsData.push(postData);
        }),
      );
      setPosts(postsData);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setPostsCount(0);
        setCurrentUser(user);
        getPosts(routeEmail);
        fetchUserData();
        setFollowers(0);
        setParticipations(0);
        setFollowing(0);
        setHasFolllowed(false);
        checkFollow(user);
        fetchParticipations();
      });
      return unsubscribe;
    }, [routeEmail]),
  );

  const onRefresh = async () => {
    setUploading(false);
    await fetchUserData();
    await getPosts(routeEmail);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={styles.content}>
        {currentUser && userData !== null && (
          <View style={styles.section1}>
            <Text style={styles.name}>{userData.Username}</Text>
            <View style={{flexDirection: 'row', gap: 5}}>
              {currentUser.email === routeEmail && (
                <View style={{flexDirection: 'row', gap: 7}}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreatePost')}>
                    <FastImage
                      source={require('../assets/add.png')}
                      style={{width: 24, height: 24, alignItems: 'flex-end'}}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <FastImage
                      source={require('../assets/status.png')}
                      style={{width: 24, height: 24, alignItems: 'flex-end'}}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {userData.Role.trim() === 'Organization' && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Chat', {
                      email: routeEmail,
                      senderEmail: currentUser.email,
                    })
                  }>
                  <FastImage
                    source={require('../assets/chat.png')}
                    style={{width: 24, height: 24, alignItems: 'flex-end'}}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {uploading ? (
          <ActivityIndicator
            size="large"
            color={colors.aquaBlue}
            style={{height: '100%'}}
          />
        ) : (
          userData !== null &&
          currentUser !== null && (
            <ScrollView
              style={styles.profile}
              refreshControl={
                <RefreshControl refreshing={uploading} onRefresh={onRefresh} />
              }>
              <View style={styles.section2}>
                {profileImg ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Image', {
                        uri: profileImg,
                        path: 'Profile',
                        email: routeEmail,
                      })
                    }
                    style={{
                      position: 'relative',
                    }}>
                    <FastImage
                      source={{uri: profileImg}}
                      style={{
                        width: 75,
                        height: 75,
                        alignItems: 'flex-end',
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: 'black',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                ) : (
                  <FastImage
                    source={require('../assets/profile.png')}
                    style={{
                      width: 72,
                      height: 72,
                      alignItems: 'flex-end',
                      borderRadius: 100,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                )}
                <View style={styles.details}>
                  <View style={styles.detail}>
                    <Text style={styles.value}>{participations}</Text>
                    <Text style={styles.heading}>participations</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.value}>{followers}</Text>
                    <Text style={styles.heading}>followers</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.value}>{following}</Text>
                    <Text style={styles.heading}>following</Text>
                  </View>
                </View>
              </View>
              <View style={styles.section3}>
                <Text style={styles.heading}>{userData.Location}</Text>
                {userData.age && userData.gender && (
                  <Text style={styles.heading}>
                    {userData && userData.Role.trim() === 'Organization' ? 'Year Established : ' + userData.age : userData.age + ' ' + userData.gender}
                  </Text>
                )}
                <Text style={styles.heading}>{userData.Useremail}</Text>
                {userData.desc && (
                  <Text style={styles.heading}>{userData.desc}</Text>
                )}
              </View>
              <View style={styles.section4}>
                {currentUser.email === routeEmail ? (
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.btntext}>Edit Profile</Text>
                  </TouchableOpacity>
                ) : hasFollowed ? (
                  <TouchableOpacity style={styles.btn} onPress={cancelFollow}>
                    <Text style={styles.btntext}>Unfollow</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.btn} onPress={handleFollow}>
                    <Text style={styles.btntext}>Follow</Text>
                  </TouchableOpacity>
                )}
                {currentUser.email === routeEmail && (
                  <TouchableOpacity style={styles.btn} onPress={handleLogout}>
                    <Text style={styles.btntext}>Logout</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.heading}>
                <Text
                  style={[
                    styles.value,
                    {
                      fontSize: 15,
                      borderBottomWidth: 0.3,
                      borderBottomColor: 'lightgray',
                      color: 'black',
                      marginBottom: 10,
                      paddingHorizontal: 5,
                    },
                  ]}>
                  {postsCount + ' Posts'}
                </Text>
              </View>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Post post={post} currentUserEmail={currentUser.email} />
                ))
              ) : (
                <Text>No posts available</Text>
              )}
              <View style={{width: '100%', height: 90}}></View>
            </ScrollView>
          )
        )}
      </View>
      <View
        style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  content: {
    height: '92%',
    marginBottom: 20,
  },
  profile: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  section1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    position: 'fixed',
    top: 10,
    left: 0,
    paddingHorizontal: 7,
  },
  section4: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  section3: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  section2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  name: {
    color: 'black',
    marginLeft: 5,
    fontSize: 20,
    fontWeight: '500',
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '75%',
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  value: {
    color: 'black',
    fontWeight: '900',
    fontSize: 18,
  },
  heading: {
    color: 'black',
  },
  btn: {
    width: '49%',
    height: 30,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btntext: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
});
