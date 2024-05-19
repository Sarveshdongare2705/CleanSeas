import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Login, Signup, Welcome} from './screens';
import Home from './screens/Home';
import Explore from './screens/Explore';
import Search from './screens/Search';
import Community from './screens/Community';
import Profile from './screens/Profile';
import auth from '@react-native-firebase/auth';
import Loader from './components/Loader';
import EditProfile from './screens/EditProfile';
import CreatePost from './screens/CreatePost';
import Image from './screens/Image';
import CreateDrive from './screens/CreateDrive';
import DatePicker from 'react-native-date-picker';
import EventDetails from './screens/EventDetails';
import Chat from './screens/Chat';
import OrgEvents from './screens/OrgEvents';
import DateEvents from './screens/DateEvents';
import ApiPage from './screens/ApiPage';

const Stack = createNativeStackNavigator();

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <Loader />;
  }

  const initialRouteName = currentUser ? 'Home ' : 'Welcome';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRouteName}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Explore" component={Explore} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="Image" component={Image} />
        <Stack.Screen name="CreateDrive" component={CreateDrive} />
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="OrgEvents" component={OrgEvents} />
        <Stack.Screen name="DateEvents" component={DateEvents} />
        <Stack.Screen name="ApiPage" component={ApiPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
