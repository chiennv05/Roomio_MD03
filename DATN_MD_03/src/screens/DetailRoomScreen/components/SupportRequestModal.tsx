import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont, responsiveIcon } from '../../../utils/responsive';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { supportService } from '../../../store/services/supportService';
import CustomAlertModal from '../../../components/CustomAlertModal';

interface SupportRequestModalProps {
  roomId?: string;
  roomInfo?: {
    name?: string;
    address?: string;
    ownerName?: string;
    roomCode?: string;
  };
}

const SupportRequestModal = forwardRef<BottomSheet, SupportRequestModalProps>(({ roomId, roomInfo }, ref) => {
  // Tạo snap points cho bottom sheet
  const snapPoints = useMemo(() => ['25%', '45%'], []);

  const [selectedOption, setSelectedOption] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState<string | undefined>(undefined);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertButtons, setAlertButtons] = React.useState<Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}> | undefined>(undefined);

  const openAlert = React.useCallback((opts: { title?: string; message: string; type?: 'success' | 'error' | 'warning' | 'info'; buttons?: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }> }) => {
    setAlertTitle(opts.title);
    setAlertMessage(opts.message);
    setAlertType(opts.type ?? 'info');
    setAlertButtons(opts.buttons);
    setAlertVisible(true);
  }, []);

  const closeAlert = React.useCallback(() => setAlertVisible(false), []);

  const supportOptions = useMemo(() => [
    { id: 'not_match_info', title: 'Thông tin không trùng khớp' },
    { id: 'no_contact_owner', title: 'Không liên hệ được chủ nhà' },
    { id: 'room_not_exist', title: 'Phòng không tồn tại' },
    { id: 'wrong_listing', title: 'Bài đăng bị trùng lặp' },
  ], []);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedOption) {
      openAlert({
        title: 'Thông báo',
        message: 'Vui lòng chọn một vấn đề cần hỗ trợ',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: closeAlert, style: 'default' }],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Tìm title từ option đã chọn
      const selectedOptionData = supportOptions.find(option => option.id === selectedOption);
      const title = selectedOptionData?.title || 'Báo cáo phòng';

      // Tạo content với thông tin phòng
      let content = '';

      if (roomInfo || roomId) {
        if (roomInfo?.roomCode) {content += `Số Phòng: ${roomInfo.roomCode}\n`;}
        if (roomInfo?.address) {content += `Địa chỉ: ${roomInfo.address}\n`;}
        if (roomInfo?.ownerName) {content += `Chủ Trọ: ${roomInfo.ownerName}`;}
      }

      // Gọi API tạo support request
      const response = await supportService.createSupportRequest({
        title: title,
        content: content,
        category: 'khac',
        priority: 'trungBinh',
      });

      if ('isError' in response) {
        openAlert({
          title: 'Lỗi',
          message: response.message || 'Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ',
          type: 'error',
          buttons: [{ text: 'Đóng', onPress: closeAlert, style: 'cancel' }],
        });
      } else {
        openAlert({
          title: 'Thành công',
          message: 'Yêu cầu hỗ trợ của bạn đã được gửi thành công',
          type: 'success',
          buttons: [{
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              setSelectedOption('');
              (ref as React.RefObject<BottomSheet>)?.current?.close();
            },
            style: 'default',
          }],
        });
      }
    } catch (error) {
      openAlert({
        title: 'Lỗi',
        message: 'Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ',
        type: 'error',
        buttons: [{ text: 'Đóng', onPress: closeAlert, style: 'cancel' }],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOption, supportOptions, roomInfo, roomId, ref, openAlert, closeAlert]);

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
    <>
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
          <Text style={styles.title}>Yêu cầu hỗ trợ</Text>
          <Text style={styles.subtitle}>
            Chọn vấn đề bạn cần được hỗ trợ
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.itemContainer}
              onPress={() => handleOptionSelect(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemLabel}>{option.title}</Text>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radio,
                  selectedOption === option.id && styles.radioSelected,
                ]}>
                  {selectedOption === option.id && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <ItemButtonConfirm
            title={isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
            icon={Icons.IconRemoveWhite}
            onPress={handleSubmit}
            onPressIcon={handleClose}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
    <CustomAlertModal
      visible={alertVisible}
      title={alertTitle}
      message={alertMessage}
      type={alertType}
      onClose={closeAlert}
      buttons={alertButtons}
    />
    </>
  );
});

SupportRequestModal.displayName = 'SupportRequestModal';

export default SupportRequestModal;

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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemLabel: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
  },
  radioContainer: {
    marginLeft: responsiveSpacing(16),
  },
  radio: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    borderRadius: responsiveIcon(12),
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.limeGreen,
  },
  radioDot: {
    width: responsiveIcon(12),
    height: responsiveIcon(12),
    borderRadius: responsiveIcon(6),
    backgroundColor: Colors.limeGreen,
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
