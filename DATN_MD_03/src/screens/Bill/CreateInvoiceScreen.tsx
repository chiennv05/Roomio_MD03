import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { scale, verticalScale, SCREEN } from '../../utils/responsive';
import { RootStackParamList } from '../../types/route';
import { Contract } from '../../types/Contract';
import { formatDate } from '../../utils/formatDate';

type CreateInvoiceRouteProp = RouteProp<RootStackParamList, 'CreateInvoice'>;

// Định nghĩa kiểu dữ liệu
interface Room {
    id: string;
    name: string;
}

interface Tenant {
    id: string;
    name: string;
}

interface InvoiceItem {
    name: string;
    amount: number;
    type: 'rent' | 'utility' | 'service';
}

const CreateInvoiceScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CreateInvoiceRouteProp>();
    const { contract } = route.params || {};

    const dispatch = useAppDispatch();
    const { token, user } = useAppSelector(state => state.auth);
    const [loading, setLoading] = useState(false);

    // State cho form tạo hóa đơn
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { name: 'Tiền thuê phòng', amount: 0, type: 'rent' }
    ]);

    // Cập nhật state từ thông tin hợp đồng
    useEffect(() => {
        if (contract) {
            console.log('Contract received:', contract._id);

            // Lấy thông tin phòng
            if (typeof contract.roomId === 'object' && contract.roomId) {
                setSelectedRoom({
                    id: contract.roomId._id,
                    name: contract.roomId.roomNumber
                });
            }

            // Lấy thông tin người thuê
            if (typeof contract.tenantId === 'object' && contract.tenantId) {
                setSelectedTenant({
                    id: contract.tenantId._id,
                    name: contract.tenantId.fullName
                });
            } else {
                setSelectedTenant({
                    id: 'unknown',
                    name: contract.contractInfo.tenantName
                });
            }

            // Thiết lập các khoản mục mặc định từ hợp đồng
            const defaultItems: InvoiceItem[] = [
                {
                    name: 'Tiền thuê phòng',
                    amount: contract.contractInfo.monthlyRent,
                    type: 'rent'
                }
            ];

            // Thêm các dịch vụ từ hợp đồng
            if (contract.contractInfo.customServices && contract.contractInfo.customServices.length > 0) {
                contract.contractInfo.customServices.forEach((service: { name: string; price: number }) => {
                    defaultItems.push({
                        name: service.name,
                        amount: service.price,
                        type: 'service'
                    });
                });
            }

            setItems(defaultItems);
        }
    }, [contract]);

    // Quay lại màn hình trước
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Xử lý tạo hóa đơn
    const handleCreateInvoice = () => {
        // TODO: Validate form và gọi API tạo hóa đơn
        Alert.alert(
            'Thông báo',
            'Tính năng tạo hóa đơn đang được phát triển',
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Image
                        source={require('../../assets/icons/icon_arrow_back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo hóa đơn mới</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryGreen} />
                </View>
            ) : (
                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                    {/* Thông tin hợp đồng */}
                    {contract && (
                        <View style={styles.contractInfo}>
                            <Text style={styles.contractTitle}>
                                Hợp đồng: {typeof contract.roomId === 'object' ? contract.roomId.roomNumber : 'Không xác định'}
                            </Text>
                            <Text style={styles.contractDetail}>
                                Người thuê: {typeof contract.tenantId === 'object' ? contract.tenantId.fullName : contract.contractInfo.tenantName}
                            </Text>
                            <Text style={styles.contractDetail}>
                                Địa chỉ: {contract.contractInfo.roomAddress}
                            </Text>
                            <Text style={styles.contractDetail}>
                                Thời hạn: {formatDate(contract.contractInfo.startDate)} - {formatDate(contract.contractInfo.endDate)}
                            </Text>
                        </View>
                    )}

                    {!contract && (
                        <>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Phòng</Text>
                                <TouchableOpacity style={styles.selectInput}>
                                    <Text style={styles.selectText}>
                                        {selectedRoom ? selectedRoom.name : 'Chọn phòng'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Người thuê</Text>
                                <TouchableOpacity style={styles.selectInput}>
                                    <Text style={styles.selectText}>
                                        {selectedTenant ? selectedTenant.name : 'Chọn người thuê'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Hạn thanh toán</Text>
                        <TouchableOpacity style={styles.selectInput}>
                            <Text style={styles.selectText}>
                                {dueDate || 'Chọn ngày'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemType}>
                                    {item.type === 'rent' ? 'Tiền thuê' :
                                        item.type === 'utility' ? 'Tiện ích' : 'Dịch vụ'}
                                </Text>
                            </View>
                            <TextInput
                                style={styles.amountInput}
                                keyboardType="numeric"
                                placeholder="0"
                                value={item.amount > 0 ? item.amount.toString() : ''}
                                onChangeText={(text) => {
                                    const newItems = [...items];
                                    newItems[index].amount = parseInt(text) || 0;
                                    setItems(newItems);
                                }}
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addItemButton}>
                        <Text style={styles.addItemText}>+ Thêm khoản mục</Text>
                    </TouchableOpacity>

                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalAmount}>
                            {items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('vi-VN')} đ
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateInvoice}>
                        <Text style={styles.createButtonText}>Tạo hóa đơn</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    contractInfo: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    contractTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: 8,
    },
    contractDetail: {
        fontSize: 14,
        color: Colors.black,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginTop: 16,
        marginBottom: 12,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: Colors.mediumGray,
        marginBottom: 8,
    },
    selectInput: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectText: {
        fontSize: 16,
        color: Colors.black,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.black,
    },
    itemType: {
        fontSize: 12,
        color: Colors.mediumGray,
        marginTop: 4,
    },
    amountInput: {
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 120,
        textAlign: 'right',
        fontSize: 16,
    },
    addItemButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryGreen,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 24,
    },
    addItemText: {
        color: Colors.primaryGreen,
        fontWeight: '500',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    createButton: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    createButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateInvoiceScreen; 