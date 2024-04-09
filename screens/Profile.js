import React, {useEffect, useState, useCallback} from 'react';
import {
  Image,
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
        .collection('Events')
        .where('Useremail', '==', routeEmail)
        .get();

      setEvents(eventsSnapshot.docs.length);
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
      setFollowers(followers + 1);
      setHasFolllowed(true);
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
        setFollowers(followers - 1);
        setHasFolllowed(false);
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        setCurrentUser(user);
        setUserData(null);
        setProfileImg(null);
        setFollowers(0);
        setParticipations(0);
        setFollowing(0);
        setHasFolllowed(false);
        fetchUserData();
        checkFollow(user);
        fetchParticipations();
      });
      return unsubscribe;
    }, [routeEmail]),
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0077be" barStyle="dark-content" />
      <View style={{backgroundColor : '#0077be', marginBottom : 40}}>
        <Text style={{color: 'white', fontSize: 18, marginTop : 10 , textAlign : 'center' , marginBottom : 10}}>
          Profile
        </Text>
      </View>
      {uploading ? (
        <Loader />
      ) : (
        <ScrollView>
          <View style={styles.content}>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                height: 300,
                backgroundColor: '#f0f0f0',
                marginTop: 100,
                marginLeft: 18,
                borderRadius: 20,
              }}>
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
                <Image
                  source={{uri: profileImg && profileImg}}
                  style={{
                    width: 170,
                    height: 170,
                    marginTop: -100,
                    borderRadius: 100,
                    borderWidth: 15,
                    borderColor: 'white',
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 25}}>
                  {userData && userData.Username}
                </Text>
                <Text style={{color: 'gray', fontSize: 16}}>
                  {userData && userData.Location}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 30,
                  justifyContent: 'space-between',
                  gap: 25,
                  marginLeft: 30,
                }}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Text
                    style={{color: '#0077be', fontSize: 25, fontWeight: 'bold'}}>
                    {followers}
                  </Text>
                  <Text style={{color: 'black', fontSize: 17}}>
                    {'Followers'}
                  </Text>
                </View>
                {userData && userData.Role.trim() === 'Individual' ? (
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: '#0077be',
                        fontSize: 25,
                        fontWeight: 'bold',
                      }}>
                      {participations}
                    </Text>
                    <Text style={{color: 'black', fontSize: 17}}>
                      {'Participations'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('OrgEvents', {email: routeEmail})
                    }>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={{
                          color: '#0077be',
                          fontSize: 25,
                          fontWeight: 'bold',
                        }}>
                        {events}
                      </Text>
                      <Text style={{color: 'black', fontSize: 17}}>
                        {'Campaigns'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Text
                    style={{color: '#0077be', fontSize: 25, fontWeight: 'bold'}}>
                    {following}
                  </Text>
                  <Text style={{color: 'black', fontSize: 17}}>
                    {'Following'}
                  </Text>
                </View>
              </View>
              <View style={{marginTop: -20}}>
                {currentUser &&
                userData &&
                currentUser.email === userData.Useremail ? (
                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton]}
                    onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={{fontWeight: '900', fontSize: 15 ,}}>
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                ) : hasFollowed ? (
                  <TouchableOpacity
                    onPress={cancelFollow}
                    style={[styles.button, styles.signUpButton]}>
                    <Text style={{fontWeight: '900', fontSize: 15,}}>
                      Following
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFollow}
                    style={[styles.button, styles.signUpButton]}>
                    <Text style={{fontWeight: '900', fontSize: 15 ,}}>
                      Follow
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '90%',
                height: 175,
                marginTop: 20,
                backgroundColor: '#f0f0f0',
                marginLeft: 18,
                borderRadius: 20,
              }}>
              {currentUser &&
              userData &&
              currentUser.email === userData.Useremail &&
              userData.Role.trim() === 'Organization' ? (
                <View style={{flexDirection: 'row', gap: 20}}>
                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton, {width: 130}]}
                    onPress={() => navigation.navigate('CreateDrive')}>
                    <Text style={{fontWeight: '900', fontSize: 15}}>
                      Create Event
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton, {width: 130}]}
                    onPress={() => {
                      navigation.navigate('Chat', {
                        email: routeEmail,
                        senderEmail: currentUser.email,
                      });
                    }}>
                    <Text style={{fontWeight: '900', fontSize: 15}}>Chat</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                currentUser &&
                userData &&
                currentUser.email !== routeEmail &&
                userData.Role.trim() !== 'Individual' && (
                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton]}
                    onPress={() => {
                      navigation.navigate('Chat', {
                        email: routeEmail,
                        senderEmail: currentUser.email,
                      });
                    }}>
                    <Text style={{fontWeight: '900', fontSize: 15}}>Chat</Text>
                  </TouchableOpacity>
                )
              )}
              {currentUser &&
                userData &&
                currentUser.email === userData.Useremail && (
                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton]}
                    onPress={handleLogout}>
                    <Text style={{fontWeight: '900', fontSize: 15}}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </ScrollView>
      )}
      <BottomNavigation />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  button: {
    width: 170,
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: 'black',
  },
});
