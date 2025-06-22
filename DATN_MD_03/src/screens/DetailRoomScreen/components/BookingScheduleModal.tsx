import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';

interface BookingScheduleModalProps {}

const BookingScheduleModal = forwardRef<BottomSheet, BookingScheduleModalProps>((props, ref) => {
  // Tạo snap points cho bottom sheet
  const snapPoints = useMemo(() => ['37%', '45%'], []);

  // Tính toán thời gian tối thiểu (thời điểm hiện tại)
  const minimumDate = useMemo(() => {
    return new Date(); // Thời gian hiện tại chính xác
  }, []);

  // Set selectedDate ban đầu từ thời điểm hiện tại + 1 phút
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Thêm 1 phút để đảm bảo > hiện tại
    return now;
  });
  const [open, setOpen] = React.useState<boolean>(false);



  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Force 24-hour format
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Kiểm tra nếu thời gian được chọn không phải trong quá khứ
    const now = new Date();
    if (selectedDate <= now) {
      Alert.alert(
        'Lỗi', 
        `Không thể đặt lịch cho thời gian trong quá khứ.\nThời gian hiện tại: ${formatTime(now)}\nVui lòng chọn thời gian từ ${formatTime(new Date(now.getTime() + 60000))} trở đi.`
      );
      return;
    }

    // Xử lý gửi yêu cầu đặt lịch
    Alert.alert(
      'Đặt lịch thành công',
      `Lịch xem phòng đã được đặt:\n${formatDate(selectedDate)}\nLúc: ${formatTime(selectedDate)}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Đóng modal
            (ref as React.RefObject<BottomSheet>)?.current?.close();
          }
        }
      ]
    );
  }, [selectedDate, ref, formatDate, formatTime]);

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
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt lịch xem phòng</Text>
          <Text style={styles.subtitle}>
            Đặt lịch xem phòng với chủ trọ
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Input Field */}
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputLabel}>Chọn lịch xem phòng</Text>
            <TouchableOpacity
              style={styles.textInputContainer}
              onPress={() => setOpen(true)}
            >
              <TextInput
                style={styles.textInput}
                value={`${formatDate(selectedDate)} - ${formatTime(selectedDate)}`}
                editable={false}
                placeholder="Chọn ngày và giờ"
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <DatePicker
            modal
            open={open}
            date={selectedDate}
            mode="datetime"
            minimumDate={minimumDate}
            locale="vi"
            title="Chọn ngày và giờ"
            confirmText="Xác nhận"
            cancelText="Hủy"
            is24hourSource="locale"
            onConfirm={(date) => {
              setOpen(false);
              setSelectedDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ItemButtonConfirm
            title="Xác nhận"
            icon={Icons.IconRemoveWhite}
            onPress={handleSubmit}
            onPressIcon={handleClose}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

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