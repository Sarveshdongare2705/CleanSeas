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
  Animated,
} from 'react-native';
import React, {useRef, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../Colors';

const Login = props => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailerr, setEmailErr] = useState('');
  const [passworderr, setPasswordErr] = useState('');
  const [err, showErr] = useState(false);
  const [success, showSuccess] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setEmailErr('');
      setPasswordErr('');
      showErr(false);
      showSuccess(false);
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
        showErr(false);
        showSuccess(true);
        setTimeout(() => {
          props.navigation.navigate('Home');
        }, 500);
      } catch (error) {
        console.log('Sign up error:', error);
        showSuccess(false);
        showErr(true);
      }
    }
  };
  return (
    <View style={[styles.container]}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {err && (
        <View
          style={[styles.msg, {backgroundColor: colors.errorRed, margin: 10}]}>
          <Text style={styles.msgtxt}>{'Invalid Credentials'}</Text>
          <TouchableOpacity onPress={() => showErr(false)}>
            <Image
              source={require('../assets/cross.png')}
              style={{width: 22, height: 22}}
            />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View
          style={[
            styles.msg,
            {backgroundColor: colors.successGreen, margin: 10},
          ]}>
          <Text style={styles.msgtxt}>Sign In successful !</Text>
        </View>
      )}
      <View>
        <View>
          <Text
            style={{
              color: colors.aquaBlue,
              fontWeight: '900',
              fontSize: 40,
              marginTop: '15%',
            }}>
            Sign In
          </Text>
          <Text
            style={{
              color: 'gray',
              opacity: 0.5,
              fontSize: 20,
              marginTop: 5,
              marginBottom: 20,
            }}>
            Join Hands for a cleaner ocean.
          </Text>
        </View>
        <View style={styles.form}>
          <View style={styles.element}>
            <Text style={styles.title}>Email</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/email.png')}
                style={{width: '7%', height: '45%', margin: '3%'}}
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
                style={{width: '7%', height: '45%', margin: '3%'}}
              />
              <View style={{flexDirection : 'row' , alignItems : 'center' , justifyContent : 'space-between'}}>
                <TextInput
                  placeholder="Enter your password"
                  onChangeText={text => setPassword(text)}
                  value={password}
                  placeholderTextColor="gray"
                  maxLength={40}
                  secureTextEntry={!showPassword}
                  style={styles.input}></TextInput>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Image
                    source={
                      showPassword
                        ? require('../assets/showpassword.png')
                        : require('../assets/hidepassword.png')
                    }
                    style={{width: 20, height: 20 , marginLeft : 12}}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.err}>{passworderr}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={handleSignIn}>
            <Text style={{fontSize: 15, color: 'black'}}>Sign In</Text>
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
              <Text style={{fontSize: 15, color: colors.aquaBlue}}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              marginTop: -20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'black'}}>Forgot Your Password ?</Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Signup')}>
              <Text style={{fontSize: 15, color: colors.aquaBlue}}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: '100%',
  },
  title: {
    color: colors.sandyBeige,
    fontSize: 15,
    fontWeight: 'bold',
  },
  form: {
    marginTop: 40,
    flexDirection: 'column',
    gap: 20,
  },
  element: {
    marginTop: '-10%',
    flexDirection: 'column',
    gap: 7,
  },
  inputelement: {
    borderWidth: 0.4,
    borderRadius: 3,
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
    borderRadius: 3,
    marginBottom: '5%',
    marginTop: '1%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: colors.sandyBeige,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: colors.errorRed,
    textAlign: 'right',
    paddingRight: 10,
  },
  msg: {
    color: 'white',
    width: '100%',
    height: 40,
    position: 'absolute',
    top: '0%',
    left: '0%',
    right: '0%',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 8,
  },
  msgtxt: {
    color: 'white',
    fontSize: 16,
    paddingLeft: 20,
  },
});
