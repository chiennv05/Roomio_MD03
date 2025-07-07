import {
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
} from '../../../utils/responsive';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {Icons} from '../../../assets/icons';
import {
  searchLocation,
  reverseGeocoding,
} from '../../../store/services/mapServices';
import {Suggestion} from '../../../types/Suggestion';
import ItemAddress from './components/ItemAddress';
import Geolocation from '@react-native-community/geolocation';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapScreen'>;

// Custom Marker component - sử dụng IconMaker
const CustomMarker = () => {
  return (
    <Image source={{uri: Icons.IconMaker}} style={styles.markerIcon} />
  );
};

export default function MapScreen({route}: {route: any}) {
  // Lấy tọa độ từ params nếu có
  const initialLatitude = route.params?.latitude || 21.0285;
  const initialLongitude = route.params?.longitude || 105.8542;
  const initialAddress = route.params?.address;
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  
  // State để theo dõi trạng thái loading khi lấy địa chỉ
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  
  // State để lưu danh sách các marker đã chọn
  const [markers, setMarkers] = useState<Array<{
    id: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>>([]);

  const [mapRegion, setMapRegion] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Yêu cầu quyền truy cập vị trí',
            message: 'Ứng dụng cần truy cập vị trí để hiển thị bản đồ',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    requestLocationPermission();

    // Nếu có tọa độ được truyền vào, hiển thị marker và địa chỉ
    if (route.params?.latitude && route.params?.longitude) {
      const newMarker = {
        id: Date.now().toString(),
        latitude: initialLatitude,
        longitude: initialLongitude,
        address: initialAddress,
      };
      setMarkers([newMarker]);
      setSelectedLocation({
        latitude: initialLatitude,
        longitude: initialLongitude,
        address: initialAddress,
      });
    }
  }, [initialLatitude, initialLongitude, initialAddress, route.params?.latitude, route.params?.longitude]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText.length > 2) {
        searchLocation(searchText).then(setSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleSelectSuggestion = (item: Suggestion) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    const region = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(region);
    setSuggestions([]);
    setSearchText(item.display_name);
    
    // Cập nhật selectedLocation
    const newLocation = {
      latitude: lat, 
      longitude: lon,
      address: item.display_name
    };
    setSelectedLocation(newLocation);
    
    // Thêm marker mới vào danh sách
    const newMarker = {
      id: Date.now().toString(),
      latitude: lat,
      longitude: lon,
      address: item.display_name,
    };
    setMarkers([newMarker]); // Chỉ hiển thị marker mới nhất

    // Di chuyển map đến vị trí mới
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleMapPress = async (event: any) => {
    const {latitude, longitude} = event.nativeEvent.coordinate;

    // Hiển thị marker ngay lập tức trước khi có địa chỉ
    setSelectedLocation({latitude, longitude});
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    // Bật trạng thái loading
    setIsLoadingAddress(true);

    try {
      // Lấy địa chỉ từ tọa độ
      const address = await reverseGeocoding(latitude, longitude);
      
      // Cập nhật địa chỉ vào selectedLocation
      setSelectedLocation(prev => 
        prev ? {...prev, address} : {latitude, longitude, address}
      );
      
      // Thêm marker mới vào danh sách (chỉ giữ marker mới nhất)
      const newMarker = {
        id: Date.now().toString(),
        latitude,
        longitude,
        address,
      };
      setMarkers([newMarker]);
      
      setSearchText(address);
      setSuggestions([]);
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ:', error);
      
      // Thêm marker mới vào danh sách với địa chỉ là tọa độ
      const addressText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      const newMarker = {
        id: Date.now().toString(),
        latitude,
        longitude,
        address: addressText,
      };
      setMarkers([newMarker]);
      
      setSelectedLocation(prev => 
        prev ? {...prev, address: addressText} : {latitude, longitude, address: addressText}
      );
      setSearchText(addressText);
    } finally {
      // Tắt trạng thái loading
      setIsLoadingAddress(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGetCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập vị trí để sử dụng tính năng này');
      return;
    }

    setIsLoadingCurrentLocation(true);
    
    Geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords;
        
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setMapRegion(region);
        setSelectedLocation({latitude, longitude});
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }

        try {
          setIsLoadingAddress(true);
          const address = await reverseGeocoding(latitude, longitude);
          
          setSelectedLocation({latitude, longitude, address});
          
          const newMarker = {
            id: Date.now().toString(),
            latitude,
            longitude,
            address,
          };
          setMarkers([newMarker]);
          setSearchText(address);
        } catch (error) {
          console.error('Lỗi khi lấy địa chỉ:', error);
          const addressText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setSelectedLocation({latitude, longitude, address: addressText});
          
          const newMarker = {
            id: Date.now().toString(),
            latitude,
            longitude,
            address: addressText,
          };
          setMarkers([newMarker]);
          setSearchText(addressText);
        } finally {
          setIsLoadingAddress(false);
        }
      },
      (error) => {
        console.error('Lỗi lấy vị trí:', error);
        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
    
    setIsLoadingCurrentLocation(false);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // TODO: Trả về dữ liệu location cho màn hình trước
      console.log('Vị trí đã chọn:', selectedLocation);
      Alert.alert(
        'Xác nhận thành công',
        `Địa chỉ: ${selectedLocation.address}\nTọa độ: ${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      Alert.alert('Thông báo', 'Vui lòng chọn một vị trí trên bản đồ');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Image source={{uri: Icons.IconArrowLeft}} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer} pointerEvents="box-none">
        <View style={styles.searchInputContainer} pointerEvents="box-none">
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm địa điểm..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.grayLight}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Image
              source={{uri: Icons.IconSeachBlack}}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        
        {/* Search Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.place_id.toString()}
            style={styles.dropdown}
            renderItem={({item}) => (
              <ItemAddress item={item} onPress={handleSelectSuggestion} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Hiển thị marker tùy chỉnh */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude
            }}
            title="Địa điểm đã chọn"
            description={marker.address}
            tracksViewChanges={false}
          >
            <CustomMarker />
          </Marker>
        ))}
      </MapView>

      {/* My Location Button */}
      <TouchableOpacity 
        style={styles.myLocationButton}
        onPress={handleGetCurrentLocation}
        disabled={isLoadingCurrentLocation}
      >
        <View style={styles.myLocationIconContainer}>
          {isLoadingCurrentLocation ? (
            <ActivityIndicator size="small" color={Colors.darkGreen} />
          ) : (
            <Image source={{uri: Icons.IconMyLocation}} style={styles.myLocationIcon} />
          )}
        </View>
      </TouchableOpacity>

      {/* Address Card & Confirm Button */}
      {selectedLocation && (
        <View style={styles.bottomContainer}>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Image source={{uri: Icons.IconLocation}} style={styles.locationIcon} />
              <Text style={styles.addressTitle}>Địa điểm đã chọn</Text>
            </View>
            
            {isLoadingAddress ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.darkGreen} />
                <Text style={styles.loadingText}>Đang lấy địa chỉ...</Text>
              </View>
            ) : (
              <Text style={styles.addressText}>
                {selectedLocation.address || 'Đang xác định địa chỉ...'}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={isLoadingAddress}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backButton: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: responsiveSpacing(16),
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backIcon: {
    width: responsiveIcon(12),
    height: responsiveIcon(24),
    tintColor: Colors.black,
  },
  searchContainer: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: responsiveSpacing(70),
    right: responsiveSpacing(16),
    zIndex: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: responsiveIcon(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: responsiveIcon(40),
    paddingHorizontal: responsiveSpacing(16),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
  },
  searchButton: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    borderRadius: responsiveIcon(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: Colors.black,
  },
  dropdown: {
    marginTop: responsiveSpacing(4),
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(8),
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    right: responsiveSpacing(16),
    bottom: responsiveSpacing(200), // Di chuyển xuống dưới
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationIconContainer: {
    width: responsiveIcon(48),
    height: responsiveIcon(48),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveIcon(24),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.black,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addressCard: {
    backgroundColor: Colors.white,
    marginBottom: responsiveSpacing(16),
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  locationIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  addressTitle: {
    fontSize: responsiveFont(16),
    fontWeight: 'bold',
    color: Colors.black,
  },
  addressText: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    lineHeight: responsiveFont(20),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: responsiveSpacing(8),
    fontSize: responsiveFont(14),
    color: Colors.textGray,
  },
  confirmButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: responsiveSpacing(16),
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
  },
  // Marker icon styles
  markerIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});
