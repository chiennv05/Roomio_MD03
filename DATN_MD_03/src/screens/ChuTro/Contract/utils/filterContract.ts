export interface ItemFilterContract {
  value: string;
  label: string;
}

export const filterOptionsContract: ItemFilterContract[] = [
  {value: 'all', label: 'Tất cả'},
  {value: 'draft', label: 'Bản nháp'},
  {value: 'pending_signature', label: 'Chờ ký'},
  {value: 'pending_approval', label: 'Chờ phê duyệt'},
  {value: 'active', label: 'Đang hiệu lực '},
  {value: 'expired', label: 'Hết hạn'},
  {value: 'terminated', label: 'Đã chấm dứt'},
];
