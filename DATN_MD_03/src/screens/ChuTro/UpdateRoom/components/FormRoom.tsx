import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ItemInput} from '../../MyRoom/components';
import {SCREEN} from '../../../../utils/responsive';
import ItemTitle from '../../AddRoom/components/ItemTitle ';
import {Icons} from '../../../../assets/icons';

interface FormRoomProps {
  roomNumber: string;
  setRoomNumber: (value: string) => void;
  area: number | '';
  setArea: (value: number | '') => void;
  addressText: string;
  setAddressText: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  maxOccupancy: number | '';
  setMaxOccupancy: (value: number | '') => void;
  rentPrice: number | '';
  setRentPrice: (value: number | '') => void;
  onPressOpenMap: () => void;
  height?: number;
  borderRadius?: number;
}

const FormRoom: React.FC<FormRoomProps> = ({
  roomNumber,
  setRoomNumber,
  area,
  setArea,
  addressText,
  setAddressText,
  description,
  setDescription,
  maxOccupancy,
  setMaxOccupancy,
  rentPrice,
  setRentPrice,
  onPressOpenMap,
  height,
  borderRadius,
}) => {
  return (
    <>
      <ItemTitle title="Thông tin phòng" />

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
        onPressIcon={onPressOpenMap}
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
        <ItemInput
          placeholder="Giá tiền"
          value={rentPrice?.toString() || ''}
          onChangeText={text => {
            const value = text.replace(/[^0-9]/g, '');
            setRentPrice(value === '' ? '' : parseInt(value, 10));
          }}
          editable={true}
          keyboardType="numeric"
          width={SCREEN.width * 0.43}
        />
      </View>
      <ItemInput
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        editable={true}
        height={height}
        borderRadius={borderRadius}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default FormRoom; 