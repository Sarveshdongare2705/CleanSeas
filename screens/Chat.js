import React, {useState, useEffect, useCallback} from 'react';
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const handleContentSizeChange = event => {
    setInputHeight(event.nativeEvent.contentSize.height);
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
      const messagesSnapshot = await firestore()
        .collection('messages')
        .where('orgEmail', '==', email1)
        .orderBy('time', 'desc')
        .get();

      const messagesData = [];
      await Promise.all(
        messagesSnapshot.docs.map(async doc => {
          const messageData = {id: doc.id, ...doc.data()};
          const userSnapshot = await firestore()
            .collection('Users')
            .where('Useremail', '==', messageData.senderEmail)
            .get();
          const userData = userSnapshot.docs[0].data();
          messageData.senderName = userData.Username;
          const filename = `${messageData.senderEmail}`;
          const img = await storage().ref(filename).getDownloadURL();
          messageData.uri = img;
          messagesData.push(messageData);
        }),
      );

      setMessages(messagesData);
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingTop: 30,
      }}>
      <View style={{height: 500}}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {profileImg !== null && (
            <Image
              source={{uri: profileImg}}
              style={{width: 90, height: 90, borderRadius: 100}}
            />
          )}
          {orgDetails && (
            <View
              style={{
                padding: 10,
                borderBottomWidth: 0.2,
                borderBottomColor: 'lightgray',
                width: '100%',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 20, color: 'black'}}>
                {orgDetails.Username}
              </Text>
              <Text style={{fontSize: 12, color: 'gray'}}>
                {orgDetails.Role}
              </Text>
            </View>
          )}
        </View>
        <View style={{height: 600}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
            <View
              style={{
                marginLeft: 15,
                width: 230,
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
                source={require('../assets/msg.png')}
                style={{width: 17, height: 17}}
              />
              <TextInput
                placeholder={`Enter message`}
                placeholderTextColor="gray"
                style={{
                  color: 'black',
                  borderRadius: 20,
                  width: 180,
                  textAlign: 'flex-start',
                }}
                onChangeText={text => {
                  setInputMessage(text);
                }}
                value={inputMessage}
              />
            </View>
            {showButton && (
              <TouchableOpacity onPress={sendMessage}>
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
                      color: '#57DDFB',
                      borderRadius: 20,
                      fontSize: 13,
                      borderWidth: 0.5,
                      borderColor: '#57DDFB',
                    }}>
                    Send
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={{width: '100%'}}>
            <View style={{color: 'black', padding: 20, height: 450}}>
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }>
                {messages.map(msg =>
                  msg.senderEmail === msg.orgEmail ? (
                    <View
                      key={msg.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 15,
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Profile', {
                            email: msg.senderEmail,
                          })
                        }>
                        <Image
                          source={{uri: msg.uri}}
                          style={{width: 40, height: 40, borderRadius: 100}}
                        />
                      </TouchableOpacity>
                      <View style={{flexDirection: 'column', width: 260}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 3,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#57DDFB',
                                fontSize: 15,
                                flexDirection: 'row',
                                gap: 20,
                                fontWeight: '400',
                              }}>
                              {msg.senderName}
                            </Text>
                            <Image
                              source={require('../assets/verified.png')}
                              style={{width: 16, height: 16, borderRadius: 100}}
                            />
                          </View>
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 7,
                              flexDirection: 'row',
                              gap: 20,
                            }}>
                            {msg.time.toDate().toLocaleString()}
                          </Text>
                        </View>
                        <Text style={{color: 'black', fontSize: 13}}>
                          {msg.message}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 12,
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Profile', {
                            email: msg.senderEmail,
                          })
                        }>
                        <Image
                          source={{uri: msg.uri}}
                          style={{width: 40, height: 40, borderRadius: 100}}
                        />
                      </TouchableOpacity>
                      <View style={{flexDirection: 'column', width: 260}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: '#57DDFB',
                              fontSize: 15,
                              flexDirection: 'row',
                              gap: 20,
                              fontWeight: '400',
                            }}>
                            {msg.senderName}
                          </Text>
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 7,
                              flexDirection: 'row',
                              gap: 20,
                            }}>
                            {msg.time.toDate().toLocaleString()}
                          </Text>
                        </View>
                        <Text style={{color: 'black', fontSize: 13}}>
                          {msg.message}
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
      <BottomNavigation />
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
