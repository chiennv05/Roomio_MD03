import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {Colors} from '../../../theme/color';
import {ItemInput, UIHeader} from '../MyRoom/components';
import {Icons} from '../../../assets/icons';
import {SCREEN} from '../../../utils/responsive';
import ItemTitle from './components/ItemTitle ';
import ItemImage from './components/ItemImage';
import ItemService from './components/ItemService';
import {FlatList} from 'react-native';
import {furnitureOptions} from './utils/furnitureOptions';
import ItemOptions from './components/ItemOptions';
import {amenitiesOptions} from './utils/amenitiesOptions';
import {OptionItem} from '../../../types/Options';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';
export default function AddRoomScreen() {
  const [roomNumber, setRoomNumber] = useState('');
  const [area, setArea] = useState<number | ''>();
  const [addressText, setAddressText] = useState('');
  const [description, setDescription] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState<number | ''>();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [furniture, setFurniture] = useState<string[]>([]);
  const onPressOnpenMap = () => {
    console.log('Mở map ');
  };

  //
  const handleClickItemOptionAmenities = useCallback((item: OptionItem) => {
    setAmenities(prev =>
      prev.includes(item.value)
        ? prev.filter(i => i !== item.value)
        : [...prev, item.value],
    );
  }, []);

  const handleClickItemOptionFurniture = useCallback((item: OptionItem) => {
    setFurniture(prev =>
      prev.includes(item.value)
        ? prev.filter(i => i !== item.value)
        : [...prev, item.value],
    );
  }, []);

  const renderAmenityItem = useCallback(
    ({item}: {item: OptionItem}) => (
      <ItemOptions
        item={item}
        onPress={handleClickItemOptionAmenities}
        selected={amenities.includes(item.value)}
      />
    ),
    [amenities, handleClickItemOptionAmenities],
  );

  const renderFurnitureItem = useCallback(
    ({item}: {item: OptionItem}) => (
      <ItemOptions
        item={item}
        onPress={handleClickItemOptionFurniture}
        selected={furniture.includes(item.value)}
      />
    ),
    [furniture, handleClickItemOptionFurniture],
  );
  console.log(amenities);
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <UIHeader
        title="Tạo bài đăng"
        onPressLeft={() => {}}
        iconLeft={Icons.IconArrowLeft}
      />
      <View style={styles.content}>
        <ItemTitle title="Thông tin bài đăng" />
        <ItemInput
          placeholder="Mô tả"
          value={description}
          onChangeText={setDescription}
          editable={true}
        />

        <View style={styles.containerInputRow}>
          <ItemInput
            placeholder="Số phòng"
            value={roomNumber}
            onChangeText={setRoomNumber}
            editable={true}
            width={SCREEN.width * 0.43}
          />
          <ItemInput
            placeholder="Diện tích"
            value={area?.toString() || ''}
            onChangeText={text => {
              const value = text.replace(/[^0-9]/g, '');
              setArea(value === '' ? '' : parseInt(value, 10));
            }}
            editable={true}
            keyboardType="numeric"
            width={SCREEN.width * 0.43}
          />
        </View>
        <ItemInput
          placeholder="Địa chỉ tiết"
          value={addressText}
          onChangeText={setAddressText}
          iconRight={Icons.IconMap}
          onPressIcon={onPressOnpenMap}
          editable={false}
        />
        <View style={styles.containerInputRow}>
          <ItemInput
            placeholder="Số người"
            value={maxOccupancy?.toString() || ''}
            onChangeText={text => {
              const value = text.replace(/[^0-9]/g, '');
              setMaxOccupancy(value === '' ? '' : parseInt(value, 10));
            }}
            editable={true}
            keyboardType="numeric"
            width={SCREEN.width * 0.43}
          />
        </View>
        <ItemTitle title="Hình ảnh" icon={Icons.IconAdd} />
        <View style={styles.containerImage}>
          <ItemImage />
          <ItemImage />
          <ItemImage />
        </View>
        <ItemTitle title="Phí dịch vụ" />
        <View style={styles.containerImage}>
          <ItemService status={true} />
          <ItemService status={false} />
          <ItemService status={true} />
        </View>
        <ItemTitle title="Tiện nghi" />
        <FlatList
          numColumns={2}
          scrollEnabled={false}
          data={amenitiesOptions}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.value}
          renderItem={renderAmenityItem}
        />
        <ItemTitle title="Nội thất" />
        <FlatList
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          data={furnitureOptions}
          keyExtractor={item => item.value}
          renderItem={renderFurnitureItem}
        />

        <ItemButtonConfirm
          onPress={() => {}}
          title="Tạo bài đăng"
          icon={Icons.IconAdd}
          onPressIcon={() => {}}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flexGrow: 1, // cần thiết để justifyContent hoạt động
    alignItems: 'center',
  },
  content: {
    width: SCREEN.width * 0.9,
    paddingTop: 10,
  },
  containerInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerImage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
