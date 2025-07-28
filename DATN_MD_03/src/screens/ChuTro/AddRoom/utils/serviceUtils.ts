import {
  CustomService,
  ServicePriceConfig,
  ServicePrices,
} from '../../../../types';
import {OptionItem} from '../../../../types/Options';

export type PriceType = 'perUsage' | 'perPerson' | 'perRoom';

type SaveServiceParams = {
  name: string;
  price: number;
  priceType: PriceType;
  description: string;
  editingService: OptionItem | null;
  setServicePrices: React.Dispatch<React.SetStateAction<ServicePrices>>;
  setServicePriceConfig: React.Dispatch<
    React.SetStateAction<ServicePriceConfig>
  >;
  setCustomServices: React.Dispatch<React.SetStateAction<CustomService[]>>;
  onCloseModal: () => void;
};

export const saveService = ({
  name,
  price,
  priceType,
  description,
  editingService,
  setServicePrices,
  setServicePriceConfig,
  setCustomServices,
  onCloseModal,
}: SaveServiceParams) => {
  if (!editingService) return;

  const {value} = editingService;

  if (value === 'electricity' || value === 'water') {
    setServicePrices(prev => ({
      ...prev,
      [value]: price,
    }));

    setServicePriceConfig(prev => ({
      ...prev,
      [value]: priceType,
    }));
  } else {
    const newService: CustomService = {
      name,
      price,
      priceType,
      description,
    };
    setCustomServices(prev => [...prev, newService]);
  }

  onCloseModal();
};
