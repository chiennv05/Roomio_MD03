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
import { Colors } from '../../../theme/color';
import { scale, verticalScale } from '../../../utils/responsive';

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
        { id: 'e_wallet', name: 'Ví điện tử' },
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
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primaryGreen} />
                            <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
                        </View>
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    closeIcon: {
        width: 24,
        height: 24,
    },
    paymentMethodsContainer: {
        marginTop: 10,
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    paymentMethodText: {
        fontSize: 16,
        color: Colors.dearkOlive,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.dearkOlive,
    },
});

export default PaymentMethodModal; 