import React, {useCallback, useMemo, forwardRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveSpacing, responsiveFont} from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import {Icons} from '../../../assets/icons';
import ItemInput from '../../LoginAndRegister/components/ItemInput';

interface BookingScheduleModalProps {
  onPess: (message: string) => void;
}

const BookingScheduleModal = forwardRef<BottomSheet, BookingScheduleModalProps>(
  ({onPess}, ref) => {
    const snapPoints = useMemo(() => ['37%', '45%'], []);
    const [message, setMessage] = React.useState<string>('');
    const handleClose = useCallback(() => {
      (ref as React.RefObject<BottomSheet>)?.current?.close();
    }, [ref]);

    // Tạo backdrop component
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        backdropComponent={renderBackdrop}>
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đặt lịch xem phòng</Text>
            <Text style={styles.subtitle}>Đặt lịch xem phòng với chủ trọ</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ItemInput
              value={message}
              onChangeText={setMessage}
              placeholder={'Gửi lời nhắn cho chủ trọ'}
              isPass={false}
              editable={true}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon={Icons.IconRemoveWhite}
              onPress={() => onPess(message)}
              onPressIcon={handleClose}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

BookingScheduleModal.displayName = 'BookingScheduleModal';

export default BookingScheduleModal;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: responsiveSpacing(20),
    borderTopRightRadius: responsiveSpacing(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: Colors.textGray,
    width: responsiveSpacing(40),
    height: responsiveSpacing(4),
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  title: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
  },
  inputFieldContainer: {
    marginBottom: responsiveSpacing(20),
  },
  inputLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(8),
  },
  textInputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: responsiveSpacing(8),
  },
  textInput: {
    padding: responsiveSpacing(16),
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
