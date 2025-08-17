import {StyleSheet, ScrollView, View, Text} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../../types/route';
import DatePicker from 'react-native-date-picker';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

// Import utils
import {formatDate, getDateLimits} from './utils/dateUtils';
import {processCoTenants, cleanString} from './utils/stringUtils';
import {CreateContractPayloadWithoutNotification} from '../../../types';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';

import ModalSearchRoom from './components/ModalSearchRoom';
import {responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {
  ContractFormDataNoNotification,
  validateContractFormNoNotification,
} from './utils/validateFromNoNotification';
import {createNewContractThunk} from '../../../store/slices/contractSlice';
import CustomAlertModal from '../../../components/CustomAlertModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {StackNavigationProp} from '@react-navigation/stack';
import ItemHelpText from './components/ItemHelpText';

export default function AddContractNoNotification() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const dispatch = useDispatch<AppDispatch>();

  // State variables
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [maxOccupancy, setMaxOccupancy] = useState<number>(0);
  const [tenantUsername, setTenantUsername] = useState<string>('');
  const [contractTerm, setContractTerm] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [rules, setRules] = useState('Hạn thu tiền quá 5 ngày sẽ bị phạt');
  const [additionalTerms, setAdditionalTerms] = useState(
    'Không được phép sửa chữa phòng. Muốn sửa phòng phải được chủ trọ đồng ý',
  );
  const [coTenants, setCoTenants] = useState<string>('');
  const [modalSearchRoomVisible, setModalSearchRoomVisible] = useState(false);

  // DatePicker states
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());

  // Get date limits
  const {today, maxDate} = getDateLimits(5);
  const clearForm = () => {
    setRoomId('');
    setRoomName('');
    setMaxOccupancy(0);
    setTenantUsername('');
    setContractTerm('');
    setStartDate('');
    setRules('Hạn thu tiền quá 5 ngày sẽ bị phạt');
    setAdditionalTerms(
      'Không được phép sửa chữa phòng. Muốn sửa phòng phải được chủ trọ đồng ý',
    );
    setCoTenants('');
    setStartDateObj(new Date());
    hideAlert();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleStartDateConfirm = (selectedDate: Date) => {
    const formattedDate = formatDate(selectedDate);
    setStartDate(formattedDate);
    setStartDateObj(selectedDate);
    setOpenStartDatePicker(false);
  };

  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
  } = useCustomAlert();

  const handleAddContract = () => {
    const cleanedRules = cleanString(rules);
    const cleanedAdditionalTerms = cleanString(additionalTerms);
    const cleanedCoTenants = cleanString(coTenants);

    // Chuyển contractTerm sang số
    const contractTermNumber = Number(contractTerm);

    const formData: ContractFormDataNoNotification = {
      contractTerm: contractTermNumber,
      startDate,
      rules: cleanedRules,
      additionalTerms: cleanedAdditionalTerms,
      coTenants: cleanedCoTenants,
      maxOccupancy,
    };

    const validation = validateContractFormNoNotification(formData);
    if (!validation.isValid) {
      showError(validation.errors.join('\n'), 'Lỗi xác thực');
      return;
    }

    // Xử lý danh sách người ở cùng
    const tenantsArray = processCoTenants(cleanedCoTenants).map(name =>
      name.trim(),
    );

    // Kiểm tra trùng lặp trong danh sách người ở cùng
    const duplicates = tenantsArray.filter(
      (name, index) => tenantsArray.indexOf(name) !== index,
    );
    if (duplicates.length > 0) {
      showError(
        `Danh sách người cùng thuê có tên bị trùng: ${[
          ...new Set(duplicates),
        ].join(', ')}`,
        'Lỗi',
      );
      return;
    }

    const contractData: CreateContractPayloadWithoutNotification = {
      roomId,
      tenantUsername,
      contractTerm: contractTermNumber,
      startDate,
      rules: cleanedRules,
      additionalTerms: cleanedAdditionalTerms,
      coTenants: tenantsArray,
    };

    dispatch(createNewContractThunk(contractData))
      .unwrap()
      .then(() => {
        showSuccess('Hợp đồng đã được tạo!', 'Thành công');
        clearForm();
        navigation.replace('ContractManagement');
      })
      .catch((error: string) => {
        showError(error || 'Không thể tạo hợp đồng', 'Lỗi');
      });
  };

  const handleSearchRoom = () => {
    setModalSearchRoomVisible(true);
  };

  const handleSelectRoom = (
    roomIds: string,
    roomNumber: string,
    maxOccupancys: number,
  ) => {
    setRoomId(roomIds);
    setRoomName(roomNumber);
    setMaxOccupancy(maxOccupancys);
  };

  const handleClearFormWithConfirm = () => {
    showConfirm(
      'Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?',
      clearForm,
      'Xác nhận',
      [
        {text: 'Hủy', onPress: hideAlert, style: 'cancel'},
        {text: 'Đồng ý', onPress: clearForm, style: 'destructive'},
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <UIHeader
        title="Thêm hợp đồng"
        onPressLeft={handleGoBack}
        iconLeft={Icons.IconArrowLeft}
      />
      <View style={styles.containerContent}>
        <ItemInput
          placeholder="Người đại diện (tên đăng nhập)"
          value={tenantUsername}
          onChangeText={setTenantUsername}
          editable={true}
        />
        {/* Contract Term Input with DatePicker */}
        <ItemInput
          placeholder="Tên phòng (ví dụ: Phòng 101)"
          value={roomName}
          onChangeText={() => {}}
          editable={false} // Không cho phép chỉnh sửa trực tiếp
          onPress={handleSearchRoom} // Mở modal tìm kiếm phòng
        />
        <ItemInput
          placeholder="Thời hạn hợp đồng (tháng)"
          value={contractTerm}
          onChangeText={text => setContractTerm(text)}
          editable={true}
          keyboardType="numeric"
        />
        {/* Start Date Input with DatePicker */}
        <ItemInput
          placeholder="Ngày bắt đầu"
          value={startDate || ''}
          onChangeText={() => {}} // Empty function since it's not editable
          editable={false}
          onPress={() => setOpenStartDatePicker(true)}
        />
        <ItemInput
          placeholder="Điều khoản nội quy"
          value={rules}
          onChangeText={setRules}
          editable={true}
          borderRadius={10}
          height={100} // Increased height for multiline
        />
        <Text style={styles.helperText}>
          Bạn có thể chỉnh sửa nội dung điều khoản nội quy nếu cần.
        </Text>
        <ItemInput
          placeholder="Điều khoản bổ sung"
          value={additionalTerms}
          onChangeText={setAdditionalTerms}
          editable={true}
          borderRadius={10}
          height={responsiveSpacing(100)} // Increased height for multiline
        />

        <Text style={styles.helperText}>
          Bạn có thể thay đổi điều khoản bổ sung theo thỏa thuận riêng.
        </Text>
        <ItemInput
          placeholder="Người cùng thuê (cách nhau bằng dấu phẩy)"
          value={coTenants}
          onChangeText={setCoTenants} // Đơn giản hơn
          editable={true}
        />
        <ItemHelpText text="Nhập username người cùng thuê, cách nhau bằng dấu phẩy. Ví dụ: 'nguoiThue1, nguoiThue2 ..' . Nếu không có, hãy để trống." />
        <View style={styles.conatinerButton}>
          <ItemButtonConfirm
            title="Tạo hợp đồng"
            onPress={handleAddContract}
            onPressIcon={handleClearFormWithConfirm}
            icon={Icons.IconDelete}
          />
        </View>
        {/* Start Date DatePicker */}
        <DatePicker
          modal
          open={openStartDatePicker}
          date={startDateObj}
          title="Chọn ngày bắt đầu hợp đồng"
          mode="date"
          locale="vi"
          minimumDate={today}
          maximumDate={maxDate}
          onConfirm={handleStartDateConfirm}
          onCancel={() => setOpenStartDatePicker(false)}
        />
        <ModalSearchRoom
          visible={modalSearchRoomVisible}
          onSelectRoom={handleSelectRoom}
          onClose={() => setModalSearchRoomVisible(false)}
        />
      </View>
      {alertConfig && (
        <CustomAlertModal
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  containerContent: {
    paddingVertical: responsiveSpacing(20),
  },
  conatinerButton: {
    marginTop: 16,
  },
  helperText: {
    fontSize: responsiveFont(15),
    color: Colors.gray60, // màu xám nhẹ
    marginBottom: responsiveSpacing(10),
    marginLeft: 4,
  },
});
