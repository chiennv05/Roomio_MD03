export type ImageUploadResult = {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  dimensions: {
    width: number | null;
    height: number | null;
    fileSize: number;
  };
  mimeType: string;
  uploadDate: string;
  metadata: {
    isOptimized: boolean;
    hasExif: boolean;
    quality: string;
  };
};
