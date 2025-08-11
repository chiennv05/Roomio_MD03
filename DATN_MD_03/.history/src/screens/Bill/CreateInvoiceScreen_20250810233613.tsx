import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Platform,
    Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { scale, verticalScale, SCREEN } from '../../utils/responsive';
import { RootStackParamList } from '../../types/route';
import { Contract } from '../../types/Contract';
import { formatDate } from '../../utils/formatDate';
import SaveTemplateModal from './components/SaveTemplateModal';
import DatePicker from 'react-native-date-picker';
import { createInvoice } from '../../store/services/billService';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';

type CreateInvoiceRouteProp = RouteProp<RootStackParamList, 'CreateInvoice'>;
type NavigationProps = NavigationProp<RootStackParamList>;

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
    const route = useRoute<CreateInvoiceRouteProp>();
    const { contract } = route.params;
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { token } = useAppSelector(state => state.auth);
    
    // Sử dụng CustomAlertModal hook
    const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveTemplateModalVisible, setSaveTemplateModalVisible] = useState(false);

    // State cho form tạo hóa đơn
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [items, setItems] = useState<InvoiceItem[]>([
        { name: 'Tiền thuê phòng', amount: 0, type: 'rent' }
    ]);

    // State cho modal lưu mẫu
    const [saveTemplateLoading, setSaveTemplateLoading] = useState(false);

    // Tạo ngày hạn thanh toán là ngày 10 của tháng đã chọn
    const getDueDate = () => {
        // Tạo ngày 10 của tháng đã chọn
        const dueDate = new Date(selectedYear, selectedMonth - 1, 10);

        // Nếu ngày 10 đã qua trong tháng hiện tại, đặt hạn thanh toán là ngày 10 tháng sau
        const today = new Date();
        if (selectedMonth === today.getMonth() + 1 &&
            selectedYear === today.getFullYear() &&
            today.getDate() > 10) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        return dueDate;
    };

    // Format date to display month and year
    const formatMonthYear = (date: Date) => {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setSelectedMonth(date.getMonth() + 1);
        setSelectedYear(date.getFullYear());
        setShowMonthPicker(false);
        setShowYearPicker(false);
    };

    // Cập nhật state từ thông tin hợp đồng
    useEffect(() => {
        if (contract) {
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
    const handleCreateInvoice = async () => {
        if (!contract || !contract._id) {
            showError('Không tìm thấy thông tin hợp đồng');
            return;
        }

        setLoading(true);

        try {
            // Lấy ngày hạn thanh toán là ngày 10 của tháng đã chọn
            const dueDate = getDueDate();

            // Format due date to YYYY-MM-DD
            const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

            const requestBody = {
                contractId: contract._id,
                month: selectedMonth,
                year: selectedYear,
                dueDate: formattedDueDate,
                includeServices: true
            };

            const response = await createInvoice(token || '', requestBody);

            if (!response.success) {
                // Hiển thị thông báo lỗi từ API
                showError(response.message || 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.');
                return;
            }

            // Lấy ID của hóa đơn vừa tạo
            const newInvoiceId = response.data?.invoice?._id;

            // Hiển thị thông báo thành công
            showSuccess('Hóa đơn đã được tạo thành công');
            // Nếu có ID hóa đơn, chuyển đến màn hình chỉnh sửa hoá đơn
            if (newInvoiceId) {
                // @ts-ignore
                navigation.navigate('EditInvoice', { invoiceId: newInvoiceId });
            } else {
                navigation.goBack();
            }
        } catch (error: any) {
            // Xử lý lỗi HTTP status code
            if (error.status === 400) {
                showError('Dữ liệu không hợp lệ hoặc hóa đơn đã tồn tại cho tháng này. Vui lòng kiểm tra lại.');
            } else if (error.status === 401 || error.status === 403) {
                showError('Bạn không có quyền tạo hóa đơn hoặc phiên đăng nhập đã hết hạn.');
            } else if (error.status === 404) {
                showError('Không tìm thấy hợp đồng cần thiết.');
            } else if (error.status === 409) {
                showError(`Đã có hóa đơn cho hợp đồng này trong tháng ${selectedMonth}/${selectedYear}`);
            } else {
                // Lỗi khác
                showError(error.message || 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý lưu mẫu hóa đơn
    const handleSaveAsTemplate = (templateName: string) => {
        setSaveTemplateLoading(true);

        // Trong màn hình tạo hóa đơn, chúng ta không có invoice ID vì hóa đơn chưa được tạo
        // Hiển thị thông báo cho người dùng biết
        setTimeout(() => {
            setSaveTemplateLoading(false);
            setSaveTemplateModalVisible(false);

            showError('Để lưu mẫu hóa đơn, bạn cần tạo hóa đơn trước. Sau khi tạo hóa đơn, bạn có thể lưu nó như một mẫu từ màn hình chỉnh sửa.');
        }, 500);
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
                        <Text style={styles.label}>Kỳ hóa đơn</Text>
                        <TouchableOpacity
                            style={styles.selectInput}
                            onPress={() => setShowMonthPicker(true)}
                        >
                            <Text style={styles.selectText}>
                                {formatMonthYear(selectedDate)}
                            </Text>
                        </TouchableOpacity>

                        <DatePicker
                            modal
                            open={showMonthPicker}
                            date={selectedDate}
                            mode="date"
                            locale="vi"
                            title="Chọn tháng và năm"
                            confirmText="Xác nhận"
                            cancelText="Hủy"
                            onConfirm={handleDateChange}
                            onCancel={() => setShowMonthPicker(false)}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Hạn thanh toán</Text>
                        <View style={styles.selectInput}>
                            <Text style={styles.selectText}>
                                {formatDate(getDueDate().toISOString())} (ngày 10)
                            </Text>
                        </View>
                        <Text style={styles.noteText}>
                            Hạn thanh toán mặc định là ngày 10 của tháng đã chọn
                        </Text>
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

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.saveTemplateButton}
                            onPress={() => setSaveTemplateModalVisible(true)}>
                            <Text style={styles.saveTemplateButtonText}>Lưu mẫu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleCreateInvoice}>
                            <Text style={styles.createButtonText}>Tạo hóa đơn</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Modal lưu mẫu hóa đơn */}
            <SaveTemplateModal
                visible={saveTemplateModalVisible}
                onClose={() => setSaveTemplateModalVisible(false)}
                onSave={handleSaveAsTemplate}
                loading={saveTemplateLoading}
            />

            {/* CustomAlertModal */}
            <CustomAlertModal
                visible={visible}
                title={alertConfig?.title || 'Thông báo'}
                message={alertConfig?.message || ''}
                type={alertConfig?.type}
                buttons={alertConfig?.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
        marginTop: 10,
    },
    header: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.backgroud,
        position: 'relative',
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 18,
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.black,
        textAlign: 'center',
    },
    templateButton: {
        color: Colors.primaryGreen,
        fontSize: 16,
        fontWeight: 'bold',
        padding: 5,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saveTemplateButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    saveTemplateButtonText: {
        color: Colors.primaryGreen,
        fontSize: 16,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        flex: 1,
    },
    createButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteText: {
        fontSize: 12,
        color: Colors.mediumGray,
        marginTop: 4,
        textAlign: 'right',
    },
});

export default CreateInvoiceScreen; 