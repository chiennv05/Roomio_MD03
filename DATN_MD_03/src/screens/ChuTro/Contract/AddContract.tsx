import {StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
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
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {createContractFromNotificationThunk} from '../../../store/slices/contractSlice';

export default function AddContract() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {notificationId} = route.params as {notificationId: string};
  console.log(notificationId);
  const dispatch = useDispatch<AppDispatch>();

  // State variables
  const [contractTerm, setContractTerm] = useState<number>(12);
  const [startDate, setStartDate] = useState('');
  const [rules, setRules] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');
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
      Alert.alert('Lỗi xác thực', validation.errors.join('\n'));
      return;
    }

    const tenantsArray = processCoTenants(formData.coTenants);

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
        Alert.alert('Thành công', 'Hợp đồng đã được tạo!');
        navigation.navigate('ContractManagement'); // Đặt đúng tên màn danh sách
      })
      .catch((error: string) => {
        Alert.alert('Lỗi', error || 'Không thể tạo hợp đồng');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <UIHeader
        title="Thêm hợp đồng"
        onPressLeft={handleGoBack}
        iconLeft={Icons.IconArrowLeft}
      />

      {/* Contract Term Input with DatePicker */}
      <ItemInput
        placeholder="Thời hạn hợp đồng (tháng)"
        value={contractTerm.toString()}
        onChangeText={text => setContractTerm(Number(text))}
        editable={true}
        borderRadius={10}
        keyboardType="numeric"
      />

      {/* Start Date Input with DatePicker */}
      <ItemInput
        placeholder="Ngày bắt đầu"
        value={startDate || ''}
        onChangeText={() => {}} // Empty function since it's not editable
        editable={false}
        borderRadius={10}
        onPress={() => setOpenStartDatePicker(true)}
      />

      <ItemInput
        placeholder="Quy định"
        value={rules}
        onChangeText={setRules}
        editable={true}
        borderRadius={10}
        height={80} // Increased height for multiline
      />

      <ItemInput
        placeholder="Điều khoản bổ sung"
        value={additionalTerms}
        onChangeText={setAdditionalTerms}
        editable={true}
        borderRadius={10}
        height={80} // Increased height for multiline
      />

      <ItemInput
        placeholder="Người cùng thuê (cách nhau bằng dấu phẩy)"
        value={coTenants}
        onChangeText={setCoTenants} // Đơn giản hơn
        editable={true}
        borderRadius={10}
        height={60}
      />

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

      <ItemButtonConfirm
        title="Tạo hợp đồng"
        onPress={handleAddContract}
        onPressIcon={() => {}}
        icon={Icons.IconDelete}
      />

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
});
