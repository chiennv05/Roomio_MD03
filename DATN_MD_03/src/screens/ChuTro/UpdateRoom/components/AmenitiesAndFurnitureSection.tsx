import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import ItemTitle from '../../AddRoom/components/ItemTitle ';
import ItemOptions from '../../AddRoom/components/ItemOptions';
import {amenitiesOptions} from '../../AddRoom/utils/amenitiesOptions';
import {furnitureOptions} from '../../AddRoom/utils/furnitureOptions';
import {OptionItem} from '../../../../types/Options';

interface AmenitiesAndFurnitureSectionProps {
  amenities: string[];
  setAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  furniture: string[];
  setFurniture: React.Dispatch<React.SetStateAction<string[]>>;
}

const AmenitiesAndFurnitureSection: React.FC<AmenitiesAndFurnitureSectionProps> = ({
  amenities,
  setAmenities,
  furniture,
  setFurniture,
}) => {
  const handleClickItemOptionAmenities = useCallback(
    (item: OptionItem) => {
      setAmenities(prev =>
        prev.includes(item.value)
          ? prev.filter(i => i !== item.value)
          : [...prev, item.value],
      );
    },
    [setAmenities],
  );

  const handleClickItemOptionFurniture = useCallback(
    (item: OptionItem) => {
      setFurniture(prev =>
        prev.includes(item.value)
          ? prev.filter(i => i !== item.value)
          : [...prev, item.value],
      );
    },
    [setFurniture],
  );

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

  return (
    <>
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
    </>
  );
};

export default AmenitiesAndFurnitureSection;
