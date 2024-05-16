import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {colors} from '../Colors';

const Signup = props => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [emailerr, setEmailErr] = useState('');
  const [nameerr, setNameErr] = useState('');
  const [passworderr, setPasswordErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleErr, setRoleErr] = useState('');
  const [err, showErr] = useState(false);
  const [success, showSuccess] = useState(false);
  const [errmsg, setErrmsg] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setName('');
      setPassword('');
      setEmailErr('');
      setNameErr('');
      setPasswordErr('');
      setSelectedRole('');
      setRoleErr('');
      setErrmsg('');
      showErr(false);
      showSuccess(false);
    }, []),
  );

  const handleSignUp = async () => {
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
    if (name == '') {
      setNameErr('Name cannot be empty');
    } else {
      setNameErr('');
    }
    if (selectedRole == '') {
      setRoleErr('Please enter valid Role');
    } else {
      setRoleErr('');
    }
    if (name !== '' && email !== '' && password !== '' && selectedRole !== '') {
      try {
        const res = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );
        console.log(res);
        if (res) {
          firestore()
            .collection('Users')
            .add({Username: name, Useremail: email, Role: selectedRole})
            .then(() => {
              console.log('User data added');
            });
        }
        showErr(false);
        showSuccess(true);
        setTimeout(() => {
          props.navigation.navigate('Login');
        }, 500);
      } catch (error) {
        console.log('Sign up error:', error);
        let errorMessage = 'Failed to sign up. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage =
            'Email already in use.';
        }
        if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is weak.';
        }
        if (error.code === 'auth/invalid-email') {
          errorMessage = 'Entered email is invalid';
        }
        setErrmsg(errorMessage);
        showSuccess(false);
        showErr(true);
      }
    }
  };
  return (
    <ScrollView>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={[styles.container]}>
      {err && (
          <View
            style={{
              backgroundColor: colors.errorRed,
              color: 'white',
              width: '107%',
              height: '6%',
              position: 'absolute',
              top: '1%',
              left: '2%',
              right : '2%',
              borderRadius: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems : 'center',
              padding : 10,
              paddingTop : 8,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 15,
              }}>
              {errmsg}
            </Text>
            <TouchableOpacity onPress={() => showErr(false)}>
              <Image
                source={require('../assets/cross.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          </View>
        )}
        {success && (
          <View
            style={{
              backgroundColor: colors.successGreen,
              color: 'white',
              width: '107%',
              height: '6%',
              position: 'absolute',
              top: '1%',
              left: '2%',
              borderRadius: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                padding: '2%',
                paddingLeft: 20,
              }}>
              Sign Up successful !
            </Text>
          </View>
        )}
        <View>
          <Text
            style={{
              color: colors.aquaBlue,
              fontWeight: '900',
              fontSize: 40,
              marginTop: '15%',
            }}>
            Sign Up
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
            <Text style={styles.title}>Name</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/user.png')}
                style={{width: '7%', height: '45%', margin: '3%'}}
              />
              <TextInput
                placeholder="Enter your name"
                onChangeText={text => setName(text)}
                value={name}
                placeholderTextColor="gray"
                maxLength={30}
                style={styles.input}></TextInput>
            </View>
            <Text style={styles.err}>{nameerr}</Text>
          </View>
          <View style={styles.element}>
            <Text style={styles.title}>Password</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/password.png')}
                style={{width: '7%', height: '45%', margin: '3%'}}
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
                  style={{width: 20, height: 20, margin: '5%'}}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.err}>{passworderr}</Text>
          </View>
          <View style={styles.element}>
            <Text style={styles.title}>Role</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/role.png')}
                style={{width: '7%', height: '45%', margin: '3%'}}
              />
              <TextInput
                placeholder="Individual or Organization ?"
                onChangeText={text => setSelectedRole(text)}
                value={selectedRole}
                placeholderTextColor="gray"
                maxLength={20}
                style={styles.input}></TextInput>
            </View>
            <Text style={styles.err}>{roleErr}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton, {marginTop: 0}]}
            onPress={handleSignUp}>
            <Text style={{fontSize: 16, color: 'black'}}>Sign Up</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              marginTop: -25,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 60,
            }}>
            <Text style={{color: 'black'}}>Already have an Account? </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Login')}>
              <Text style={{fontSize: 15, color: colors.aquaBlue}}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: '5%',
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
    marginBottom: '5%',
    marginTop: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: colors.sandyBeige,
  },
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: colors.errorRed,
    textAlign: 'right',
    paddingRight: 10,
  },
});
