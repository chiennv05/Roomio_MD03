import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Contract, CustomService} from '../../../types';
import {Colors} from '../../../theme/color';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../store';
import {updateContractFrom} from '../../../store/slices/contractSlice';
import ServiceItem from './components/ServiceItem';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {
  moderateScale,
  responsiveFont,
  responsiveSpacing,
} from '../../../utils/responsive';

export default function UpdateContract() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {contract} = route.params as {contract: Contract};
  const customServiceRoom = contract.roomId.location.customServices || [];
  const dispatch = useDispatch<AppDispatch>();

  const [rules, setRules] = useState(contract?.contractInfo?.rules || '');
  const [additionalTerms, setAdditionalTerms] = useState(
    contract?.contractInfo?.additionalTerms || '',
  );
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (!contract || !contract.contractInfo) {
      Alert.alert('Lỗi', 'Thông tin hợp đồng không đầy đủ', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
  }, [contract, navigation]);

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
    console.log(contract.contractInfo.customServices);

    // nếu chưa thay đổi thì kiểm tra trong hợp đồng gốc
    return (
      contract.contractInfo.customServices &&
      contract.contractInfo.customServices.some(
        item => item && item.name === service.name,
      )
    );
  };

  const toggleService = (service: CustomService) => {
    setCustomServices(prev => {
      const exists = prev.find(item => item.name === service.name);

      if (exists) {
        // Nếu đã có dịch vụ này, thì toggle _delete (nếu là dịch vụ cũ), hoặc xóa khỏi danh sách (nếu là dịch vụ mới)
        if (!exists._id) {
          // Dịch vụ mới chưa lưu trên server, chỉ cần xoá khỏi danh sách
          return prev.filter(item => item.name !== service.name);
        } else {
          // Dịch vụ cũ → toggle _delete
          return prev.map(item =>
            item.name === service.name
              ? {...item, _delete: !item._delete}
              : item,
          );
        }
      } else {
        // Chưa có → kiểm tra xem là dịch vụ cũ hay mới
        const isOld = contract.contractInfo.customServices?.find(
          item => item.name === service.name,
        );

        if (isOld && isOld._id) {
          return [...prev, {...isOld, _delete: true}]; // mặc định toggle về false
        } else {
          // Là dịch vụ mới từ room → thêm
          const newService = {
            name: service.name,
            price: service.price,
            priceType: service.priceType,
            description: service.description || '',
          };
          return [...prev, newService];
        }
      }
    });
  };

  const handleUpdate = async () => {
    // Kiểm tra nếu contract hoặc contract.contractInfo không tồn tại
    if (!contract || !contract.contractInfo) {
      Alert.alert(
        'Lỗi',
        'Thông tin hợp đồng không đầy đủ. Vui lòng quay lại và thử lại.',
      );
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

    console.log('payload gửi đi:', JSON.stringify(payload, null, 2));

    try {
      const resultAction = await dispatch(
        updateContractFrom({contractId: contract._id, data: payload}),
      );

      if (updateContractFrom.fulfilled.match(resultAction)) {
        setIsUpdated(true);
        Alert.alert('Thành công', 'Cập nhật hợp đồng thành công', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        const errorMessage =
          (resultAction.payload as string) || 'Đã xảy ra lỗi';
        Alert.alert('Lỗi', `Không thể cập nhật hợp đồng: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert(
        'Lỗi',
        `Lỗi không xác định: ${error.message || 'Không có thông tin chi tiết'}`,
      );
    }
  };

  const handleCancelUpdate = () => {
    Alert.alert('Hủy cập nhật', 'Bạn có chắc chắn muốn hủy cập nhật?', [
      {
        text: 'Hủy',
        onPress: () => {},
      },
      {
        text: 'Xác nhận',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerScroll}>
      <UIHeader
        title="Cập nhật hợp đồng"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={handleCancelUpdate}
      />
      <Text style={styles.label}>Nội quy</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập nội quy"
        value={rules}
        onChangeText={setRules}
      />

      <Text style={styles.label}>Điều khoản bổ sung</Text>
      <ItemInput
        placeholder="Mô tả"
        value={additionalTerms}
        onChangeText={setAdditionalTerms}
        editable={true}
        height={moderateScale(100)}
        borderRadius={10}
      />

      <Text style={styles.label}>Dịch vụ bổ sung</Text>
      {customServiceRoom.length === 0 ? (
        <Text style={styles.noServicesText}>Không có dịch vụ nào</Text>
      ) : (
        customServiceRoom.map(service => (
          <ServiceItem
            key={service.name}
            service={service}
            enabled={isServiceEnabled(service)}
            onToggle={toggleService}
          />
        ))
      )}

      <TouchableOpacity
        style={[styles.button, isUpdated ? styles.buttonDisabled : {}]}
        onPress={handleUpdate}
        disabled={isUpdated}>
        <Text style={styles.buttonText}>
          {isUpdated ? 'Đã cập nhật thành công' : 'Cập nhật hợp đồng'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button]}
        onPress={handleCancelUpdate}
        disabled={isUpdated}>
        <Text style={styles.buttonText}>Hủy bỏ cập nhật</Text>
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
  containerScroll: {
    paddingBottom: responsiveSpacing(50),
  },
  title: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    marginTop: 20,
    color: Colors.black,
    textAlign: 'center',
  },
  label: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    marginTop: 20,
    color: Colors.black,
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
    backgroundColor: Colors.limeGreen,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.black,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
});
