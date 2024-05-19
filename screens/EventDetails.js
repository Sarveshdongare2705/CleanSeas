import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  Modal,
  TextInput,
  Button,
  Keyboard,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import BottomNavigation from '../components/BottomNavigation';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Loader from '../components/Loader';
import {colors} from '../Colors';

const EventDetails = ({route}) => {
  const {id} = route.params;
  const navigation = useNavigation();
  const [post, setPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [participated, setParticiated] = useState(false);
  const [participatedUsers, setParticipatedUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [formImage, setFormImage] = useState(null);
  const [thoughts, setThoughts] = useState('');
  const [thoughtsData, setThoughtsData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    console.log(result);
    setFormImage(result);
  };

  const handleSubmitThoughts = async () => {
    try {
      if (thoughts !== '') {
        if (formImage !== null) {
          setUploading(true);
          const timestamp = firestore.Timestamp.now();
          const ThoughtsData = {
            Useremail: user.Useremail,
            EventId: id,
            Thought: thoughts,
            Time: timestamp,
          };
          const ThoughtsRef = await firestore()
            .collection('Thoughts')
            .add(ThoughtsData);
          console.log('Thought  posted');
          const filename = ThoughtsRef.id;
          const reference = storage().ref(`Thought${filename}`);
          await reference.putFile(formImage.assets[0].uri);
          console.log('Image uploaded successfullly');
          setThoughts('');
          setFormImage(null);
          fetchThoughts();
          setUploading(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchThoughts = async () => {
    try {
      const thoughtsSnapshot = await firestore()
        .collection('Thoughts')
        .where('EventId', '==', id)
        .get();

      const thoughtsData = [];
      await Promise.all(
        thoughtsSnapshot.docs.map(async doc => {
          const thoughtData = {id: doc.id, ...doc.data()};
          const userSnapshot = await firestore()
            .collection('Users')
            .where('Useremail', '==', thoughtData.Useremail)
            .get();
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            const filename1 = `Thought${thoughtData.id}`;
            const filename2 = `${thoughtData.Useremail}`;
            const url1 = await storage().ref(filename1).getDownloadURL();
            thoughtData.uri1 = url1;
            const url2 = await storage().ref(filename2).getDownloadURL();
            thoughtData.uri2 = url2;
            thoughtData.name = userData.Username;
          }
          thoughtsData.push(thoughtData);
        }),
      );
      setThoughtsData(thoughtsData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleThoughtDelete = async thoughtId => {
    try {
      await firestore().collection('Thoughts').doc(thoughtId).delete();
      setThoughtsData(prevThoughts =>
        prevThoughts.filter(thought => thought.id !== thoughtId),
      );
      console.log('Delete completed');
      fetchThoughts();
    } catch (error) {
      console.error('Error deleting message: ', error);
    }
  };

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchParticipatedUsers = async () => {
    try {
      const participantsSnapshot = await firestore()
        .collection('Participations')
        .where('EventId', '==', id)
        .get();

      const participatedUsers = [];
      for (const doc of participantsSnapshot.docs) {
        const userEmail = doc.data().Useremail;
        const filename = `${userEmail}`;
        const url = await storage().ref(filename).getDownloadURL();
        participatedUsers.push({email: userEmail, uri: url});
      }
      setCount(participatedUsers.length);

      setParticipatedUsers(participatedUsers);
    } catch (error) {
      console.error('Error fetching participated users:', error);
    }
  };

  const fetchPostDetails = async () => {
    try {
      const postRef = await firestore().collection('Events').doc(id);
      const doc = await postRef.get();

      if (doc.exists) {
        const postData = doc.data();
        setPost(postData);
        const filename = `Event${id}`;
        url = await storage().ref(filename).getDownloadURL();
        setImage(url);
        if (postData) {
          try {
            const userSnapshot = await firestore()
              .collection('Users')
              .where('Useremail', '==', postData.Useremail)
              .get();
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              setUserData(userData);
              const filename = `${postData.Useremail}`;
              const url = await storage().ref(filename).getDownloadURL();
              setProfileImg(url);
              setLoading(false);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPostDetails();
    await fetchParticipatedUsers();
    await fetchThoughts();
    setRefreshing(false);
  };

  const fetchUserData = async user => {
    if (user) {
      const userSnapShot = await firestore()
        .collection('Users')
        .where('Useremail', '==', user.email)
        .get();
      if (!userSnapShot.empty) {
        const userData = userSnapShot.docs[0].data();
        setUser(userData);
      }
    } else {
      setCurrentUser(null);
      setUser(null);
    }
  };

  const checkParticipation = async user => {
    const partSnapshot = await firestore()
      .collection('Participations')
      .where('Useremail', '==', user.email)
      .where('EventId', '==', id)
      .get();
    if (!partSnapshot.empty) {
      setParticiated(true);
    } else {
      setParticiated(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        fetchPostDetails();
        setParticiated(false);
        setUploading(false);
        setLoading(false);
        setThoughts('');
        setFormImage(null);
        setCurrentUser(user);
        fetchUserData(user);
        fetchPostDetails();
        fetchParticipatedUsers();
        checkParticipation(user);
        fetchThoughts();
      });
      return unsubscribe;
    }, []),
  );

  const handleParticipate = async () => {
    try {
      await firestore().collection('Participations').add({
        Useremail: user.Useremail,
        EventId: id,
      });
      Alert.alert('Participation successful');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error participating:', error);
    }
  };
  const cancelParticipate = async () => {
    try {
      const partSnapshot = await firestore()
        .collection('Participations')
        .where('Useremail', '==', user.Useremail)
        .where('EventId', '==', id)
        .get();

      if (!partSnapshot.empty) {
        const partDoc = partSnapshot.docs[0];
        await partDoc.ref.delete();
        Alert.alert('Participation canceled successfully');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (post) {
    return (
      <View style={styles.container}>
        <View>
          {image && (
            <Image
              source={{uri: image}}
              style={{
                width: '100%',
                height: 200,
              }}
            />
          )}
          <View style={{height: '67%'}}>
            <View style={{paddingTop: 10}}>
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }>
                <View style={styles.box}>
                  <Image
                    source={require('../assets/title.png')}
                    style={{width: 20, height: 20}}
                  />
                  <Text style={styles.title}>{post.Title}</Text>
                </View>
                <View style={[styles.box, {paddingTop: 10}]}>
                  <View
                    style={{
                      flexDirection: 'column',
                      height: 150,
                      alignItems: 'center',
                      width: '48%',
                      gap: 10,
                      justifyContent: 'center',
                    }}>
                    <View style={styles.box}>
                      <Image
                        source={require('../assets/location.png')}
                        style={{width: 20, height: 20}}
                      />
                      <Text style={{fontSize: 15, color: 'black'}}>
                        {post.Location}
                      </Text>
                    </View>
                    <View style={styles.box}>
                      <Image
                        source={require('../assets/location.png')}
                        style={{width: 20, height: 20}}
                      />
                      <Text style={{fontSize: 15, color: 'black'}}>
                        {post.City}
                      </Text>
                    </View>
                    <View style={styles.box}>
                      <Image
                        source={require('../assets/date.png')}
                        style={{width: 20, height: 20}}
                      />
                      <Text style={{fontSize: 15, color: 'black'}}>
                        {post.Date}
                      </Text>
                    </View>
                    <View style={styles.box}>
                      <Image
                        source={require('../assets/time.png')}
                        style={{width: 20, height: 20}}
                      />
                      <Text style={{fontSize: 15, color: 'black'}}>
                        {post.Time}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderWidth: 0.5,
                      borderColor: 'lightgray',
                      width: '48%',
                      height: 150,
                      flexDirection: 'column',
                      margin: 3,
                      borderRadius: 3,
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    {profileImg && (
                      <Image
                        source={{uri: profileImg}}
                        style={{
                          top: 10,
                          width: 60,
                          height: 60,
                          borderRadius: 100,
                        }}
                      />
                    )}
                    <View>
                      <View
                        style={{
                          flexDirection: 'column',
                          gap: 20,
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 16,
                            width: 150,
                            textAlign: 'center',
                          }}>
                          {userData && userData.Username}
                        </Text>
                        <TouchableOpacity
                          style={{
                            padding: 5,
                            width: '100%',
                            backgroundColor: colors.sandyBeige,
                            borderRadius: 3,
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            navigation.navigate('Profile', {
                              email: userData.Useremail,
                            });
                          }}>
                          <Text style={{color: 'black'}}>Check Profile</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    marginTop: 10,
                    flexDirection: 'column',
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      textAlign: 'justify',
                      fontSize: 18,
                      borderBottomWidth: 0.2,
                      borderBottomColor: 'lightgray',
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    Participations
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '98%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <ScrollView horizontal style={{marginRight: 20}}>
                      {participatedUsers.map((user, index) => (
                        <Image
                          key={index}
                          source={{uri: user.uri}}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 100,
                            marginLeft: index > 0 ? -15 : 0,
                            borderWidth: 2,
                            borderColor: 'white',
                          }}
                        />
                      ))}
                    </ScrollView>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={require('../assets/people.png')}
                        style={{width: 30, height: 30}}
                      />
                      <Text
                        style={{
                          color: 'black',
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          textAlign: 'center',
                          color: 'black',
                          fontSize: 24,
                          paddingTop: 2,
                        }}>
                        {count}
                      </Text>
                    </View>
                  </View>
                  <View style={{height: 40, marginTop: 10}}>
                    {user &&
                      userData &&
                      user.Useremail !== userData.Useremail &&
                      user.Role.trim() !== 'Organization' &&
                      post.finished !== true &&
                      (!participated ? (
                        <TouchableOpacity
                          onPress={handleParticipate}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderColor: colors.sandyBeige,
                            backgroundColor: colors.sandyBeige,
                            width: '100%',
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              textAlign: 'center',
                              fontWeight: '700',
                            }}>
                            Participate
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={cancelParticipate}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderColor: colors.sandyBeige,
                            backgroundColor: 'white',
                            width: '100%',
                          }}>
                          <Text
                            style={{
                              color: colors.sandyBeige,
                              textAlign: 'center',
                              fontWeight: '700',
                            }}>
                            Participated
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
                {post.finished === true && (
                  <View
                    style={{
                      backgroundColor: colors.aquaBlue,
                      width: '100%',
                      height: 80,
                      justifyContent: 'center',
                      marginTop: -40,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        margin: 10,
                        textAlign: 'center',
                        fontSize: 26,
                        fontWeight: '500',
                      }}>
                      Event Completed
                    </Text>
                  </View>
                )}
                {post.finished === false ? (
                  <View>
                    <Text
                      style={{
                        color: 'black',
                        margin: 10,
                        textAlign: 'justify',
                        fontSize: 18,
                        borderBottomWidth: 0.2,
                        borderBottomColor: 'lightgray',
                        marginBottom : -10
                      }}>
                      Description
                    </Text>
                    <Text style={{color: 'black', fontSize : 12 , paddingHorizontal : 10 , marginBottom : 100}}>
                      {post.Description}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text
                      style={{
                        color: 'black',
                        textAlign: 'justify',
                        fontSize: 18,
                        borderBottomWidth: 0.2,
                        borderBottomColor: 'lightgray',
                        marginTop: 10,
                        marginBottom: 10,
                        paddingHorizontal: 10,
                      }}>
                      Post Event Cleanup Gallery
                    </Text>
                    <View style={{width: '98%', height: 300 , paddingLeft : 7}}>
                      <ScrollView horizontal>
                        {thoughtsData.map(thought => (
                          <View
                            style={{
                              width: 220,
                              flexDirection: 'column',
                              gap: 5,
                              borderWidth: 0.4,
                              borderColor: 'lightgray',
                              padding: 5,
                              borderRadius: 3,
                              height: 290,
                              marginRight: 10,
                            }}>
                            <Image
                              source={{uri: thought.uri1}}
                              style={{
                                width: '100%',
                                height: 120,
                                borderRadius: 3,
                              }}
                            />
                            <View
                              style={{
                                flexDirection: 'row',
                                padding: 5,
                                alignItems: 'center',
                                gap: 7,
                              }}>
                              <Image
                                source={{uri: thought.uri2}}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 100,
                                }}
                              />
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 14,
                                  width: 145,
                                }}>
                                {thought.name}
                              </Text>
                              {currentUser.email === thought.Useremail && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleThoughtDelete(thought.id)
                                  }>
                                  <Image
                                    source={require('../assets/delete.png')}
                                    style={{
                                      width: 13,
                                      height: 13,
                                    }}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                paddingLeft: 5,
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 12,
                                  height: 90,
                                  overflow : 'scroll'
                                }}>
                                {thought.Thought}
                              </Text>
                            </View>
                            <Text
                              style={{
                                color: 'gray',
                                fontSize: 8,
                                textAlign: 'right',
                                marginRight: 10,
                                marginTop: 5,
                              }}>
                              {thought.Time.toDate().toLocaleString()}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: 70,
                        borderWidth: 0.4,
                        marginBottom: isKeyboardOpen ? 200 : 10,
                        borderColor: 'lightgray',
                        flexDirection: 'row',
                        gap: 5,
                        padding: 7,
                        alignItems: 'center',
                      }}>
                      <Image
                        source={{uri: formImage && formImage.assets[0].uri}}
                        style={{
                          width: '24%',
                          height: 50,
                          borderRadius: 3,
                        }}
                      />
                      <TextInput
                        placeholder={`Enter your thoughts on event 🌟`}
                        style={{width: '60%', color: 'black'}}
                        placeholderTextColor="gray"
                        maxLength={150}
                        value={thoughts}
                        onChangeText={text => {
                          setThoughts(text);
                        }}
                      />
                      <View
                        style={{
                          flexDirection: 'column',
                          gap: 7,
                          marginLeft: -7,
                        }}>
                        <TouchableOpacity onPress={pickImage}>
                          <Image
                            source={require('../assets/image.png')}
                            style={{
                              width: 20,
                              height: 20,
                              marginLeft: 20,
                            }}
                          />
                        </TouchableOpacity>
                        {uploading === false && (
                          <TouchableOpacity onPress={handleSubmitThoughts}>
                            <Image
                              source={require('../assets/send.png')}
                              style={{
                                width: 20,
                                height: 20,
                                marginLeft: 20,
                              }}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
        <View
          style={{position: 'absolute', bottom: '0%', left: '3%', right: '3%'}}>
          <BottomNavigation />
        </View>
      </View>
    );
  }
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  box: {
    width: '100%',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    width: '100%',
    color: 'black',
    fontSize: 18,
  },
  summaryButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'lightgray',
    borderRadius: 5,
    alignItems: 'center',
  },
  summaryButtonText: {
    fontSize: 16,
  },
  summaryFormContainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryFormHeading: {
    fontSize: 20,
    marginBottom: 10,
  },
  summaryInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
  },
});
