import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import CustomSlider from './CustomSlider';
import ItemButtonConfirm from '../../LoginAndRegister/components/ItemButtonConfirm';

interface AreaModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minArea: number, maxArea: number) => void;
  selectedMinArea?: number;
  selectedMaxArea?: number;
}

const AreaModal: React.FC<AreaModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedMinArea = 20,
  selectedMaxArea = 70,
}) => {
  const [minArea, setMinArea] = useState(selectedMinArea);
  const [maxArea, setMaxArea] = useState(selectedMaxArea);

  useEffect(() => {
    if (visible) {
      setMinArea(selectedMinArea);
      setMaxArea(selectedMaxArea);
    }
  }, [visible, selectedMinArea, selectedMaxArea]);

  const handleConfirm = () => {
    onConfirm(minArea, maxArea);
    onClose();
  };

  const handleCancel = () => {
    setMinArea(selectedMinArea);
    setMaxArea(selectedMaxArea);
    onClose();
  };



  const handleSliderChange = (values: number[]) => {
    setMinArea(values[0]);
    setMaxArea(values[1]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Diện tích</Text>
            <Text style={styles.subtitle}>Lọc tìm kiếm theo diện tích</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Area Display */}
            <View style={styles.areaDisplay}>
              <Text style={styles.areaLabel}>
                Diện tích từ <Text style={styles.areaValue}>{minArea}m²</Text> đến <Text style={styles.areaValue}>{maxArea}m²</Text>
              </Text>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <CustomSlider
                values={[minArea, maxArea]}
                onValuesChange={handleSliderChange}
                minValue={10}
                maxValue={100}
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

export default AreaModal;

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
  areaDisplay: {
    marginBottom: 30,
  },
  areaLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  areaValue: {
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