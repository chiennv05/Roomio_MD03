import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import CustomSlider from './CustomSlider';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

interface PriceRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minPrice: number, maxPrice: number) => void;
  selectedMinPrice?: number;
  selectedMaxPrice?: number;
}

const PriceRangeModal: React.FC<PriceRangeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedMinPrice = 0,
  selectedMaxPrice = 20000000,
}) => {
  const [minPrice, setMinPrice] = useState(selectedMinPrice);
  const [maxPrice, setMaxPrice] = useState(selectedMaxPrice);

  useEffect(() => {
    if (visible) {
      setMinPrice(selectedMinPrice);
      setMaxPrice(selectedMaxPrice);
    }
  }, [visible, selectedMinPrice, selectedMaxPrice]);

  const handleConfirm = () => {
    onConfirm(minPrice, maxPrice);
    onClose();
  };

  const handleCancel = () => {
    setMinPrice(selectedMinPrice);
    setMaxPrice(selectedMaxPrice);
    onClose();
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return millions % 1 === 0 ? `${millions} triệu` : `${millions.toFixed(1)} triệu`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    } else {
      return price.toString();
    }
  };



  const handleSliderChange = (values: number[]) => {
    setMinPrice(values[0]);
    setMaxPrice(values[1]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Khoảng giá</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo khoảng giá ( theo tháng )</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Price Display */}
            <View style={styles.priceDisplay}>
              <Text style={styles.priceLabel}>
                Giá từ <Text style={styles.priceValue}>{formatPrice(minPrice)}</Text> đến <Text style={styles.priceValue}>{formatPrice(maxPrice)}</Text>
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <CustomSlider
                values={[minPrice, maxPrice]}
                onValuesChange={handleSliderChange}
                minValue={0}
                maxValue={20000000}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ItemButtonConfirm
              title="Xác nhận"
              icon="https://cdn-icons-png.flaticon.com/512/1828/1828665.png"
              onPress={handleConfirm}
              onPressIcon={handleCancel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PriceRangeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '45%',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  priceDisplay: {
    marginBottom: 30,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5EB600',
  },

  sliderContainer: {
    marginBottom: 40,
    paddingVertical: 10,
    alignItems: 'center',
  },

  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 