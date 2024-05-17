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
import { colors } from '../Colors';

const Post = ({post, currentUserEmail}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [fetchedDetails, setFetchedDetails] = useState(false);
  const navigation = useNavigation();
  const handleDelete = async postId => {
    try {
      await firestore().collection('Posts').doc(postId).delete();
      console.log('Delete completed');
    } catch (error) {
      console.error('Error deleting message: ', error);
    }
  };

  const fetchDetails = async () => {
    try {
      const likesSnapshot = await firestore()
        .collection('Likes')
        .where('PostId', '==', post.id)
        .get();
      setLikes(likesSnapshot.docs.length);
      setFetchedDetails(true);
    } catch (err) {
      console.error(err);
    }
  };
  const checkLike = async () => {
    const likeSnapshot = await firestore()
      .collection('Likes')
      .where('Useremail', '==', currentUserEmail)
      .where('PostId', '==', post.id)
      .get();
    if (!likeSnapshot.empty) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  };
  const handleLike = async () => {
    try {
      setLiked(true);
      setLikes(likes + 1);
      await firestore().collection('Likes').add({
        Useremail: currentUserEmail,
        PostId: post.id,
      });
    } catch (error) {
      console.error('Error participating:', error);
    }
  };
  const handleDisLike = async () => {
    try {
      setLiked(false);
      setLikes(likes - 1);
      const likeSnapshot = await firestore()
        .collection('Likes')
        .where('PostId', '==', post.id)
        .where('Useremail', '==', currentUserEmail)
        .get();

      if (!likeSnapshot.empty) {
        const likeDoc = likeSnapshot.docs[0];
        await likeDoc.ref.delete();
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setLikes(0);
        setLiked(false);
        setFetchedDetails(false);
        checkLike();
        fetchDetails();
      });
      return unsubscribe;
    }, []),
  );

  if (fetchedDetails) {
    return (
      <View
        key={post.id}
        style={{
          marginBottom: 10,
          borderWidth: 0.4,
          borderColor: 'lightgray',
          padding: 10,
          borderRadius: 7,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
          {post.profileImg !== null ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Profile', {
                  email: post.Useremail,
                })
              }>
              <Image
                source={{
                  uri: post.profileImg,
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  borderWidth: 0.3,
                  borderColor: 'lightgray',
                }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Profile', {
                  email: post.Useremail,
                })
              }>
              <Image
                source={require('../assets/profile.png')}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  borderWidth: 0.3,
                  borderColor: 'lightgray',
                }}
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{width: '87%'}}>
                <Text style={{color: 'black', fontSize: 16, fontWeight: '500'}}>
                  {post.Username || 'Loading...'}
                </Text>
              </View>
              <View>
                {currentUserEmail === post.Useremail && (
                  <TouchableOpacity onPress={() => handleDelete(post.id)}>
                    <Image
                      source={require('../assets/delete.png')}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 100,
                      }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={{paddingVertical: 10}}>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 14,
              width: '100%',
            }}>
            {post.title}
          </Text>
          <View>
            {post.postImg !== null ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Image', {
                    uri: post.postImg,
                    path: 'Profile',
                    email: post.Useremail,
                  })
                }
                style={{paddingVertical: 10}}>
                <Image
                  source={{uri: post.postImg}}
                  style={{
                    maxWidth: '100%',
                    height: 180,
                    borderRadius: 5,
                    objectFit: 'cover',
                  }}
                />
              </TouchableOpacity>
            ) : (
              <View></View>
            )}
          </View>
          <Text style={{color: 'black', fontSize: 12, width: '100%'}}>
            {post.desc}
          </Text>
          <View style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
            {liked ? (
              <TouchableOpacity
                style={{paddingVertical: 15}}
                onPress={handleDisLike}>
                <Image
                  source={require('../assets/liked.png')}
                  style={{
                    width: 21,
                    height: 21,
                  }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{paddingVertical: 15}}
                onPress={handleLike}>
                <Image
                  source={require('../assets/notliked.png')}
                  style={{
                    width: 21,
                    height: 21,
                  }}
                />
              </TouchableOpacity>
            )}
            <Text style={{color: 'black', fontSize: 14, fontWeight: '400'}}>
              {likes === 1 ? likes+' Like' : likes+' Likes'}
            </Text>
          </View>
          <Text
            style={{
              color: 'black',
              fontSize: 9,
              marginBottom: -10,
            }}>
            {post.time.toDate().toLocaleString()}
          </Text>
        </View>
      </View>
    );
  }
};

export default Post;
