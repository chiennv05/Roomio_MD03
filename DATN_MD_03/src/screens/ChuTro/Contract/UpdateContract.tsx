import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Contract, CustomService} from '../../../types';
import {Colors} from '../../../theme/color';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {updateContractFrom} from '../../../store/slices/contractSlice';

export default function UpdateContract() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {contract: initialContract} = route.params as {contract: Contract};
  const dispatch = useDispatch<AppDispatch>();
  
  const [contract, setContract] = useState<Contract>(initialContract);
  const [rules, setRules] = useState(initialContract?.contractInfo?.rules || '');
  const [additionalTerms, setAdditionalTerms] = useState(
    initialContract?.contractInfo?.additionalTerms || '',
  );
  const [isUpdated, setIsUpdated] = useState(false);
  
  // Kiểm tra dữ liệu hợp đồng có đầy đủ không
  useEffect(() => {
    if (!initialContract || !initialContract.contractInfo) {
      Alert.alert('Lỗi', 'Thông tin hợp đồng không đầy đủ', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [initialContract, navigation]);

  // Chỉ chứa dịch vụ có thay đổi
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  // Kiểm tra 1 dịch vụ đang bật hay không
  const isServiceEnabled = (service: CustomService) => {
    if (!service || !service.name) {
      return false;
    }
    
    const changed = customServices.find(item => item.name === service.name);
    if (changed) {
      return !changed._delete;
    }
    
    // nếu chưa thay đổi thì kiểm tra trong hợp đồng gốc
    return contract.contractInfo.customServices && 
      contract.contractInfo.customServices.some(
        item => item && item.name === service.name,
      );
  };

  // Khi người dùng bật/tắt dịch vụ
  const toggleService = (service: CustomService) => {
    console.log('Toggle service:', service);
    const exists = customServices.find(item => item.name === service.name);

    if (exists) {
      // Đã có trong mảng tạm → toggle _delete hoặc xóa hẳn nếu là dịch vụ mới
      if (!exists._id) {
        // Dịch vụ mới → xóa khỏi danh sách
        console.log('Xóa dịch vụ mới khỏi danh sách:', service.name);
        setCustomServices(prev =>
          prev.filter(item => item.name !== service.name),
        );
      } else {
        // Dịch vụ cũ → toggle _delete
        console.log('Toggle _delete cho dịch vụ cũ:', service.name);
        setCustomServices(prev =>
          prev.map(item =>
            item.name === service.name
              ? {...item, _delete: !item._delete}
              : item,
          ),
        );
      }
    } else {
      // Chưa có → thêm mới
      const isOld = contract.contractInfo?.customServices?.find?.(
        item => item?.name === service.name,
      );

      if (isOld && isOld._id) {
        // Dịch vụ cũ từ contract → thêm với _id và không có _delete
        console.log('Thêm dịch vụ cũ từ contract:', service.name);
        setCustomServices(prev => [...prev, {...isOld, _delete: false}]);
      } else {
        // Dịch vụ mới từ room → thêm trực tiếp không có _id và không có _delete
        console.log('Thêm dịch vụ mới từ room:', service.name);
        const newService = {
          name: service.name,
          price: service.price,
          priceType: service.priceType,
          description: service.description || '',
        };
        setCustomServices(prev => [...prev, newService]);
      }
    }
  };

  const handleUpdate = async () => {
    // Kiểm tra nếu contract hoặc contract.contractInfo không tồn tại
    if (!contract || !contract.contractInfo) {
      Alert.alert('Lỗi', 'Thông tin hợp đồng không đầy đủ. Vui lòng quay lại và thử lại.');
      return;
    }

    // Kiểm tra và đảm bảo customServices tồn tại
    const original = contract.contractInfo.customServices || [];

    // Lấy các dịch vụ bị tắt trong danh sách gốc nhưng không còn bật nữa
    const removed = original
      .filter(
        ori =>
          !customServices.find(item => item.name === ori.name) &&
          !isServiceEnabled(ori), // đảm bảo người dùng đã tắt nó
      )
      .map(item => ({
        _id: item._id!,
        name: item.name,
        price: item.price,
        priceType: item.priceType,
        description: item.description || '',
        _delete: true,
      }));

    const updatedList = [...customServices, ...removed];

    const finalList = updatedList.map(service => {
      // Cấu trúc cơ bản của một dịch vụ
      const base = {
        name: service.name,
        price: service.price,
        priceType: service.priceType,
        description: service.description || '',
      };

      if (service._id && service._delete) {
        // Dịch vụ cũ muốn XÓA: cần _id và _delete: true
        return {
          _id: service._id,
          ...base,
          _delete: true,
        };
      } else if (service._id) {
        // Dịch vụ cũ muốn GIỮ LẠI: cần _id, không cần _delete
        return {
          _id: service._id,
          ...base,
        };
      } else {
        // Dịch vụ MỚI: không cần _id, không cần _delete
        return base;
      }
    });

    // In ra log chi tiết để dễ debug
    console.log('Original services:', original);
    console.log('Custom services (đã thay đổi):', customServices);
    console.log('Removed services:', removed);
    console.log('Final list:', finalList);
    
    const payload = {
      rules,
      additionalTerms,
      customServices: finalList,
    };

    console.log('payload gửi đi:', JSON.stringify(payload, null, 2));

          try {
      // Hiển thị loading message nhưng không chặn UI
      console.log('Bắt đầu cập nhật hợp đồng...');
      
      // Gửi request cập nhật
      const resultAction = await dispatch(
        updateContractFrom({contractId: contract._id, data: payload}),
      );

      if (updateContractFrom.fulfilled.match(resultAction)) {
        console.log('Kết quả cập nhật:', resultAction.payload);
        
        // Cập nhật state và vô hiệu hóa nút Cập nhật
        setIsUpdated(true);
        
        // Lưu contract mới nếu có
        if (resultAction.payload) {
          setContract(resultAction.payload);
        }
        
        // Sau khi cập nhật thành công, quay về màn hình trước
        Alert.alert('Thành công', 'Cập nhật hợp đồng thành công', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const errorMessage =
          (resultAction.payload as string) || 'Đã xảy ra lỗi';
        Alert.alert('Lỗi', `Không thể cập nhật hợp đồng: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Lỗi', `Lỗi không xác định: ${error.message || 'Không có thông tin chi tiết'}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: 40}}>
      <Text style={styles.label}>Nội quy</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập nội quy"
        value={rules}
        onChangeText={setRules}
      />

      <Text style={styles.label}>Điều khoản bổ sung</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập điều khoản"
        value={additionalTerms}
        onChangeText={setAdditionalTerms}
      />

      <Text style={styles.label}>Dịch vụ bổ sung</Text>
      {contract && contract.roomId && 
       typeof contract.roomId === 'object' && 
       contract.roomId.location && 
       contract.roomId.location.customServices ? (
        contract.roomId.location.customServices.map(service => (
          <View key={service.name} style={styles.serviceItem}>
            <Switch
              value={isServiceEnabled(service)}
              onValueChange={() => toggleService(service)}
            />
            <View style={{flex: 1}}>
              <Text style={styles.serviceName}>
                {service.name} - {service.price.toLocaleString()}đ (
                {service.priceType})
              </Text>
              {!!service.description && (
                <Text style={styles.serviceDesc}>{service.description}</Text>
              )}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noServicesText}>Không có dịch vụ bổ sung hoặc thông tin phòng không đầy đủ</Text>
      )}

      <TouchableOpacity 
        style={[styles.button, isUpdated ? styles.buttonDisabled : {}]} 
        onPress={handleUpdate}
        disabled={isUpdated}>
        <Text style={styles.buttonText}>
          {isUpdated ? 'Đã cập nhật thành công' : 'Cập nhật hợp đồng'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#555',
  },
  noServicesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.limeGreen || '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
});
