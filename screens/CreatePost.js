import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Loader from '../components/Loader';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {colors} from '../Colors';

const CreatePost = () => {
  const route = useRoute();
  const {routeEmail, role, post} = route.params;
  const navigation = useNavigation();
  console.log('hi ' + routeEmail + role);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [titleErr, showTitleErr] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [linkId, setLinkId] = useState('');
  const [isLink, setisLink] = useState(false);
  const [events, setEvents] = useState([]);
  const getEvents = async () => {
    try {
      const eventsSnapshot = await firestore()
        .collection('Events')
        .where('Useremail', '==', routeEmail)
        .get();
      const eventsData = [];
      await Promise.all(
        eventsSnapshot.docs.map(async doc => {
          const eventData = {id: doc.id, ...doc.data()};
          const filename = `${`Event${eventData.id}`}`;
          try {
            const url = await storage().ref(filename).getDownloadURL();
            eventData.uri = url;
          } catch (error) {
            eventData.uri = null;
          }
          eventsData.push(eventData);
        }),
      );
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        post && post.isLink ? setisLink(post.isLink) : setLinkId(false);
        post ? setLinkId(post.EventId) : setLinkId('');
        getEvents();
        setImage(null);
        post ? setTitle(post.title) : setTitle('');
        post ? setDescription(post.desc) : setDescription('');
        setShowMenu(false);
      });
      return unsubscribe;
    }, []),
  );

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
    } else {
      console.log(result);
      setImage(result);
    }
  };

  useEffect(() => {
    showTitleErr(title === '');
  }, [title]);

  const createPost = async () => {
    try {
      if (!titleErr) {
        setUploading(true);
        const timestamp = firestore.Timestamp.now();
        let PostData = {
          Useremail: routeEmail,
          title: title,
          desc: description,
          time: timestamp,
          isLink: isLink,
        };

        if (isLink) {
          PostData.EventId = linkId;
        }
        const PostRef = await firestore().collection('Posts').add(PostData);
        console.log('Post posted');

        if (image !== null) {
          const postId = PostRef.id;
          const reference = storage().ref(`Post${postId}`);
          await reference.putFile(image.assets[0].uri);
          console.log('Image uploaded successfullly');
        }
        setUploading(false);
        navigation.navigate('Community');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updatePost = async () => {
    try {
      if (!titleErr) {
        setUploading(true);
        const timestamp = firestore.Timestamp.now();
        let PostData = {
          Useremail: routeEmail,
          title: title,
          desc: description,
          time: timestamp,
          isLink: isLink,
        };

        if (isLink) {
          PostData.EventId = linkId;
        }
        else{
          PostData.EventId = '';
        }
        await firestore().collection('Posts').doc(post.id).update(PostData);
        console.log('Post updated');
        console.log('PostImage : ', post.postImg);

        if (image !== null) {
          try {
            const postId = post.id;
            const reference = storage().ref(`Post${postId}`);
            await reference.putFile(image.assets[0].uri);
            console.log('Image uploaded successfully');
          } catch (err) {
            console.error('Error updating image : ', err);
          }
        }

        setUploading(false);
        navigation.navigate('Community');
      }
    } catch (err) {
      console.error('Error updating Post : ', err);
    }
  };

  return (
    <View style={{height: '100%', backgroundColor: 'white'}}>
      <View>
        <TouchableOpacity
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Profile', {email: routeEmail})}>
          <Image
            source={require('../assets/back.png')}
            style={{width: 20, height: 20, alignItems: 'flex-start'}}
          />
          {post ? (
            <Text style={{color: 'black'}}>Update Post</Text>
          ) : (
            <Text style={{color: 'black'}}>Create a Post</Text>
          )}
        </TouchableOpacity>
      </View>
      {uploading ? (
        <ActivityIndicator size="large" color={colors.aquaBlue} />
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <TouchableOpacity onPress={pickImage} style={{width: '96%'}}>
              {post && image === null && post.postImg !== null ? (
                <Image source={{uri: post.postImg}} style={styles.img}></Image>
              ) : image !== null ? (
                <Image
                  source={{uri: image.assets[0].uri}}
                  style={styles.img}></Image>
              ) : (
                <View style={styles.img}>
                  <Text style={{color: 'gray'}}>Upload Image here</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  titleErr && {borderColor: colors.errorRed, borderWidth: 1},
                ]}
                placeholder={`Enter title`}
                placeholderTextColor="gray"
                maxLength={200}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                }}
              />
              <TextInput
                style={[styles.input, {height: 180}]}
                maxLength={5000}
                placeholder="Enter Post"
                placeholderTextColor="gray"
                multiline={true}
                numberOfLines={40}
                value={description}
                onChangeText={setDescription}
              />
              {role === 'Organization' && (
                <TouchableOpacity
                  style={[styles.input]}
                  onPress={() => setShowMenu(!showMenu)}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginRight: 20,
                    }}>
                    <TextInput
                      placeholder={`Want to link Event`}
                      placeholderTextColor="gray"
                      value={linkId}
                      maxLength={50}
                      editable={false}
                      style={{color: 'black'}}
                    />
                    <Image
                      source={
                        showMenu
                          ? require('../assets/up.png')
                          : require('../assets/down.png')
                      }
                      style={{width: 13, height: 13, alignItems: 'flex-start'}}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {showMenu ? (
                <View style={styles.menu}>
                  <TouchableOpacity
                    style={styles.opt}
                    onPress={() => {
                      setisLink(false);
                      setLinkId('');
                      setShowMenu(false);
                    }}>
                    <View style={{flexDirection: 'column', gap: 5}}>
                      <Text style={{color: 'black', width: '100%'}}>
                        {'Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {events.map(event => (
                    <TouchableOpacity
                      style={styles.opt}
                      onPress={() => {
                        setisLink(true);
                        setLinkId(event.id);
                        setShowMenu(false);
                      }}>
                      <Image
                        source={{uri: event.uri}}
                        style={{
                          width: 60,
                          height: 40,
                        }}
                      />
                      <View style={{flexDirection: 'column', gap: 5}}>
                        <Text style={{color: 'black', width: '80%'}}>
                          {event.Title}
                        </Text>
                        <Text style={{color: 'black', width: '85%'}}>
                          {event.Date}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View></View>
              )}
            </View>
            <View style={[styles.btn, {}]}>
              {post ? (
                <TouchableOpacity onPress={updatePost}>
                  <Text style={styles.btntext}>Update Post</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={createPost}>
                  <Text style={styles.btntext}>Create Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
export default CreatePost;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  element: {
    marginTop: -10,
    flexDirection: 'column',
    gap: 7,
  },
  input: {
    color: 'black',
    borderWidth: 0.2,
    width: '98%',
    paddingLeft: 20,
    borderColor: 'gray',
    borderRadius: 3,
    height: 50,
    paddingRight: 10,
  },
  btn: {
    width: '60%',
    height: 36,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    marginTop: 20,
  },
  btntext: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  img: {
    borderWidth: 0.6,
    borderColor: 'lightgray',
    width: '100%',
    height: 180,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    borderStyle: 'dashed',
    objectFit: 'cover',
  },
  menu: {
    width: '96%',
    borderWidth: 0.3,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: -10,
    borderRadius: 3,
  },
  opt: {
    paddingVertical: 15,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 0.3,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 5,
    width: '100%',
  },
});
