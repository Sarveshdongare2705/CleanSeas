import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import BottomNavigation from '../components/BottomNavigation';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const Chat = ({route}) => {
  const email1 = route.params.email;
  const email2 = route.params.senderEmail;
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [profileImg, setProfileImg] = useState(null);
  const [inputHeight, setInputHeight] = useState(100);
  const [refreshing, setRefreshing] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const fetchOrgDetails = async () => {
    try {
      const orgDoc = await firestore()
        .collection('Users')
        .where('Useremail', '==', email1)
        .get();

      if (!orgDoc.empty) {
        setOrgDetails(orgDoc.docs[0].data());
        try {
          const file1 = `${email1}`;
          const url = await storage().ref(file1).getDownloadURL();
          setProfileImg(url);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      console.error('Error fetching organization details: ', error);
    }
  };
  const fetchMessages = async () => {
    try {
      const messagesRef = firestore()
        .collection('messages')
        .where('orgEmail', '==', email1)
        .orderBy('time', 'desc');

      const unsubscribe = messagesRef.onSnapshot(async snapshot => {
        const messagesData = await Promise.all(
          snapshot.docs.map(async doc => {
            const messageData = {id: doc.id, ...doc.data()};
            const userSnapshot = await firestore()
              .collection('Users')
              .where('Useremail', '==', messageData.senderEmail)
              .get();
            const userData = userSnapshot.docs[0].data();
            messageData.senderName = userData.Username;
            const filename = `${messageData.senderEmail}`;
            try {
              const img = await storage().ref(filename).getDownloadURL();
              messageData.uri = img;
            } catch (error) {
              console.error('Error fetching image: ', error);
            }
            return messageData;
          }),
        );

        setMessages(messagesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching messages: ', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        fetchOrgDetails();
        fetchMessages();
        setShowButton(true);
      });

      return unsubscribe;
    }, []),
  );

  const sendMessage = async () => {
    if (inputMessage !== '') {
      try {
        setInputMessage('');
        const newMessageRef = await firestore().collection('messages').add({
          orgEmail: route.params.email,
          senderEmail: currentUser.email,
          message: inputMessage,
          time: firestore.Timestamp.now(),
        });
        const newMessage = {
          orgEmail: route.params.email,
          senderEmail: currentUser.email,
          message: inputMessage,
          time: firestore.FieldValue.serverTimestamp(),
        };
        fetchMessages();
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  const handleDelete = async messageId => {
    try {
      await firestore().collection('messages').doc(messageId).delete();
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== messageId),
      );
      console.log('Delete completed');
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        height: '100%',
      }}>
      <StatusBar backgroundColor="#0077be" barStyle="dark-content" />
      <View style={{height: isKeyboardOpen ? '86%' : '94%'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: 10,
            borderBottomWidth: 0.3,
            borderBottomColor: 'lightgray',
            backgroundColor: '#0077be',
          }}>
          {profileImg !== null && (
            <Image
              source={{uri: profileImg}}
              style={{width: 40, height: 40, borderRadius: 100}}
            />
          )}
          {orgDetails && (
            <View
              style={{
                padding: 10,
                width: '100%',
              }}>
              <Text style={{fontSize: 18, color: 'white'}}>
                {orgDetails.Username}
              </Text>
              <Text style={{fontSize: 10, color: 'white'}}>
                {orgDetails.Role}
              </Text>
            </View>
          )}
        </View>
        <View style={{height: '92%'}}>
          <View style={{color: 'black', padding: 10}}>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() =>
                scrollViewRef.current.scrollToEnd({animated: true})
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <View style={{flexDirection: 'column-reverse'}}>
                {messages.map(msg => (
                  <View
                    key={msg.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 10,
                      marginBottom: 15,
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Profile', {
                          email: msg.senderEmail,
                        })
                      }>
                      {currentUser.email !== msg.senderEmail && (
                        <Image
                          source={{uri: msg.uri}}
                          style={{
                            width: 27,
                            height: 27,
                            borderRadius: 100,
                            marginTop: 0,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                    {currentUser.email !== msg.senderEmail ? (
                      <View
                        style={{
                          flexDirection: 'column',
                          width: '89%',
                          borderWidth: 0.5,
                          padding: 9,
                          borderColor: 'lightgray',
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 30,
                          borderBottomRightRadius: 30,
                          borderBottomLeftRadius: 20,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              flexDirection: 'column',
                              gap: 1,
                              alignItems: 'flex-start',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: email1 === msg.senderEmail ? 215 : 235,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  gap: 5,
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: '#0077be',
                                    fontSize: 15,
                                    flexDirection: 'row',
                                    gap: 20,
                                    fontWeight: '400',
                                  }}>
                                  {currentUser &&
                                  currentUser.email === msg.senderEmail
                                    ? 'You'
                                    : msg.senderName}
                                </Text>
                                {email1 === msg.senderEmail && (
                                  <Image
                                    source={require('../assets/beach.png')}
                                    style={{
                                      width: 17,
                                      height: 17,
                                      borderRadius: 100,
                                    }}
                                  />
                                )}
                              </View>
                              {currentUser.email === msg.senderEmail && (
                                <TouchableOpacity
                                  onPress={() => handleDelete(msg.id)}>
                                  <Image
                                    source={require('../assets/delete.png')}
                                    style={{
                                      width: 17,
                                      height: 17,
                                      borderRadius: 100,
                                    }}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text
                              style={{
                                color: 'gray',
                                fontSize: 8,
                                flexDirection: 'row',
                                gap: 20,
                              }}>
                              {msg.time.toDate().toLocaleString()}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 7,
                          }}>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 14,
                              width: 240,
                              marginTop: 10,
                            }}>
                            {msg.message}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: 'column',
                          width: '89%',
                          borderWidth: 0.5,
                          padding: 9,
                          borderColor: 'lightgray',
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 20,
                          borderBottomRightRadius: 20,
                          borderBottomLeftRadius: 20,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              flexDirection: 'column',
                              gap: 1,
                              alignItems: 'flex-start',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: email1 === msg.senderEmail ? 225 : 245,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  gap: 5,
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    color: '#0077be',
                                    fontSize: 15,
                                    flexDirection: 'row',
                                    gap: 20,
                                    fontWeight: '400',
                                  }}>
                                  {currentUser &&
                                  currentUser.email === msg.senderEmail
                                    ? 'You'
                                    : msg.senderName}
                                </Text>
                                {email1 === msg.senderEmail && (
                                  <Image
                                    source={require('../assets/beach.png')}
                                    style={{
                                      width: 17,
                                      height: 17,
                                      borderRadius: 100,
                                    }}
                                  />
                                )}
                              </View>
                              {currentUser.email === msg.senderEmail && (
                                <TouchableOpacity
                                  onPress={() => handleDelete(msg.id)}>
                                  <Image
                                    source={require('../assets/delete.png')}
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: 100,
                                    }}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text
                              style={{
                                color: 'gray',
                                fontSize: 8,
                                flexDirection: 'row',
                                gap: 20,
                              }}>
                              {msg.time.toDate().toLocaleString()}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 7,
                          }}>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 14,
                              width: '95%',
                              marginTop: 10,
                              marginLeft: 5,
                            }}>
                            {msg.message}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            marginLeft: 10,
            width: '84%',
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
            marginBottom: 10,
          }}>
          <Image
            source={require('../assets/msg.png')}
            style={{width: 18, height: 18}}
          />
          <TextInput
            placeholder={`Enter message`}
            placeholderTextColor="gray"
            style={{
              color: 'black',
              borderRadius: 20,
              width: '90%',
            }}
            onChangeText={text => {
              setInputMessage(text);
            }}
            value={inputMessage}
          />
        </View>
        {showButton && (
          <TouchableOpacity onPress={sendMessage}>
            <Image
              source={require('../assets/send.png')}
              style={{width: 30, height: 30, marginLeft: 10, marginBottom: 10}}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Chat;

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
    width: 238,
    marginRight: -5,
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
