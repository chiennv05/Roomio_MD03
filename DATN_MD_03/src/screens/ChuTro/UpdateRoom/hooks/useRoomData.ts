import {useEffect, useState} from 'react';
import {
  CustomService,
  Room,
  ServicePriceConfig,
  ServicePrices,
} from '../../../../types';
import {ItemSeviceOptions, SeviceOptions} from '../../AddRoom/utils/seviceOptions';

export const useRoomData = (item: Room | undefined) => {
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
  const [servicePriceConfig, setServicePriceConfig] = useState<ServicePriceConfig>({
    electricity: 'perUsage',
    water: 'perUsage',
  });
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [serviceOptionList, setServiceOptionList] = useState<ItemSeviceOptions[]>(
    SeviceOptions,
  );

  // Khởi tạo dữ liệu từ item được truyền vào
  useEffect(() => {
    if (item) {
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
          // Thêm các trường còn thiếu để phù hợp với ImageUploadResult
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
      if (item.location?.coordinates?.coordinates && 
          Array.isArray(item.location.coordinates.coordinates) && 
          item.location.coordinates.coordinates.length === 2) {
        setCoordinates(item.location.coordinates.coordinates as [number, number]);
      }
      
      // Xử lý giá dịch vụ
      if (item.location?.servicePrices) {
        setServicePrices({
          electricity: item.location.servicePrices.electricity || 0,
          water: item.location.servicePrices.water || 0,
        });
      }
      
      // Xử lý cấu hình giá dịch vụ
      if (item.location?.servicePriceConfig) {
        setServicePriceConfig({
          electricity: item.location.servicePriceConfig.electricity || 'perUsage',
          water: item.location.servicePriceConfig.water || 'perUsage',
        });
      }
      
      // Xử lý dịch vụ tùy chỉnh
      if (item.customServices && item.customServices.length > 0) {
        setCustomServices(item.customServices);
      }
      
      // Cập nhật danh sách dịch vụ
      const updatedServiceOptions = [...SeviceOptions];
      
      // Cập nhật giá điện nước
      const electricityOption = updatedServiceOptions.find(s => s.value === 'electricity');
      const waterOption = updatedServiceOptions.find(s => s.value === 'water');
      
      if (electricityOption && item.location?.servicePrices?.electricity) {
        electricityOption.price = item.location.servicePrices.electricity;
        electricityOption.priceType = item.location?.servicePriceConfig?.electricity;
        electricityOption.status = true;
      }
      
      if (waterOption && item.location?.servicePrices?.water) {
        waterOption.price = item.location.servicePrices.water;
        waterOption.priceType = item.location?.servicePriceConfig?.water;
        waterOption.status = true;
      }
      
      // Thêm các dịch vụ tùy chỉnh
      if (item.customServices && item.customServices.length > 0) {
        item.customServices.forEach((service, index) => {
          const existingService = updatedServiceOptions.find(s => s.label === service.name);
          if (existingService) {
            existingService.price = service.price;
            existingService.priceType = service.priceType;
            existingService.description = service.description;
            existingService.status = true;
          } else {
            updatedServiceOptions.push({
              id: 100 + index,
              label: service.name,
              value: `custom-${index}`,
              iconBase: 'IconWifi',
              category: 'optional',
              status: true,
              price: service.price,
              priceType: service.priceType,
              description: service.description,
            });
          }
        });
      }
      
      setServiceOptionList(updatedServiceOptions);
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