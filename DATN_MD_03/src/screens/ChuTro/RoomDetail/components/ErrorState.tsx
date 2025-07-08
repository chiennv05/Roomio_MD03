import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({error, onRetry}) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {error || 'Không thể tải thông tin phòng'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(20),
  },
  errorText: {
    fontSize: responsiveFont(16),
    color: Colors.red,
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
  },
  retryButton: {
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(10),
    borderRadius: 10,
  },
  retryText: {
    color: Colors.white,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default ErrorState; 