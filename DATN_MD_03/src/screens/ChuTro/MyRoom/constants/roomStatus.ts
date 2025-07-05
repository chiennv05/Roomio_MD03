import {RoomApprovalStatus, RoomStatus} from '../../../../types';

export type AllRoomStatusType = RoomStatus | RoomApprovalStatus | 'all';

export type RoomSatus = {
  label: string;
  value: AllRoomStatusType;
};

export const ALL_ROOM_STATUSES: RoomSatus[] = [
  {label: 'Tất cả', value: 'all'},
  // RoomStatus
  {label: 'Phòng trống', value: 'trong'},
  {label: 'Đã thuê', value: 'daThue'},

  // RoomApprovalStatus
  {label: 'Chờ duyệt', value: 'choDuyet'},
];
