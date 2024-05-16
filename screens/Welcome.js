import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { colors } from '../Colors';

const Welcome = props => {
  const [typedText, setTypedText] = useState('');
  const subheading =
    'Welcome aboard to the CleanSeas, your digital companion in our collective journey towards cleaner oceans';

  useEffect(() => {
    const typingEffect = setInterval(() => {
      setTypedText(subheading.substring(0, typedText.length + 1));
    }, 10);

    return () => clearInterval(typingEffect);
  }, [typedText]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <ImageBackground
        source={require('../assets/welcome.jpg')}
        style={styles.imageBackground}
        resizeMode="cover">
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.headingText}>
              <Text style={{color: 'white', fontSize: 70}}>C</Text>leanSeas
            </Text>
            <Text style={styles.subheadingText}>{typedText}</Text>
          </View>
          <View style={[styles.buttons]}>
            <TouchableOpacity
              style={[styles.button, styles.signInButton]}
              onPress={() => props.navigation.navigate('Login')}>
              <Text style={[styles.buttonText, {color: 'white'}]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.signUpButton]}
              onPress={() => props.navigation.navigate('Signup')}>
              <Text style={[styles.buttonText, {color: 'black'}]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headingText: {
    marginTop: 30,
    fontSize: 45,
    fontWeight: '400',
    color: 'white',
    marginBottom: 10,
  },
  subheadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
    width: 310,
    textAlign: 'justify',
    marginLeft: 3,
    marginTop: -10,
  },
  buttons: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButton: {
    backgroundColor: 'black',
  },
  signUpButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default Welcome;
