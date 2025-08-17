import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Image,
    Platform,
} from 'react-native';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { Colors } from '../../../theme/color';
import { scale, verticalScale, responsiveSpacing, responsiveFont } from '../../../utils/responsive';

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPaymentMethod: (method: string) => void;
    isLoading: boolean;
}

const PaymentMethodModal = ({
    visible,
    onClose,
    onSelectPaymentMethod,
    isLoading,
}: PaymentMethodModalProps) => {
    const paymentMethods = [
        { id: 'cash', name: 'Tiền mặt' },
        { id: 'bank_transfer', name: 'Chuyển khoản' },

    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn phương thức thanh toán</Text>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <Image
                                source={require('../../../assets/icons/icon_remove.png')}
                                style={styles.closeIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <LoadingOverlay 
                            visible={true}
                            message="Đang xử lý thanh toán..."
                            size="medium"
                        />
                    ) : (
                        <View style={styles.paymentMethodsContainer}>
                            {paymentMethods.map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={styles.paymentMethodItem}
                                    onPress={() => onSelectPaymentMethod(method.id)}
                                >
                                    <Text style={styles.paymentMethodText}>{method.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        padding: responsiveSpacing(20),
        paddingBottom: Platform.OS === 'ios' ? responsiveSpacing(40) : responsiveSpacing(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveSpacing(20),
    },
    title: {
        fontSize: responsiveFont(18),
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    closeIcon: {
        width: scale(24),
        height: scale(24),
    },
    paymentMethodsContainer: {
        marginTop: responsiveSpacing(10),
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: responsiveSpacing(15),
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    paymentMethodText: {
        fontSize: responsiveFont(16),
        color: Colors.dearkOlive,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: responsiveSpacing(20),
    },
    loadingText: {
        marginTop: responsiveSpacing(10),
        fontSize: responsiveFont(16),
        color: Colors.dearkOlive,
    },
});

export default PaymentMethodModal;
