import {StyleSheet, ScrollView, StatusBar, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../../types/route';
import DatePicker from 'react-native-date-picker';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

// Import utils
import {
  formatDate,
  calculateContractTermFromNow,
  getDateLimits,
} from './utils/dateUtils';
import {processCoTenants, cleanString} from './utils/stringUtils';
import {validateContractForm, ContractFormData} from './utils/validationUtils';
import {CreateContractPayload} from '../../../types';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {createContractFromNotificationThunk} from '../../../store/slices/contractSlice';
import CustomAlertModal from '../../../components/CustomAlertModal';
import {useCustomAlert} from '../../../hooks/useCustomAlrert';
import {responsiveSpacing} from '../../../utils/responsive';
import ItemHelpText from './components/ItemHelpText';
import ModalLoading from '../AddRoom/components/ModalLoading';
import {StackNavigationProp} from '@react-navigation/stack';

export default function AddContract() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {notificationId} = route.params as {notificationId: string};
  const dispatch = useDispatch<AppDispatch>();

  const {loading} = useSelector((state: RootState) => state.contract);

  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
    showError,
  } = useCustomAlert();

  // State variables
  const [contractTerm, setContractTerm] = useState<number>(12);
  const [startDate, setStartDate] = useState('');
  const [rules, setRules] = useState('Hạn thu tiền quá 5 ngày sẽ bị phạt');
  const [additionalTerms, setAdditionalTerms] = useState(
    'Không được phép sửa chữa phòng. Muốn sửa phòng phải được chủ trọ đồng ý',
  );
  const [coTenants, setCoTenants] = useState<string>('');

  // DatePicker states
  const [openContractTermPicker, setOpenContractTermPicker] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [contractTermDate, setContractTermDate] = useState(new Date());
  const [startDateObj, setStartDateObj] = useState(new Date());

  // Get date limits
  const {today, maxDate} = getDateLimits(5);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleContractTermConfirm = (selectedDate: Date) => {
    const months = calculateContractTermFromNow(selectedDate);
    setContractTerm(months);
    setContractTermDate(selectedDate);
    setOpenContractTermPicker(false);
  };

  const handleStartDateConfirm = (selectedDate: Date) => {
    const formattedDate = formatDate(selectedDate);
    setStartDate(formattedDate);
    setStartDateObj(selectedDate);
    setOpenStartDatePicker(false);
  };

  const handleAddContract = () => {
    const formData: ContractFormData = {
      contractTerm,
      startDate,
      rules: cleanString(rules),
      additionalTerms: cleanString(additionalTerms),
      coTenants: cleanString(coTenants),
    };

    const validation = validateContractForm(formData);

    if (!validation.isValid) {
      showError(validation.errors.join('\n'), 'Lỗi xác thực', true);
      return;
    }

    // Xử lý danh sách người ở cùng
    const tenantsArray = processCoTenants(formData.coTenants).map(name =>
      name.trim(),
    );
    const mainTenant = coTenants.trim();

    // Kiểm tra trùng tên người đại diện trong danh sách người cùng thuê
    const isMainTenantInCoTenants = tenantsArray.some(
      name => name.toLowerCase() === mainTenant.toLowerCase(),
    );
    if (isMainTenantInCoTenants) {
      showError(
        'Tên người đại diện không được xuất hiện trong danh sách người cùng thuê',
        'Lỗi',
        true,
      );
      return;
    }

    // Kiểm tra trùng lặp trong danh sách người cùng thuê
    const duplicates = tenantsArray.filter(
      (name, index, self) =>
        self.findIndex(n => n.toLowerCase() === name.toLowerCase()) !== index,
    );
    if (duplicates.length > 0) {
      showError(
        `Danh sách người cùng thuê có tên bị trùng: ${[
          ...new Set(duplicates),
        ].join(', ')}`,
        'Lỗi',
        true,
      );
      return;
    }

    // Gửi dữ liệu tạo hợp đồng
    const contractData: CreateContractPayload = {
      notificationId: notificationId || '',
      contractTerm: formData.contractTerm,
      startDate: formData.startDate,
      rules: formData.rules,
      additionalTerms: formData.additionalTerms,
      coTenants: tenantsArray,
    };

    dispatch(createContractFromNotificationThunk(contractData))
      .unwrap()
      .then(() => {
        showSuccess('Hợp đồng đã được tạo!', 'Thành công', true);
        navigation.replace('ContractManagement');
      })
      .catch((error: string) => {
        showError(error || 'Không thể tạo hợp đồng', 'Lỗi', true);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={false}
      />
      <UIHeader
        title="Thêm hợp đồng"
        onPressLeft={handleGoBack}
        iconLeft={Icons.IconArrowLeft}
      />

      <View style={styles.contentContainer}>
        {/* Contract Term Input with DatePicker */}
        <ItemInput
          placeholder="Thời hạn hợp đồng (tháng)"
          value={contractTerm.toString()}
          onChangeText={text => setContractTerm(Number(text))}
          editable={true}
          keyboardType="numeric"
        />
        <ItemHelpText text="Nhập thời hạn hợp đồng bằng số tháng. Ví dụ: '12' cho 1 năm." />
        {/* Start Date Input with DatePicker */}
        <ItemInput
          placeholder="Ngày bắt đầu"
          value={startDate || ''}
          onChangeText={() => {}} // Empty function since it's not editable
          editable={false}
          onPress={() => setOpenStartDatePicker(true)}
        />

        <ItemHelpText text="Chọn ngày bắt đầu hợp đồng. Ngày này sẽ được sử dụng để tính thời hạn hợp đồng." />

        <ItemInput
          placeholder="Người cùng thuê (cách nhau bằng dấu phẩy)"
          value={coTenants}
          onChangeText={setCoTenants} // Đơn giản hơn
          editable={true}
        />
        <ItemHelpText text="Nhập username người cùng thuê, cách nhau bằng dấu phẩy. Ví dụ: 'nguoiThue1, nguoiThue2 ..' . Nếu không có, hãy để trống." />
        <ItemInput
          placeholder="Điều khoản nội quy"
          value={rules}
          onChangeText={setRules}
          editable={true}
          borderRadius={10}
          height={80} // Increased height for multiline
        />

        <ItemHelpText text="Bạn có thể chỉnh sửa nội dung điều khoản nội quy nếu cần." />

        <ItemInput
          placeholder="Điều khoản bổ sung"
          value={additionalTerms}
          onChangeText={setAdditionalTerms}
          editable={true}
          borderRadius={10}
          height={80} // Increased height for multiline
        />

        <ItemHelpText text="Bạn có thể thay đổi điều khoản bổ sung theo thỏa thuận riêng." />
      </View>
      {/* Contract Term DatePicker */}
      <DatePicker
        modal
        open={openContractTermPicker}
        date={contractTermDate}
        title="Chọn ngày kết thúc hợp đồng"
        mode="date"
        locale="vi"
        minimumDate={today}
        maximumDate={maxDate}
        onConfirm={handleContractTermConfirm}
        onCancel={() => setOpenContractTermPicker(false)}
      />
      <View style={styles.buttonContainer}>
        <ItemButtonConfirm
          title="Tạo hợp đồng"
          onPress={handleAddContract}
          onPressIcon={() => {}}
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

      <ModalLoading loading={true} visible={loading} />
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
  buttonContainer: {
    marginTop: responsiveSpacing(60),
    paddingBottom: responsiveSpacing(20),
  },

  contentContainer: {
    paddingBottom: responsiveSpacing(60),
    paddingTop: responsiveSpacing(20),
  },
});
