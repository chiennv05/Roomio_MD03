export type ItemSeviceOptions = {
  id: number; // ✅ Đổi từ string → number
  value: string;
  label: string;
  iconBase: string;
  category?: 'required' | 'optional';
  description?: string;
  priceType?: 'perUsage' | 'perPerson' | 'perRoom';
  price?: number;
  status: boolean;
};

export const SeviceOptions: ItemSeviceOptions[] = [
  {
    id: 1,
    value: 'electricity',
    label: 'Điện',
    category: 'required',
    iconBase: 'IconElectrical',
    price: 0,
    status: false,
  },
  {
    id: 2,
    value: 'water',
    label: 'Nước',
    category: 'required',
    iconBase: 'IconWarterDrop',
    price: 0,
    status: false,
  },
  {
    id: 3,
    value: 'khac',
    label: 'Dịch vụ khác',
    category: 'optional',
    iconBase: 'IconService',
    price: 0,
    status: false,
  },
];
