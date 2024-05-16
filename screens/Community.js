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
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import BottomNavigation from '../components/BottomNavigation';
import Post from '../components/Post';
import {colors} from '../Colors';

const Community = props => {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getPosts = async () => {
    try {
      setUpdating(true);
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
      setUpdating(false);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const user = await auth().currentUser;
      setCurrentUser(user);
      getPosts();
    };
    fetchData();
    const intervalId = setInterval(fetchData, 100000);
    return () => clearInterval(intervalId);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getPosts();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={{height: '88%'}}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {updating ? (
            <ActivityIndicator size="large" color={colors.aquaBlue} />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <Post post={post} currentUserEmail={currentUser.email} />
            ))
          ) : (
            <Text
              style={{
                color: 'black',
                width: '90%',
              }}>
              No posts available
            </Text>
          )}
          <View style={{width: '100%', height: 90}}></View>
        </ScrollView>
      </View>
      <View
        style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
        <BottomNavigation />
      </View>
    </View>
  );
};
export default Community;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingVertical: 12,
    height: '100%',
  },
});
