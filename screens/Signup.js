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
          Alert.alert('Signup Successful', 'You have signed up successfully.');
          setTimeout(() => {
            props.navigation.navigate('Login');
          }, 1000);
        }
      } catch (error) {
        console.log('Sign up error:', error);
        let errorMessage = 'Failed to sign up. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage =
            'The email address is already in use by another account.';
        }
        if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is weak.Create a stronger password';
        }
        if (error.code === 'auth/invalid-email') {
          errorMessage = 'Entered email is invalid';
        }
        Alert.alert('Sign Up Failed', errorMessage);
      }
    }
  };
  return (
    <ScrollView>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={[styles.container]}>
        <View>
          <Text
            style={{
              color: '#57DDFB',
              fontWeight: '900',
              fontSize: 36,
              marginTop: 60,
            }}>
            Sign Up
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
            <Text style={styles.title}>Name</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/user.png')}
                style={{width: 20, height: 20, margin: 10}}
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
          <View style={styles.element}>
            <Text style={styles.title}>Role</Text>
            <View style={styles.inputelement}>
              <Image
                source={require('../assets/role.png')}
                style={{width: 20, height: 20, margin: 12}}
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
            <Text style={{fontWeight: '900', fontSize: 15}}>Sign Up</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              marginTop: -20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'black'}}>Already have an Account ? </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Login')}>
              <Text style={{fontWeight: '900', fontSize: 15, color: '#57DDFB'}}>
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
    marginTop: -20,
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
    textAlign: 'right',
    paddingRight: 10,
  },
});
