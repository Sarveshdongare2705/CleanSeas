import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailerr, setEmailErr] = useState('');
  const [passworderr, setPasswordErr] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setEmailErr('');
      setPasswordErr('');
    }, []),
  );
  const handleSignIn = async () => {
    if (email == '') {
      setEmailErr('Email cannot be empty');
    } else {
      setEmailErr('');
    }
    if (password == '') {
      setPasswordErr('Password cannot be empty');
    } else {
      setPasswordErr('');
    }
    if (email !== '' && password !== '') {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        // Signed in
        console.log('User signed in:', userCredential.user);
        props.navigation.navigate('Home');
      } catch (error) {
        console.log('Sign up error:', error);
        let errorMessage = 'Failed to sign In. Please try again.';
        if (error.code === 'auth/invalid-credential') {
          errorMessage =
            'Entered credentials are invalid';
        }
        Alert.alert('Sign Up Failed', errorMessage);
      }
    }
  };
  return (
    <ScrollView>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Welcome')}>
          <Text
            style={{
              fontWeight: '100',
              fontSize: 15,
              color: 'lightgray',
              marginTop: 20,
              marginBottom: -20,
            }}>
            Back
          </Text>
        </TouchableOpacity>
        <View>
          <Text
            style={{
              color: '#57DDFB',
              fontWeight: '900',
              fontSize: 36,
              marginTop: 60,
            }}>
            Sign In
          </Text>
          <Text
            style={{color: 'gray', opacity: 0.5, fontSize: 20, marginTop: 3}}>
            Join Hands for a cleaner ocean.
          </Text>
        </View>
        <View style={styles.form}>
          <View style={styles.element}>
            <Text style={styles.title}>Email</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/email.png')}
                style={{width: 20, height: 20, margin: 10}}
              />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="gray"
                onChangeText={text => setEmail(text)}
                value={email}
                maxLength={40}
                style={styles.input}></TextInput>
            </View>
            <Text style={styles.err}>{emailerr}</Text>
          </View>
          <View style={styles.element}>
            <Text style={styles.title}>Password</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/password.png')}
                style={{width: 20, height: 20, margin: 10}}
              />
              <TextInput
                placeholder="Enter your password"
                onChangeText={text => setPassword(text)}
                value={password}
                placeholderTextColor="gray"
                maxLength={40}
                secureTextEntry={!showPassword}
                style={styles.input}></TextInput>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={
                    showPassword
                      ? require('../assets/showpassword.png')
                      : require('../assets/hidepassword.png')
                  }
                  style={{width: 20, height: 20, margin: 10}}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.err}>{passworderr}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={handleSignIn}>
            <Text style={{fontWeight: '900', fontSize: 15}}>Sign In</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              marginTop: -20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'black'}}>Don't have an Account ? </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Signup')}>
              <Text style={{fontWeight: '900', fontSize: 15, color: '#57DDFB'}}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  title: {
    color: 'black',
    fontSize: 18,
  },
  form: {
    marginTop: 40,
    flexDirection: 'column',
    gap: 20,
  },
  element: {
    flexDirection: 'column',
    gap: 7,
  },
  inputelement: {
    borderWidth: 0.4,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: 'black',
    borderRadius: 15,
    width: 240,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: '#57DDFB',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: 'red',
    textAlign : 'right',
    paddingRight : 10,
  },
});
