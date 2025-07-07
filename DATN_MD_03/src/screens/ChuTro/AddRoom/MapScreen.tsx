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
  ImageStyle,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {getImageUrl} from '../../../configs';
import {
  searchLocation,
  reverseGeocoding,
  calculateDistance,
} from '../../../store/services/mapServices';
import {Suggestion} from '../../../types/Suggestion';
import ItemAddress from './components/ItemAddress';
import Geolocation from '@react-native-community/geolocation';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapScreen'>;

export default function MapScreen({route}: {route: any}) {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  
  const [markers, setMarkers] = useState<Array<{
    id: string;
    latitude: number;
    longitude: number;
    address?: string;
    isRoom?: boolean;
  }>>([]);

  const [mapRegion, setMapRegion] = useState({
    latitude: route.params?.latitude || 21.0285,
    longitude: route.params?.longitude || 105.8542,
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

    // Nếu có tọa độ phòng, hiển thị marker
    if (route.params?.latitude && route.params?.longitude) {
      const roomMarker = {
        id: 'room',
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        address: route.params.address,
        isRoom: true,
      };
      setMarkers([roomMarker]);
      setSelectedLocation({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        address: route.params.address,
      });
      
      // Set initial map region
      setMapRegion({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [route.params?.latitude, route.params?.longitude, route.params?.address]);

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigateToDetail = useCallback(() => {
    if (route.params?.roomDetail?._id) {
      navigation.navigate('DetailRoom', { roomId: route.params.roomDetail._id });
    }
  }, [navigation, route.params?.roomDetail?._id]);

  // Hàm tính toán region để hiển thị cả 2 điểm trên bản đồ
  const getRegionForTwoPoints = (point1: {latitude: number; longitude: number}, point2: {latitude: number; longitude: number}) => {
    const midPoint = {
      latitude: (point1.latitude + point2.latitude) / 2,
      longitude: (point1.longitude + point2.longitude) / 2,
    };

    const deltaLat = Math.abs(point1.latitude - point2.latitude);
    const deltaLong = Math.abs(point1.longitude - point2.longitude);

    // Thêm padding 50%
    const padding = 1.5;
    return {
      latitude: midPoint.latitude,
      longitude: midPoint.longitude,
      latitudeDelta: Math.max(deltaLat * padding, 0.02),
      longitudeDelta: Math.max(deltaLong * padding, 0.02),
    };
  };

  // Hàm tính khoảng cách
  const calculateRouteDistance = async (origin: {latitude: number; longitude: number}, destination: {latitude: number; longitude: number}) => {
    try {
      setIsCalculatingDistance(true);
      const distanceResult = await calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistance(distanceResult);
    } catch (error) {
      console.error('Lỗi khi tính khoảng cách:', error);
      setDistance('Không thể tính khoảng cách');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Cập nhật useEffect cho việc lấy vị trí hiện tại
  useEffect(() => {
    if (route.params?.roomDetail?.location?.coordinates?.coordinates) {
      const [roomLong, roomLat] = route.params.roomDetail.location.coordinates.coordinates;
      const roomLocation = {latitude: roomLat, longitude: roomLong};
      
      // Lấy vị trí hiện tại và tính khoảng cách
      Geolocation.getCurrentPosition(
        async (position) => {
          const {latitude, longitude} = position.coords;
          const currentLocation = {latitude, longitude};
          
          await calculateRouteDistance(currentLocation, roomLocation);
        },
        (error) => {
          console.error('Lỗi lấy vị trí:', error);
          setDistance('Không thể xác định vị trí');
        }
      );
    }
  }, [route.params?.roomDetail]);

  // Cập nhật hàm handleGetCurrentLocation
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
        
        let region;
        // Nếu có vị trí phòng, tính toán region để hiển thị cả 2 điểm
        if (route.params?.roomDetail?.location?.coordinates?.coordinates) {
          const [roomLong, roomLat] = route.params.roomDetail.location.coordinates.coordinates;
          region = getRegionForTwoPoints(
            {latitude, longitude},
            {latitude: roomLat, longitude: roomLong}
          );
          
          // Tính lại khoảng cách khi lấy vị trí hiện tại
          await calculateRouteDistance(
            {latitude, longitude},
            {latitude: roomLat, longitude: roomLong}
          );
        } else {
          region = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
        }

        setMapRegion(region);
        setSelectedLocation({latitude, longitude});
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }

        try {
          const address = await reverseGeocoding(latitude, longitude);
          
          // Cập nhật selectedLocation với địa chỉ mới
          setSelectedLocation(prev => 
            prev ? {...prev, address} : {latitude, longitude, address}
          );
          
          // Tạo marker cho vị trí hiện tại
          const currentLocationMarker = {
            id: 'currentLocation',
            latitude,
            longitude,
            address,
            isRoom: false,
          };

          // Giữ lại marker phòng nếu có
          const roomMarker = markers.find(m => m.isRoom);
          if (roomMarker) {
            setMarkers([roomMarker, currentLocationMarker]);
          } else {
            setMarkers([currentLocationMarker]);
          }
        } catch (error) {
          console.error('Lỗi khi lấy địa chỉ:', error);
          const addressText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Cập nhật selectedLocation với tọa độ
          setSelectedLocation(prev => 
            prev ? {...prev, address: addressText} : {latitude, longitude, address: addressText}
          );
          
          // Tạo marker cho vị trí hiện tại
          const currentLocationMarker = {
            id: 'currentLocation',
            latitude,
            longitude,
            address: addressText,
            isRoom: false,
          };

          // Giữ lại marker phòng nếu có
          const roomMarker = markers.find(m => m.isRoom);
          if (roomMarker) {
            setMarkers([roomMarker, currentLocationMarker]);
          } else {
            setMarkers([currentLocationMarker]);
          }
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
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {route.params?.latitude && route.params?.longitude && (
          <Marker
            coordinate={{
              latitude: route.params.latitude,
              longitude: route.params.longitude
            }}
            tracksViewChanges={false}
          >
            <Image
              source={{uri: Icons.IconMaker}}
              style={styles.markerIcon}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>

      {/* Distance Badge */}
      {distance && !isCalculatingDistance && (
        <View style={styles.distanceBadge}>
          <Image source={{uri: Icons.IconLocation}} style={styles.distanceBadgeIcon} />
          <Text style={styles.distanceBadgeText}>Cách bạn {distance}</Text>
        </View>
      )}

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

      {/* Room Info Card */}
      {selectedLocation && route.params?.roomDetail && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.roomCard}
            onPress={handleNavigateToDetail}
            activeOpacity={0.8}
          >
            {route.params.roomDetail.photos && route.params.roomDetail.photos.length > 0 ? (
              <View style={styles.roomImage}>
                <Image 
                  source={{uri: getImageUrl(route.params.roomDetail.photos[0])}}
                  style={[styles.roomImage, {position: 'absolute'}]}
                  resizeMode="cover"
                  onError={() => console.log('Image load error')}
                  defaultSource={{uri: Icons.IconHome}}
                />
              </View>
            ) : (
              <View style={[styles.roomImage, styles.roomImagePlaceholder]}>
                <Image 
                  source={{uri: Icons.IconHome}}
                  style={styles.placeholderIcon}
                />
              </View>
            )}
            <View style={styles.roomInfo}>
              <Text style={styles.roomName} numberOfLines={2}>
                {route.params.roomDetail.description || 'Phòng trọ'}
              </Text>
              <Text style={styles.roomPrice}>
                Từ {(route.params.roomDetail.rentPrice || 0).toLocaleString('vi-VN')}đ/tháng
              </Text>
              <View style={styles.locationRow}>
                <Image source={{uri: Icons.IconLocation}} style={styles.locationIcon} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {route.params.roomDetail.location?.addressText || 'Đang cập nhật địa chỉ'}
                </Text>
              </View>
              <View style={styles.roomStats}>
                <Image source={{uri: Icons.IconHome}} style={styles.statsIcon} />
                <Text style={styles.statsText}>
                  Còn trống: {route.params.roomDetail.maxOccupancy || 0} phòng
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Image source={{uri: Icons.IconHeartDefaut}} style={styles.favoriteIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  roomCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(12),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16),
  },
  roomImage: {
    width: responsiveSpacing(80),
    height: responsiveSpacing(80),
    borderRadius: responsiveSpacing(8),
  },
  roomImagePlaceholder: {
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    tintColor: Colors.darkGray,
  },
  roomInfo: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
  },
  roomName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  roomPrice: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  locationText: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    marginLeft: responsiveSpacing(4),
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
  },
  statsText: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    marginLeft: responsiveSpacing(4),
  },
  favoriteButton: {
    padding: responsiveSpacing(4),
  },
  favoriteIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
  },
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
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  currentLocationMarker: {
    backgroundColor: '#2196F3',
    borderColor: '#fff',
  },
  roomMarker: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
  },
  markerIcon: {
    width: responsiveIcon(32),
    height: responsiveIcon(32),
  } as ImageStyle,
  distanceBadge: {
    position: 'absolute',
    top: responsiveSpacing(120),
    left: responsiveSpacing(16),
    right: responsiveSpacing(16),
    backgroundColor: Colors.limeGreen,
    borderRadius: responsiveSpacing(20),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distanceBadgeIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
  },
  distanceBadgeText: {
    marginLeft: responsiveSpacing(8),
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
});
