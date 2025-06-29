// Deep Link Utilities for Roomio App

export interface ShareContent {
  roomId: string;
  roomName: string;
  roomPrice: string;
  roomAddress: string;
}

// Tạo deep link URL cho app
export const createDeepLinkUrl = (roomId: string): string => {
  return `roomio://room/${roomId}`;
};

// Tạo web fallback URL
export const createWebUrl = (roomId: string): string => {
  return `https://roomio.app/room/${roomId}`;
};

// Tạo nội dung chia sẻ hoàn chỉnh
export const createShareContent = (content: ShareContent) => {
  const deepUrl = createDeepLinkUrl(content.roomId);
  const webUrl = createWebUrl(content.roomId);
  
  return {
    title: 'Chia sẻ phòng trọ từ Roomio',
    message: `🏠 ${content.roomName}
💰 ${content.roomPrice}/tháng  
📍 ${content.roomAddress}

Xem chi tiết phòng trọ tại:
📱 Mở trong app: ${deepUrl}
🌐 Xem trên web: ${webUrl}

Tải app Roomio để khám phá thêm nhiều phòng trọ chất lượng!`,
    url: deepUrl,
    webUrl: webUrl,
  };
};

// Parse deep link để lấy roomId
export const parseDeepLink = (url: string): string | null => {
  try {
    // Handle roomio://room/roomId
    if (url.startsWith('roomio://room/')) {
      return url.replace('roomio://room/', '');
    }
    
    // Handle https://roomio.app/room/roomId
    if (url.includes('roomio.app/room/')) {
      const parts = url.split('roomio.app/room/');
      if (parts.length > 1) {
        return parts[1].split('?')[0]; // Remove query params if any
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

// Validate roomId format
export const isValidRoomId = (roomId: string): boolean => {
  // Kiểm tra roomId có hợp lệ không (MongoDB ObjectId format)
  return /^[a-fA-F0-9]{24}$/.test(roomId);
}; 