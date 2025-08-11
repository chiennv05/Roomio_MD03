import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, scale, verticalScale} from '../../../../utils/responsive';
import EmptySearchAnimation from '../../../../components/EmptySearchAnimation';

interface LoadingProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingProps> = ({
  message = 'Đang tải dữ liệu...',
}) => {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.darkGreen} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

interface ErrorViewProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
  retryText = 'Thử lại',
}) => {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyViewProps {
  message?: string;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  message = 'Không có người thuê nào',
}) => {
  return (
    <View style={styles.centerContainer}>
      <EmptySearchAnimation />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    padding: scale(20),
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  errorText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
  },
  emptyText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
});

export default {
  LoadingView,
  ErrorView,
  EmptyView,
};
