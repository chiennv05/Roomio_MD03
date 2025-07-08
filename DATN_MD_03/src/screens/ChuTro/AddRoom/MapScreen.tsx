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
import MapView, {Marker, Callout, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
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
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';

// Custom Marker component - hình tròn màu xanh lá cây
const CustomMarker = () => {
  return (
    <View style={styles.customMarkerContainer}>
      <View style={styles.customMarker} />
      <View style={styles.customMarkerCore} />
    </View>
  );
};

export default function MapScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // State để lưu vị trí marker tạm thời khi user tap trên map
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // State để theo dõi trạng thái loading khi lấy địa chỉ
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // State để lưu danh sách các marker đã chọn
  const [markers, setMarkers] = useState<
    Array<{
      id: string;
      latitude: number;
      longitude: number;
      address?: string;
    }>
  >([]);

  const [mapRegion, setMapRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
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
        console.log('Quyền được cấp:', granted);
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
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(mapRegion, 1000);
    }
  }, [mapRegion]);

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

    // Cập nhật cả tempMarker và selectedLocation
    const newLocation = {
      latitude: lat,
      longitude: lon,
      address: item.display_name,
    };
    setSelectedLocation(newLocation);
    setTempMarker({latitude: lat, longitude: lon});

    // Thêm marker mới vào danh sách
    const newMarker = {
      id: Date.now().toString(),
      latitude: lat,
      longitude: lon,
      address: item.display_name,
    };
    setMarkers(prev => [newMarker]); // Chỉ hiển thị marker mới nhất
  };

  const handleMapPress = async (event: any) => {
    console.log('Đã nhấn bản đồ');
    const {latitude, longitude} = event.nativeEvent.coordinate;

    // Hiển thị marker ngay lập tức trước khi có địa chỉ
    setTempMarker({latitude, longitude});
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
        prev ? {...prev, address} : {latitude, longitude, address},
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

      setSearchText(addressText);
    } finally {
      // Tắt trạng thái loading
      setIsLoadingAddress(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        {/* Hiển thị marker tùy chỉnh */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title="Địa điểm đã chọn"
            description={marker.address}
            tracksViewChanges={false}>
            <CustomMarker />
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Tọa độ</Text>
                <Text style={styles.calloutText}>
                  Vĩ độ: {marker.latitude.toFixed(6)}
                </Text>
                <Text style={styles.calloutText}>
                  Kinh độ: {marker.longitude.toFixed(6)}
                </Text>
                {marker.address && (
                  <Text style={styles.calloutAddress} numberOfLines={2}>
                    {marker.address}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.containerHeader} pointerEvents="box-none">
        <View style={styles.conatinerSearch} pointerEvents="box-none">
          <TextInput
            style={styles.styleInput}
            placeholder="Tìm kiếm ở đây"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.grayLight}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.styleButton}>
            <Image
              source={{uri: Icons.IconSeachBlack}}
              style={styles.styleIcon}
            />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.place_id.toString()}
            style={styles.dropdown}
            renderItem={({item}) => (
              <ItemAddress item={item} onPress={handleSelectSuggestion} />
            )}
          />
        )}
      </View>
      {/* Nút xóa tất cả marker
      {markers.length > 0 && (
        <TouchableOpacity 
          style={styles.clearMarkersButton}
          onPress={() => setMarkers([])}
        >
          <Text style={styles.clearMarkersText}>Xóa tất cả điểm đánh dấu</Text>
        </TouchableOpacity>
      )} */}

      {/* Hiển thị loading khi đang lấy địa chỉ */}
      {isLoadingAddress && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.limeGreen} />
          <Text style={styles.loadingText}>Đang lấy địa chỉ...</Text>
        </View>
      )}

      {/* Hiển thị tọa độ */}
      {selectedLocation && !isLoadingAddress && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesTitle}>Địa điểm đã chọn:</Text>
          {selectedLocation.address && (
            <Text style={styles.addressText}>{selectedLocation.address}</Text>
          )}
          <Text style={styles.coordinatesText}>
            Vĩ độ (Lat): {selectedLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Kinh độ (Lng): {selectedLocation.longitude.toFixed(6)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate({
                name: 'AddRooom',
                params: {location: selectedLocation},
                merge: true, // giữ lại state cũ của AddRoomScreen
              });
            }}
            style={{
              backgroundColor: Colors.limeGreen,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
              Xác nhận vị trí này
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: SCREEN.width,
    height: SCREEN.height,
  },
  containerHeader: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    width: SCREEN.width,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  styleInput: {
    width: SCREEN.width * 0.8,
    height: verticalScale(50),
    paddingHorizontal: 10,
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Regular,
    fontWeight: '400',
    color: Colors.black,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.grayLight,
    backgroundColor: Colors.white,
  },
  styleIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
  conatinerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN.width * 0.9,
  },
  dropdown: {
    marginTop: 10,
    width: SCREEN.width * 0.9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 250,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  styleButton: {
    width: responsiveIcon(44),
    height: responsiveIcon(44),
    borderRadius: responsiveIcon(44) / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  // Custom marker styles
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  customMarkerCore: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF00',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: 5,
  },
  calloutText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.black,
    marginBottom: 2,
  },
  calloutAddress: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.mediumGray,
    marginTop: 5,
    fontStyle: 'italic',
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: responsiveSpacing(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordinatesTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: 5,
  },
  addressText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: 5,
    fontWeight: '500',
  },
  coordinatesText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: 2,
  },
  clearMarkersButton: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  clearMarkersText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.black,
  },

  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 150,
    height: 100,
    marginLeft: -75,
    marginTop: -50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.black,
  },
});
