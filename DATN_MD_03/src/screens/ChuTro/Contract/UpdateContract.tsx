import React, {useState} from 'react';
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
  const {contract} = route.params as {contract: Contract};
  const dispatch = useDispatch<AppDispatch>();

  const [rules, setRules] = useState(contract.contractInfo.rules || '');
  const [additionalTerms, setAdditionalTerms] = useState(
    contract.contractInfo.additionalTerms || '',
  );

  // Chỉ chứa dịch vụ có thay đổi
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  // Kiểm tra 1 dịch vụ đang bật hay không
  const isServiceEnabled = (service: CustomService) => {
    const changed = customServices.find(item => item.name === service.name);
    if (changed) {
      return !changed._delete;
    }
    // nếu chưa thay đổi thì kiểm tra trong hợp đồng gốc
    return contract.contractInfo.customServices.some(
      item => item.name === service.name,
    );
  };

  // Khi người dùng bật/tắt dịch vụ
  const toggleService = (service: CustomService) => {
    const exists = customServices.find(item => item.name === service.name);

    if (exists) {
      // Đã có trong mảng tạm → toggle _delete hoặc xóa hẳn nếu là dịch vụ mới
      if (!exists._id) {
        // Dịch vụ mới → xóa khỏi danh sách
        setCustomServices(prev =>
          prev.filter(item => item.name !== service.name),
        );
      } else {
        // Dịch vụ cũ → toggle _delete
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
      const isOld = contract.contractInfo.customServices.find(
        item => item.name === service.name,
      );

      if (isOld) {
        // Dịch vụ cũ → thêm và giữ nguyên (không _delete)
        setCustomServices(prev => [...prev, {...isOld}]);
      } else {
        // Dịch vụ mới từ room → thêm trực tiếp
        setCustomServices(prev => [...prev, service]);
      }
    }
  };

  const handleUpdate = async () => {
    const original = contract.contractInfo.customServices;

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
        description: item.description,
        _delete: true,
      }));

    const updatedList = [...customServices, ...removed];

    const finalList = updatedList.map(service => {
      const base = {
        name: service.name,
        price: service.price,
        priceType: service.priceType,
        description: service.description,
      };

      if (service._id && service._delete) {
        return {
          _id: service._id,
          ...base,
          _delete: true,
        };
      } else if (service._id) {
        return {
          _id: service._id,
          ...base,
        };
      } else {
        return base;
      }
    });

    const payload = {
      rules,
      additionalTerms,
      customServices: finalList,
    };

    console.log('payload:', payload);

    try {
      const resultAction = await dispatch(
        updateContractFrom({contractId: contract._id, data: payload}),
      );

      if (updateContractFrom.fulfilled.match(resultAction)) {
        Alert.alert('Thành công', 'Cập nhật hợp đồng thành công');
        navigation.goBack();
      } else {
        const errorMessage =
          (resultAction.payload as string) || 'Đã xảy ra lỗi';
        Alert.alert('Lỗi', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Lỗi không xác định');
      console.error('Update error:', error);
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
      {contract.roomId.location.customServices.map(service => (
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
      ))}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Cập nhật hợp đồng</Text>
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
});
