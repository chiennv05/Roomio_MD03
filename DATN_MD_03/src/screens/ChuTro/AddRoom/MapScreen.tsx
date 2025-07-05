import {
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {
  responsiveFont,
  responsiveIcon,
  SCREEN,
  verticalScale,
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

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
    setSelectedLocation({latitude: lat, longitude: lon});
  };

  const handleMapPress = async (event: any) => {
    console.log(event);
    console.log('Đã nhấn bản đồ');
    const {latitude, longitude} = event.nativeEvent.coordinate;

    const address = await reverseGeocoding(latitude, longitude);

    setSelectedLocation({latitude, longitude});
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setSearchText(address);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} // Ref để control map từ code
        style={styles.map}
        initialRegion={mapRegion} // Vùng hiển thị ban đầu
        onPress={handleMapPress} // Event khi user tap trên map
        showsUserLocation={true} // Hiển thị blue dot của user
        showsMyLocationButton={false} // Ẩn nút default, dùng custom button
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Vị trí đã chọn"
            description={searchText}
            pinColor="red"
          />
        )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
