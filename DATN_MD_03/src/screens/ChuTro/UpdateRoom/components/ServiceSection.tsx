import React, {useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import ItemTitle from '../../AddRoom/components/ItemTitle ';
import ItemService from '../../AddRoom/components/ItemService';
import {ItemSeviceOptions} from '../../AddRoom/utils/seviceOptions';
import ModalService from '../../AddRoom/components/ModalService';
import {CustomService, ServicePriceConfig, ServicePrices} from '../../../../types';
import {SCREEN} from '../../../../utils/responsive';

interface ServiceSectionProps {
  serviceOptionList: ItemSeviceOptions[];
  setServiceOptionList: React.Dispatch<React.SetStateAction<ItemSeviceOptions[]>>;
  servicePrices: ServicePrices;
  setServicePrices: React.Dispatch<React.SetStateAction<ServicePrices>>;
  servicePriceConfig: ServicePriceConfig;
  setServicePriceConfig: React.Dispatch<React.SetStateAction<ServicePriceConfig>>;
  customServices: CustomService[];
  setCustomServices: React.Dispatch<React.SetStateAction<CustomService[]>>;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  serviceOptionList,
  setServiceOptionList,
  servicePrices,
  setServicePrices,
  servicePriceConfig,
  setServicePriceConfig,
  customServices,
  setCustomServices,
}) => {
  const [modalVisibleService, setModalVisibleService] = useState(false);
  const [itemServiceEdit, setItemServiceEdit] = useState<ItemSeviceOptions | undefined>();

  const handleClickItem = (item: ItemSeviceOptions) => {
    setItemServiceEdit(item);
    setModalVisibleService(true);
  };

  const handleSaveModal = (item: ItemSeviceOptions) => {
    if (!item) return;
    console.log(item);

    const isTemplateKhac = item.value === 'khac';
    const isNew = isTemplateKhac || item.id === undefined || item.id === 3;

    const itemWithId: ItemSeviceOptions = {
      ...item,
      id: isNew
        ? serviceOptionList.length > 0
          ? Math.max(...serviceOptionList.map(i => i.id ?? 0)) + 1
          : 1
        : item.id!,
    };

    if (itemWithId.category === 'required') {
      if (itemWithId.value === 'electricity') {
        setServicePrices(prev => ({
          ...prev,
          electricity: itemWithId.price ?? 0,
        }));
        setServicePriceConfig(prev => ({
          ...prev,
          electricity: itemWithId.priceType ?? 'perRoom',
        }));
      } else if (itemWithId.value === 'water') {
        setServicePrices(prev => ({...prev, water: itemWithId.price ?? 0}));
        setServicePriceConfig(prev => ({
          ...prev,
          water: itemWithId.priceType ?? 'perRoom',
        }));
      }

      setServiceOptionList(prev =>
        prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
      );
    } else {
      console.log(isNew);
      if (isNew) {
        // ✅ Thêm mới nếu tạo từ template 'khac'
        setServiceOptionList(prev => [...prev, itemWithId]);
      } else {
        // ✅ Cập nhật nếu đã tồn tại
        setServiceOptionList(prev =>
          prev.map(i => (i.id === itemWithId.id ? {...i, ...itemWithId} : i)),
        );
      }

      // Cập nhật custom service
      const customService: CustomService = {
        name: itemWithId.label,
        price: itemWithId.price ?? 0,
        priceType: itemWithId.priceType ?? 'perRoom',
        description: itemWithId.description ?? '',
      };

      setCustomServices(prev => {
        // Tìm dịch vụ hiện có theo tên
        const existingIndex = prev.findIndex(i => i.name === customService.name);
        
        if (existingIndex >= 0) {
          // Nếu đã tồn tại, thay thế
          const updated = [...prev];
          updated[existingIndex] = customService;
          return updated;
        } else {
          // Nếu chưa có, thêm mới
          return [...prev, customService];
        }
      });
    }

    setModalVisibleService(false);
    setItemServiceEdit(undefined);
  };

  const handleCancelModal = () => {
    setModalVisibleService(false);
    setItemServiceEdit(undefined);
  };

  return (
    <>
      <ItemTitle title="Phí dịch vụ" />
      <View style={styles.containerService}>
        <FlatList
          data={serviceOptionList}
          keyExtractor={(_, index) => index.toString()}
          numColumns={3}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ItemService
              status={item.status}
              item={item}
              onPress={handleClickItem}
            />
          )}
        />
      </View>
      <ModalService
        visible={modalVisibleService}
        handleSave={handleSaveModal}
        item={itemServiceEdit}
        handleCancel={handleCancelModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerService: {
    width: SCREEN.width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ServiceSection; 