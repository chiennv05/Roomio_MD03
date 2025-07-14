import {useEffect, useState} from 'react';
import {
  CustomService,
  Room,
  ServicePriceConfig,
  ServicePrices,
} from '../../../../types';
import {ItemSeviceOptions} from '../../AddRoom/utils/seviceOptions';

// THÊM: Import function tạo copy mới
const createFreshServiceOptions = (): ItemSeviceOptions[] => {
  return [
    {
      id: 1,
      label: 'Điện',
      value: 'electricity',
      iconBase: 'IconElectricity',
      category: 'required',
      status: false,
      price: 0,
      priceType: 'perUsage',
    },
    {
      id: 2,
      label: 'Nước',
      value: 'water',
      iconBase: 'IconWater',
      category: 'required',
      status: false,
      price: 0,
      priceType: 'perUsage',
    },
    {
      id: 3,
      label: 'Dịch vụ khác',
      value: 'khac',
      iconBase: 'IconOther',
      category: 'optional',
      status: false,
    },
  ];
};

export const useRoomData = (item: Room | undefined) => {
  // *** SỬA CHÍNH: Sử dụng function tạo copy mới ***
  const [serviceOptionList, setServiceOptionList] = useState<
    ItemSeviceOptions[]
  >(createFreshServiceOptions());
  const [roomNumber, setRoomNumber] = useState('');
  const [area, setArea] = useState<number | ''>();
  const [addressText, setAddressText] = useState('');
  const [description, setDescription] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState<number | ''>();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [furniture, setFurniture] = useState<string[]>([]);
  const [image, setImage] = useState<any[]>([]);
  const [rentPrice, setRentPrice] = useState<number | ''>();
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [servicePrices, setServicePrices] = useState<ServicePrices>({
    electricity: 0,
    water: 0,
  });
  const [servicePriceConfig, setServicePriceConfig] =
    useState<ServicePriceConfig>({
      electricity: 'perUsage',
      water: 'perUsage',
    });
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  // Khởi tạo dữ liệu từ item được truyền vào
  useEffect(() => {
    if (item) {
      console.log('=== useRoomData Processing Item ===');

      setRoomNumber(item.roomNumber || '');
      setArea(item.area || '');
      setAddressText(item.location?.addressText || '');
      setDescription(item.description || '');
      setMaxOccupancy(item.maxOccupancy || '');
      setAmenities(item.amenities || []);
      setFurniture(item.furniture || []);
      setRentPrice(item.rentPrice || '');

      // Xử lý ảnh
      if (item.photos && item.photos.length > 0) {
        setImageArr(item.photos);

        // Tạo đối tượng ImageUploadResult từ URL ảnh
        const imageResults = item.photos.map((url, index) => ({
          id: `existing-${index}`,
          fileName: url.split('/').pop() || `image-${index}`,
          url: url,
          originalName: url.split('/').pop() || `image-${index}`,
          size: 0,
          dimensions: {
            width: null,
            height: null,
            fileSize: 0,
          },
          mimeType: 'image/jpeg',
          uploadDate: new Date().toISOString(),
          metadata: {
            isOptimized: false,
            hasExif: false,
            quality: 'high',
          },
        }));

        setImage(imageResults);
      }

      // Xử lý tọa độ
      if (
        item.location?.coordinates?.coordinates &&
        Array.isArray(item.location.coordinates.coordinates) &&
        item.location.coordinates.coordinates.length === 2
      ) {
        setCoordinates(
          item.location.coordinates.coordinates as [number, number],
        );
      }

      // *** SỬA: Tạo copy hoàn toàn mới của serviceOptions ***
      const freshServiceOptions = createFreshServiceOptions();

      // Load servicePrices và servicePriceConfig
      if (item.location?.servicePrices) {
        setServicePrices({
          electricity: item.location.servicePrices.electricity || 0,
          water: item.location.servicePrices.water || 0,
        });
      }

      if (item.location?.servicePriceConfig) {
        setServicePriceConfig({
          electricity:
            item.location.servicePriceConfig.electricity || 'perUsage',
          water: item.location.servicePriceConfig.water || 'perUsage',
        });
      }

      // Cập nhật electricity option
      const electricityOption = freshServiceOptions.find(
        s => s.value === 'electricity',
      );
      if (electricityOption && item.location?.servicePrices?.electricity) {
        electricityOption.price = item.location.servicePrices.electricity;
        electricityOption.priceType =
          item.location?.servicePriceConfig?.electricity || 'perUsage';
        electricityOption.status = true;
      }

      // Cập nhật water option
      const waterOption = freshServiceOptions.find(s => s.value === 'water');
      if (waterOption && item.location?.servicePrices?.water) {
        waterOption.price = item.location.servicePrices.water;
        waterOption.priceType =
          item.location?.servicePriceConfig?.water || 'perUsage';
        waterOption.status = true;
      }

      // Xử lý custom services
      let customServicesData: CustomService[] = [];
      if (
        item.location?.customServices &&
        Array.isArray(item.location.customServices)
      ) {
        customServicesData = item.location.customServices;
      } else if (item.customServices && Array.isArray(item.customServices)) {
        customServicesData = item.customServices;
      }

      if (customServicesData.length > 0) {
        customServicesData.forEach((service, index) => {
          const customServiceOption: ItemSeviceOptions = {
            id: 100 + index,
            label: service.name,
            value: `custom-${service.name}`,
            iconBase: 'IconWifi',
            category: 'optional',
            status: true,
            price: service.price,
            priceType: service.priceType,
            description: service.description,
          };
          freshServiceOptions.push(customServiceOption);
        });
      }

      setCustomServices(customServicesData);
      setServiceOptionList(freshServiceOptions);
    }
  }, [item]);

  return {
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
    amenities,
    setAmenities,
    furniture,
    setFurniture,
    image,
    setImage,
    rentPrice,
    setRentPrice,
    imageArr,
    setImageArr,
    coordinates,
    setCoordinates,
    servicePrices,
    setServicePrices,
    servicePriceConfig,
    setServicePriceConfig,
    customServices,
    setCustomServices,
    serviceOptionList,
    setServiceOptionList,
  };
};
