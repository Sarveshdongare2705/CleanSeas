import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Loader from '../components/Loader';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';

const CreatePost = props => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [titleerr, showTitleErr] = useState(false);
  const [descerr, showDescErr] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [inputHeight, setInputHeight] = useState(100);

  const handleContentSizeChange = event => {
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUserData(userData);
      }
    } else {
      setCurrentUser(null);
      setUserData(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        fetchUserData(user);
        setImage(null);
        showTitleErr(false);
        showDescErr(false);
      });

      return unsubscribe;
    }, []),
  );

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    console.log(result);
    setImage(result);
  };

  //upload to firebase
  const createPost = async () => {
    try {
      if (title === '') {
        showTitleErr(true);
      }
      if (description === '') {
        showDescErr(true);
      }
      setUploading(true);
      const timestamp = firestore.Timestamp.now();
      const PostData = {
        Useremail: userData.Useremail,
        title: title,
        desc: description,
        time: timestamp,
      };
      const PostRef = await firestore().collection('Posts').add(PostData);
      console.log('Post posted');

      if (image !== null) {
        const postId = PostRef.id;
        const reference = storage().ref(`Post${postId}`);
        await reference.putFile(image.assets[0].uri);
        console.log('Image uploaded successfullly');
      }
      setUploading(false);
      props.navigation.navigate('Community');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {uploading ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => props.navigation.navigate('Community')}>
            <Text
              style={{
                fontWeight: '100',
                fontSize: 15,
                color: 'lightgray',
                marginLeft: -150,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <View>
            <Text style={{color: 'black'}}>Create a Post</Text>
          </View>
          <ScrollView style={styles.scrollview}>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={`Enter title`}
                placeholderTextColor="gray"
                maxLength={60}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                }}
              />
              <Text style={styles.err}>
                {titleerr && 'Please enter valid title'}
              </Text>
              <TextInput
                style={[styles.input, {height: Math.max(100, inputHeight)}]}
                maxLength={10000}
                placeholder="Enter Post"
                placeholderTextColor="gray"
                multiline={true}
                numberOfLines={100}
                value={description}
                onChangeText={setDescription}
                onContentSizeChange={handleContentSizeChange}
              />
              <Text style={styles.err}>
                {descerr && 'Please enter valid description'}
              </Text>
            </View>
            <View style={{marginTop: 50}}>
              {image ? (
                  <Image
                      source={{uri: image.assets[0].uri}}
                      style={{
                        width: 320,
                        height: 240,
                        borderRadius: 20,
                        padding: 10,
                        objectFit: 'cover',
                      }}
                      />
              ) : (
                <View></View>
              )}
            </View>
          </ScrollView>
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity
              style={[
                styles.button,
                {width: '50%', borderWidth: 0.5, borderColor: '#57DDFB'},
              ]}
              onPress={pickImage}>
              <Text style={{fontWeight: '900', fontSize: 15, color: '#57DDFB'}}>
                Upload Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.signUpButton, {width: '50%'}]}
              onPress={createPost}>
              <Text style={{fontWeight: '900', fontSize: 15}}>Create Post</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: 'center',
  },
  scrollview: {
    flexDirection: 'column',
  },
  form: {
    marginTop: 40,
    flexDirection: 'column',
    gap: 10,
  },
  element: {
    marginTop: -10,
    flexDirection: 'column',
    gap: 7,
  },
  inputelement: {
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: 'black',
    borderWidth: 0.3,
    borderBottomColor: 'gray',
    width: 320,
    paddingLeft: 20,
  },
  button: {
    width: '100%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: '#57DDFB',
  },
  err: {
    marginTop: -7,
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: 'red',
    textAlign: 'right',
    paddingRight: 10,
  },
});
