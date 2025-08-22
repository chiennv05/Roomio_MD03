import {RoomApprovalStatus, RoomStatus} from '../../../../types';

export type AllRoomStatusType = RoomStatus | RoomApprovalStatus | 'all';

export type RoomSatus = {
  label: string;
  value: AllRoomStatusType;
  approvalStatus: AllRoomStatusType;
};

export const ALL_ROOM_STATUSES: RoomSatus[] = [
  {label: 'Tất cả', value: 'all', approvalStatus: 'all'},
  // RoomStatus
  {label: 'Phòng trống', value: 'trong', approvalStatus: 'duyet'},
  {label: 'Đã thuê', value: 'daThue', approvalStatus: 'duyet'},

  // RoomApprovalStatus
  {label: 'Chờ duyệt', value: 'trong', approvalStatus: 'choDuyet'},
  {label: 'Từ chối', value: 'all', approvalStatus: 'tuChoi'},
];
