declare module 'react-native-ml-kit' {
  export interface Barcode {
    rawValue: string;
    displayValue?: string;
    format?: string;
    valueType?: string;
    [key: string]: any;
  }

  export const BarcodeScanning: {
    detectFromUri: (uri: string) => Promise<Barcode[]>;
    detectFromFile: (path: string) => Promise<Barcode[]>;
  };
}
