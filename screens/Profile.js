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
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [participations, setParticipations] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
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
        let profileImg = null;
        const filename = `${routeEmail}`;

        try {
          const url = await storage().ref(filename).getDownloadURL();
          profileImg = url;
        } catch (error) {
          profileImg = null;
        }

        setUserData(userData);
        setProfileImg(profileImg);
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

      const eventsSnapshot = await firestore()
        .collection('Events')
        .where('Useremail', '==', routeEmail)
        .get();

      const followersSnapshot = await firestore()
        .collection('Followers')
        .where('followedEmail', '==', routeEmail)
        .get();

      const followingSnapshot = await firestore()
        .collection('Followers')
        .where('followerEmail', '==', routeEmail)
        .get();

      const postsSnapshot = await firestore()
        .collection('Posts')
        .where('Useremail', '==', routeEmail)
        .get();

      const participations = participantsSnapshot.docs.length;
      const eventsCount = eventsSnapshot.docs.length;
      const followers = followersSnapshot.docs.length;
      const following = followingSnapshot.docs.length;
      const postsCount = postsSnapshot.docs.length;

      setParticipations(participations);
      setEventsCount(eventsCount);
      setFollowers(followers);
      setFollowing(following);
      setPostsCount(postsCount);
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
        setFollowers(0);
        setParticipations(0);
        setFollowing(0);
        setHasFolllowed(false);
        setCurrentUser(user);
        fetchUserData();
        checkFollow(user);
        fetchParticipations();
        getPosts(routeEmail);
      });
      return unsubscribe;
    }, [routeEmail]),
  );

  const onRefresh = async () => {
    setUploading(false);
    await fetchUserData();
    await getPosts(routeEmail);
    await fetchParticipations();
  };

  const handlePostDeletion = postId => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setPostsCount(prevCount => prevCount - 1);
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
                    onPress={() =>
                      navigation.navigate('CreatePost', {
                        routeEmail: currentUser.email,
                        role: userData && userData.Role.trim(),
                      })
                    }>
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
            color={colors.sandyBeige}
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
                <View
                  style={{
                    borderWidth: 3,
                    borderColor: 'white',
                    borderColor: colors.sandyBeige,
                    borderRadius: 100,
                    marginLeft: -3,
                  }}>
                  {profileImg ? (
                    <TouchableOpacity
                      onLongPress={() =>
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
                          width: 80,
                          height: 80,
                          alignItems: 'flex-end',
                          borderRadius: 100,
                          borderWidth: 2,
                          borderColor: 'white',
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  ) : userData && userData.gender === 'Male' ? (
                    <FastImage
                      source={require('../assets/profileImage.png')}
                      style={{
                        width: 70,
                        height: 70,
                        alignItems: 'flex-end',
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : userData && userData.gender === 'Female' ? (
                    <FastImage
                      source={require('../assets/profileImage2.png')}
                      style={{
                        width: 70,
                        height: 70,
                        alignItems: 'flex-end',
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <FastImage
                      source={require('../assets/profileImage1.png')}
                      style={{
                        width: 70,
                        height: 70,
                        alignItems: 'flex-end',
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  )}
                </View>
                <View style={styles.details}>
                  {userData && userData.Role.trim() === 'Organization' ? (
                    <View style={styles.detail}>
                      <Text style={styles.value}>{eventsCount}</Text>
                      <Text style={styles.heading}>events</Text>
                    </View>
                  ) : (
                    <View style={styles.detail}>
                      <Text style={styles.value}>{participations}</Text>
                      <Text style={styles.heading}>participations</Text>
                    </View>
                  )}
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
                    {userData && userData.Role.trim() === 'Organization'
                      ? 'Year Established : ' + userData.age
                      : userData.age + ' ' + userData.gender}
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
                  <TouchableOpacity
                    style={[styles.btn, {width: '100%'}]}
                    onPress={cancelFollow}>
                    <Text style={styles.btntext}>Unfollow</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.btn, {width: '100%'}]}
                    onPress={handleFollow}>
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
                {userData &&
                currentUser &&
                userData.Role.trim() === 'Organization' &&
                currentUser.email === routeEmail ? (
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      {
                        width: '100%',
                        marginBottom: 12,
                        height: 36,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 15,
                      },
                    ]}
                    onPress={() => navigation.navigate('CreateDrive')}>
                    <Text style={styles.btntext}>Create Event</Text>
                    <FastImage
                      source={require('../assets/forward.png')}
                      style={{
                        width: 24,
                        height: 24,
                        alignItems: 'flex-end',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                ) : (
                  <View></View>
                )}
                <Text
                  style={[
                    {
                      fontSize: 15,
                      borderBottomWidth: 0.3,
                      borderBottomColor: 'lightgray',
                      color: 'black',
                      marginBottom: 10,
                      paddingHorizontal: 5,
                    },
                  ]}>
                  {postsCount == 1
                    ? postsCount + ' Post'
                    : postsCount + ' Posts'}
                </Text>
              </View>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUserEmail={currentUser.email}
                    onDelete={handlePostDeletion}
                    role={userData && userData.Role.trim()}
                  />
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
    width: '84%',
    marginLeft: -10,
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  value: {
    color: 'black',
    fontWeight: '600',
    fontSize: 20,
  },
  heading: {
    color: 'black',
  },
  btn: {
    width: '49%',
    height: 30,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandyBeige,
  },
  btntext: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
});
