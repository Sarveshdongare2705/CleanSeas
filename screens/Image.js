import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const ImageView = ({props, route}) => {
  const navigation = useNavigation();
  const uri = route.params.uri;
  const path = route.params.path;
  const email = route.params.email;
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{uri: uri}}
        resizeMode="contain"
        style={styles.imageBackground}>
        {path === 'Profile' ? (
          <TouchableOpacity
            style={{
              margin: 10,
              padding: 5,
              borderWidth: 2,
              borderColor: 'gray',
              borderRadius: 10,
              width: 80,
            }}
            onPress={() => navigation.navigate(path , {email : email})}>
            <Text
              style={{fontWeight: 'bold', color: 'gray', textAlign: 'center'}}>
              Back
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              margin: 10,
              padding: 5,
              borderWidth: 2,
              borderColor: 'gray',
              borderRadius: 10,
              width: 80,
            }}
            onPress={() => navigation.navigate(path)}>
            <Text
              style={{fontWeight: 'bold', color: 'gray', textAlign: 'center'}}>
              Back
            </Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </View>
  );
};

export default ImageView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageBackground: {
    flex: 1,
  },
});
