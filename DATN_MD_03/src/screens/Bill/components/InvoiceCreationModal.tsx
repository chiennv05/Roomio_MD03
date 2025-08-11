import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Contract } from '../../../types/Contract';
import { useAppSelector } from '../../../hooks/redux';
import { scale, verticalScale } from '../../../utils/responsive';
import DatePicker from 'react-native-date-picker';
import { createInvoice, checkDuplicateInvoice } from '../../../store/services/billService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/route';
import CustomAlertModal from '../../../components/CustomAlertModal';
import { useCustomAlert } from '../../../hooks/useCustomAlrert';

interface InvoiceCreationModalProps {
    visible: boolean;
    onClose: () => void;
    contract: Contract | null;
    onSuccess: () => void;
}

type BillNavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;

const InvoiceCreationModal: React.FC<InvoiceCreationModalProps> = ({
    visible,
    onClose,
    contract,
    onSuccess,
}) => {
    const navigation = useNavigation<BillNavigationProp>();
    const { token } = useAppSelector(state => state.auth);
    const { showAlert, showSuccess, showError, showConfirm, visible: alertVisible, alertConfig, hideAlert } = useCustomAlert();
    const [loading, setLoading] = useState(false);
    const [includeServices, setIncludeServices] = useState(true);

    // Date picker states
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Calculate due date (10 days after current date) - used for API but not shown in UI
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);

    // Get month and year from selected date
    const selectedMonth = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
    const selectedYear = selectedDate.getFullYear();

    const handleCreateInvoice = async () => {
        if (!contract || !contract._id) {
            showError('Không tìm thấy thông tin hợp đồng');
            return;
        }

        setLoading(true);

        try {
            // Format due date to YYYY-MM-DD
            const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

            const requestBody = {
                contractId: contract._id,
                month: selectedMonth,
                year: selectedYear,
                dueDate: formattedDueDate,
                includeServices: includeServices,
            };

            console.log('Creating invoice with:', requestBody);

            const response = await createInvoice(token || '', requestBody);

            if (!response.success) {
                // Kiểm tra nếu lỗi là do trùng lặp
                if (response.message && response.message.toLowerCase().includes('đã tồn tại')) {
                    showError(`Đã có hóa đơn cho hợp đồng này trong tháng ${selectedMonth}/${selectedYear}`);
                } else {
                    // Hiển thị thông báo lỗi từ API
                    showError(response.message || 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.');
                }
                return;
            }

            // Lấy ID của hóa đơn vừa tạo
            const newInvoiceId = response.data?.invoice?._id;

            // Đóng modal và thông báo thành công
            onClose();
            onSuccess();

            // Nếu có ID hóa đơn, chuyển đến màn hình chỉnh sửa hoá đơn
            if (newInvoiceId) {
                // Đợi một chút để modal đóng hoàn toàn trước khi chuyển màn hình
                setTimeout(() => {
                    navigation.navigate('EditInvoice', { invoiceId: newInvoiceId });
                }, 300);
            } else {
                showSuccess('Hóa đơn đã được tạo thành công');
            }
        } catch (error: any) {
            console.error('Error creating invoice:', error);

            // Xử lý lỗi HTTP status code
            if (error.status === 400) {
                showError('Dữ liệu không hợp lệ hoặc hóa đơn đã tồn tại cho tháng này. Vui lòng kiểm tra lại.');
            } else if (error.status === 401 || error.status === 403) {
                showError('Bạn không có quyền tạo hóa đơn hoặc phiên đăng nhập đã hết hạn.');
            } else if (error.status === 404) {
                showError('Không tìm thấy hợp đồng hoặc dữ liệu cần thiết để tạo hóa đơn.');
            } else if (error.status === 409) {
                showError(`Đã có hóa đơn cho hợp đồng này trong tháng ${selectedMonth}/${selectedYear}`);
            } else if (error.status >= 500) {
                showError('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.');
            } else {
                // Lỗi khác
                showError(error.message || 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Format date to display month and year
    const formatMonthYear = (date: Date) => {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Tạo hóa đơn mới</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {contract && (
                        <View style={styles.contractInfo}>
                            <Text style={styles.contractTitle}>
                                Phòng: {typeof contract.roomId === 'object' ? contract.roomId.roomNumber : contract.contractInfo?.roomNumber || 'Không xác định'}
                            </Text>
                            <Text style={styles.contractDetail}>
                                Người thuê: {typeof contract.tenantId === 'object' ? contract.tenantId.fullName : contract.contractInfo?.tenantName || 'Không xác định'}
                            </Text>
                        </View>
                    )}

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Chọn tháng và năm</Text>

                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setDatePickerOpen(true)}
                        >
                            <Text style={styles.datePickerButtonText}>
                                {formatMonthYear(selectedDate)}
                            </Text>
                        </TouchableOpacity>

                        <DatePicker
                            modal
                            open={datePickerOpen}
                            date={selectedDate}
                            mode="date"
                            locale="vi"
                            title="Chọn tháng và năm"
                            confirmText="Xác nhận"
                            cancelText="Hủy"
                            onConfirm={(date) => {
                                setDatePickerOpen(false);
                                setSelectedDate(date);
                            }}
                            onCancel={() => {
                                setDatePickerOpen(false);
                            }}
                        />

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Tự động thêm các dịch vụ từ hợp đồng</Text>
                            <Switch
                                trackColor={{ false: Colors.lightGray, true: Colors.primaryGreen }}
                                thumbColor={includeServices ? Colors.white : Colors.white}
                                ios_backgroundColor={Colors.lightGray}
                                onValueChange={setIncludeServices}
                                value={includeServices}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateInvoice}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <Text style={styles.createButtonText}>Tạo hóa đơn</Text>
                        )}
                    </TouchableOpacity>
                    <SafeAreaView style={styles.bottomSafeArea} />
                </View>
            </View>

            {/* Custom Alert Modal */}
            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig?.title || 'Thông báo'}
                message={alertConfig?.message || ''}
                onClose={hideAlert}
                type={alertConfig?.type}
                buttons={alertConfig?.buttons}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
        maxHeight: '100%',
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
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 18,
        color: Colors.mediumGray,
        fontWeight: 'bold',
    },
    contractInfo: {
        backgroundColor: Colors.lightGray,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    contractTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: 8,
    },
    contractDetail: {
        fontSize: 14,
        color: Colors.mediumGray,
        marginBottom: 4,
    },
    formSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: 15,
    },
    datePickerButton: {
        backgroundColor: Colors.lightGray,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: Colors.dearkOlive,
        fontWeight: '500',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    switchLabel: {
        fontSize: 14,
        color: Colors.mediumGray,
        flex: 1,
    },
    createButton: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSafeArea: {
        height: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: Colors.white,
    },
});

export default InvoiceCreationModal;
