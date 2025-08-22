import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {LoadingAnimation} from '../../../../components';

const LoadingState: React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <LoadingAnimation size="large" color={Colors.limeGreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingState;
