import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
import { Icons } from '../../../assets/icons';
import { Colors } from '../../../theme/color';
import { responsiveFont, responsiveSpacing, moderateScale } from '../../../utils/responsive';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {fetchCities, fetchDistricts as fetchDistrictsThunk} from '../../../store/slices/locationSlice';

interface City {
  name: string;
  code: number;
}

interface District {
  name: string;
  code: number;
  cityCode: number;
  cityName: string;
}

interface RegionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedDistricts: District[]) => void;
  selectedRegions: District[];
}

const RegionModal: React.FC<RegionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedRegions,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const {cities, districtsByCity, loading} = useSelector((s: RootState) => s.location);
  const [districts, setDistricts] = useState<District[]>([]);
  const [tempSelected, setTempSelected] = useState<District[]>([]);
  const [currentView, setCurrentView] = useState<'cities' | 'districts'>('cities');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [districtsCache, setDistrictsCache] = useState<{[cityCode: number]: District[]}>({});

  // Load cities when modal opens (chỉ gọi nếu cache rỗng)
  useEffect(() => {
    if (visible) {
      if (!cities || cities.length === 0) {
        dispatch(fetchCities());
      }
    }
  }, [visible, cities, dispatch]);

  // Reset modal state when opening
  useEffect(() => {
    if (visible) {
      setTempSelected([...selectedRegions]);
      setCurrentView('cities');
      setSelectedCity(null);
    }
  }, [visible, selectedRegions]);

  const fetchDistricts = async (cityCode: number, cityName: string) => {
    // Ưu tiên cache nội bộ modal, nếu không có thì kiểm tra cache Redux
    if (districtsCache[cityCode] && districtsCache[cityCode].length > 0) {
      setDistricts(districtsCache[cityCode]);
      return;
    }
    const cachedRedux = districtsByCity[cityCode];
    if (cachedRedux && cachedRedux.length > 0) {
      setDistricts(cachedRedux);
      setDistrictsCache(prev => ({...prev, [cityCode]: cachedRedux}));
      return;
    }

    try {
      const result = await dispatch(
        fetchDistrictsThunk({provinceCode: cityCode, provinceName: cityName}),
      ).unwrap();
      setDistricts(result.districts);
      setDistrictsCache(prev => ({...prev, [cityCode]: result.districts}));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    }
  };

  const handleCitySelect = (city: City) => {
    // Only fetch if selecting a different city
    if (selectedCity?.code !== city.code) {
      setSelectedCity(city);
      fetchDistricts(city.code, city.name);
    }
    setCurrentView('districts');
  };

  const handleDistrictToggle = (district: District) => {
    setTempSelected(prev => {
      const exists = prev.find(item => item.code === district.code);
      if (exists) {
        // Remove if already selected
        return prev.filter(item => item.code !== district.code);
      } else {
        // Add if not selected
        return [...prev, district];
      }
    });
  };

  const isDistrictSelected = (district: District) => {
    return tempSelected.some(item => item.code === district.code);
  };

  const goBackToCities = () => {
    setCurrentView('cities');
    setSelectedCity(null);
  };

  const handleConfirm = () => {
    console.log('🔍 Region Filter - Selected districts:', tempSelected.map(d => ({
      name: d.name,
      city: d.cityName,
    })));
    onConfirm(tempSelected);
    onClose();
  };

  const handleReset = () => {
    // Reset về rỗng (xóa tất cả vùng đã chọn)
    onConfirm([]);
    onClose();
  };

  const getTitle = () => {
    return currentView === 'cities' ? 'Khu vực' : selectedCity?.name || 'Khu vực';
  };

  const getSubtitle = () => {
    return currentView === 'cities' ? 'Lọc tìm kiếm theo khu vực' : 'Chọn quận/huyện';
  };

  const getCurrentData = () => {
    return currentView === 'cities' ? cities : districts;
  };

  const handleItemPress = (item: any) => {
    if (currentView === 'cities') {
      handleCitySelect(item as City);
    } else {
      handleDistrictToggle(item as District);
    }
  };



  const isItemSelected = (item: any) => {
    if (currentView === 'cities') {
      return false; // Cities don't show checkbox
    } else {
      return isDistrictSelected(item as District);
    }
  };

  const shouldShowCheckbox = () => {
    return currentView === 'districts'; // Only show checkbox for districts
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
                          {currentView === 'districts' && (
                <TouchableOpacity onPress={goBackToCities} style={styles.backButton}>
                  <Image source={{uri: Icons.IconArrowBack}} style={styles.backImage} />
                </TouchableOpacity>
              )}
            <View style={styles.headerContent}>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.limeGreen} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
                            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {getCurrentData().map((item) => {
                  const isSelected = isItemSelected(item);
                  const showCheckbox = shouldShowCheckbox();
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.listItem}
                      onPress={() => handleItemPress(item)}
                    >
                      <Text style={styles.listItemText}>{item.name}</Text>
                      {showCheckbox && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon={Icons.IconRemoveWhite}
              onPress={handleConfirm}
              onPressIcon={handleReset}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RegionModal;

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
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(20),
    paddingBottom: responsiveSpacing(10),
  },
  backButton: {
    padding: responsiveSpacing(8),
    marginRight: responsiveSpacing(12),
  },
  backText: {
    fontSize: responsiveFont(18),
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(20),
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
    paddingVertical: responsiveSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listItemText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGray,
    flex: 1,
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  checkmark: {
    color: Colors.darkGray,
    fontSize: responsiveFont(14),
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: responsiveFont(16),
    color: Colors.limeGreen,
    fontWeight: 'bold',
  },
  footer: {
    padding: responsiveSpacing(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backImage: {
    width: moderateScale(12),
    height: moderateScale(20),
  },
});
