import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../../utils/responsive';
import {District, Province, Ward} from '../../../../types/Address';
import {
  fetchCitiesOnly,
  fetchDistrictsByProvince,
  fetchWardsByDistrict,
} from '../../../../store/services/locationService';

// ==== INTERFACES ====

export interface SelectedAddressNew {
  province?: Province;
  district?: District;
  ward?: Ward;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: SelectedAddressNew) => void;
  selectedAddress?: SelectedAddressNew;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedAddress,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'province' | 'district' | 'ward'
  >('province');
  const [tempSelected, setTempSelected] = useState<SelectedAddressNew>({});

  // Load provinces when modal opens
  useEffect(() => {
    if (visible) {
      fetchProvinces();
      setTempSelected(selectedAddress || {});
      setCurrentStep('province');
    }
  }, [visible, selectedAddress]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await fetchCitiesOnly();
      console.log('res', res);
      setProvinces(res);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    setLoading(true);
    try {
      const res = await fetchDistrictsByProvince(Number(provinceId));
      setDistricts(res || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (districtId: string) => {
    setLoading(true);
    try {
      console.log('districtId:', districtId);
      const res = await fetchWardsByDistrict(Number(districtId));
      console.log('Wards fetched:', res);
      setWards(res || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
    } finally {
      setLoading(false);
    }
  };

  // === Select handlers ===
  const handleProvinceSelect = (province: Province) => {
    setTempSelected({province});
    setDistricts([]);
    setWards([]);
    fetchDistricts(province.code.toString());
    setCurrentStep('district');
  };

  const handleDistrictSelect = (district: District) => {
    setTempSelected(prev => ({...prev, district}));
    setWards([]);
    fetchWards(district.code.toString());
    setCurrentStep('ward');
  };

  const handleWardSelect = (ward: Ward) => {
    const finalSelection = {...tempSelected, ward};
    setTempSelected(finalSelection);
    onSelect(finalSelection);
    onClose();
  };

  const goBack = () => {
    if (currentStep === 'district') {
      setCurrentStep('province');
      setTempSelected(prev => ({province: prev.province}));
    } else if (currentStep === 'ward') {
      setCurrentStep('district');
      setTempSelected(prev => ({
        province: prev.province,
        district: prev.district,
      }));
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'province':
        return 'Chọn Tỉnh/Thành phố';
      case 'district':
        return 'Chọn Quận/Huyện';
      case 'ward':
        return 'Chọn Phường/Xã';
      default:
        return 'Chọn địa chỉ';
    }
  };

  const getCurrentData = () => {
    switch (currentStep) {
      case 'province':
        return provinces;
      case 'district':
        return districts;
      case 'ward':
        return wards;
      default:
        return [];
    }
  };

  const handleItemSelect = (item: Province | District | Ward) => {
    if (currentStep === 'province') {
      handleProvinceSelect(item as Province);
    } else if (currentStep === 'district') {
      handleDistrictSelect(item as District);
    } else if (currentStep === 'ward') {
      handleWardSelect(item as Ward);
    }
  };

  const renderBreadcrumb = () => {
    const breadcrumbs: string[] = [];
    if (tempSelected.province) breadcrumbs.push(tempSelected.province.name);
    if (tempSelected.district) breadcrumbs.push(tempSelected.district.name);
    if (tempSelected.ward) breadcrumbs.push(tempSelected.ward.name);

    return breadcrumbs.length > 0 ? (
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>{breadcrumbs.join(' > ')}</Text>
      </View>
    ) : null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {currentStep !== 'province' && (
              <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Breadcrumb */}
          {renderBreadcrumb()}

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.limeGreen} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
              <FlatList
                style={styles.list}
                data={getCurrentData()}
                keyExtractor={(item: any, index) =>
                  (item.province_id || item.district_id || item.ward_id || '') +
                  '_' +
                  index
                }
                renderItem={({item}: {item: any}) => {
                  const name = item.name || item.name || item.name;
                  return (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => handleItemSelect(item)}>
                      <Text style={styles.listItemText}>{name}</Text>
                      <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;

// ==== STYLES ====
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    padding: responsiveSpacing(8),
    width: moderateScale(40),
  },
  backText: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  title: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: responsiveSpacing(8),
    width: moderateScale(40),
    alignItems: 'center',
  },
  closeText: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.unselectedText,
  },
  breadcrumb: {
    padding: responsiveSpacing(12),
    backgroundColor: Colors.lightGray,
  },
  breadcrumbText: {
    fontSize: responsiveFont(14),
    color: Colors.unselectedText,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing(40),
  },
  loadingText: {
    marginTop: responsiveSpacing(10),
    fontSize: responsiveFont(14),
    color: Colors.unselectedText,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listItemText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGray,
    flex: 1,
  },
  arrow: {
    fontSize: responsiveFont(16),
    color: Colors.limeGreen,
    fontWeight: 'bold',
  },
});
