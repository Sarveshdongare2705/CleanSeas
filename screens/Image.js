import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const ImageView = ({route}) => {
  const navigation = useNavigation();
  const uri = route.params.uri;
  const path = route.params.path;
  const email = route.params.email;
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{uri: uri}}
        resizeMode="contain"
        style={styles.imageBackground}></ImageBackground>
    </View>
  );
};

export default ImageView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    flex: 1,
  },
});
