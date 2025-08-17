import React, { useState, useEffect } from 'react';
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
import { scale, verticalScale, responsiveSpacing, responsiveFont } from '../../../utils/responsive';
import DatePicker from 'react-native-date-picker';
import { applyInvoiceTemplate } from '../../../store/services/billService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/route';
import CustomAlertModal from '../../../components/CustomAlertModal';
import { useCustomAlert } from '../../../hooks/useCustomAlrert';

interface ApplyTemplateModalProps {
    visible: boolean;
    onClose: () => void;
    contract: Contract | null;
    templateId: string;
    templateName: string;
    onSuccess: () => void;
}

type BillNavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;

const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({
    visible,
    onClose,
    contract,
    templateId,
    templateName,
    onSuccess,
}) => {
    const navigation = useNavigation<BillNavigationProp>();
    const { token } = useAppSelector(state => state.auth);
    const { showAlert, showSuccess, showError, showConfirm, visible: alertVisible, alertConfig, hideAlert } = useCustomAlert();
    const [loading, setLoading] = useState(false);
    const [keepReadings, setKeepReadings] = useState(true);

    // Date picker states
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDueDate, setSelectedDueDate] = useState(() => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);
        return dueDate;
    });

    // Get month and year from selected date
    const selectedMonth = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
    const selectedYear = selectedDate.getFullYear();

    // Calculate due date (5 days after selected date) - for reference only
    const calculatedDueDate = new Date(selectedDate);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 5);

    // Function to check if selected date is valid (not before contract start date)
    const isDateValid = (date: Date) => {
        if (!contract) return false;
        
        // Lấy ngày bắt đầu hợp đồng
        const contractStartDate = new Date(contract.contractInfo.startDate);
        contractStartDate.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const selectedDateOnly = new Date(date);
        selectedDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day
        
        // Ngày được chọn phải từ ngày bắt đầu hợp đồng trở đi
        return selectedDateOnly >= contractStartDate;
    };

    // Function to check if due date is valid (after start date)
    const isDueDateValid = (dueDate: Date, startDate: Date) => {
        const startDateOnly = new Date(startDate);
        startDateOnly.setHours(0, 0, 0, 0);
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        
        // Check if due date is after start date
        if (dueDateOnly <= startDateOnly) {
            return false;
        }
        
        return true;
    };

    const handleApplyTemplate = async () => {
        if (!contract || !contract._id) {
            showError('Không tìm thấy thông tin hợp đồng');
            return;
        }

        if (!templateId) {
            showError('Không tìm thấy thông tin mẫu hóa đơn');
            return;
        }

        setLoading(true);

        try {
            // Format due date to YYYY-MM-DD
            const formattedDueDate = `${selectedDueDate.getFullYear()}-${String(selectedDueDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDueDate.getDate()).padStart(2, '0')}`;

            const requestBody = {
                contractId: contract._id,
                month: selectedMonth,
                year: selectedYear,
                dueDate: formattedDueDate,
                keepReadings: keepReadings,
            };

            // Không log ra console để tránh hiển thị lỗi
            // console.log('Applying template with:', requestBody);

            const response = await applyInvoiceTemplate(token || '', templateId, requestBody);

            if (!response.success) {
                // Hiển thị thông báo lỗi từ API
                showError(response.message || 'Có lỗi xảy ra khi áp dụng mẫu hóa đơn. Vui lòng thử lại sau.');
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
                showSuccess('Hóa đơn đã được tạo thành công từ mẫu');
            }
        } catch (error: any) {
            // Xử lý lỗi HTTP status code
            if (error.status === 400) {
                showError('Dữ liệu không hợp lệ hoặc hóa đơn đã tồn tại cho tháng này. Vui lòng kiểm tra lại.');
            } else if (error.status === 401 || error.status === 403) {
                showError('Bạn không có quyền tạo hóa đơn hoặc phiên đăng nhập đã hết hạn.');
            } else if (error.status === 404) {
                showError('Không tìm thấy mẫu hóa đơn hoặc hợp đồng cần thiết.');
            } else if (error.status === 409) {
                showError(`Đã có hóa đơn cho hợp đồng này trong tháng ${selectedMonth}/${selectedYear}`);
            } else if (error.status >= 500) {
                showError('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.');
            } else {
                // Lỗi khác
                showError(error.message || 'Có lỗi xảy ra khi áp dụng mẫu hóa đơn. Vui lòng thử lại sau.');
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

    // Format date to display day/month/year
    const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateSelection = (date: Date) => {
        if (!isDateValid(date)) {
            // Check if it's because it's before contract start date
            if (!contract) {
                showError('Không tìm thấy thông tin hợp đồng');
                return;
            }
            
            const contractStartDate = new Date(contract.contractInfo.startDate);
            contractStartDate.setHours(0, 0, 0, 0);
            const selectedDateOnly = new Date(date);
            selectedDateOnly.setHours(0, 0, 0, 0);
            
            if (selectedDateOnly < contractStartDate) {
                showError(`Không thể chọn ngày trước ngày bắt đầu hợp đồng (${formatDate(contractStartDate)}). Vui lòng chọn ngày từ ${formatDate(contractStartDate)} trở đi.`);
            }
            return;
        }
        setSelectedDate(date);
        setDatePickerOpen(false);
    };

    const handleDueDateSelection = (date: Date) => {
        if (!isDateValid(date)) {
            if (!contract) {
                showError('Không tìm thấy thông tin hợp đồng');
                return;
            }
            
            const contractStartDate = new Date(contract.contractInfo.startDate);
            contractStartDate.setHours(0, 0, 0, 0);
            const selectedDateOnly = new Date(date);
            selectedDateOnly.setHours(0, 0, 0, 0);
            
            if (selectedDateOnly < contractStartDate) {
                showError(`Không thể chọn ngày hết hạn trước ngày bắt đầu hợp đồng (${formatDate(contractStartDate)}). Vui lòng chọn ngày từ ${formatDate(contractStartDate)} trở đi.`);
            }
            return;
        }
        if (!isDueDateValid(date, selectedDate)) {
            // Check if it's because it's before start date
            const startDateOnly = new Date(selectedDate);
            startDateOnly.setHours(0, 0, 0, 0);
            const dueDateOnly = new Date(date);
            dueDateOnly.setHours(0, 0, 0, 0);
            
            if (dueDateOnly <= startDateOnly) {
                showError('Ngày hết hạn phải sau ngày bắt đầu. Vui lòng chọn ngày khác.');
            }
            return;
        }
        setSelectedDueDate(date);
        setDueDatePickerOpen(false);
    };

    // Validate initial date when component mounts
    useEffect(() => {
        if (!contract) return;
        
        // Khởi tạo ngày mặc định từ ngày bắt đầu hợp đồng
        const contractStartDate = new Date(contract.contractInfo.startDate);
        contractStartDate.setHours(0, 0, 0, 0);
        
        if (!isDateValid(selectedDate)) {
            showError(`Ngày hiện tại (${formatDate(selectedDate)}) trước ngày bắt đầu hợp đồng (${formatDate(contractStartDate)}). Đã tự động chọn ngày bắt đầu hợp đồng.`);
            // Reset to contract start date
            setSelectedDate(contractStartDate);
        }
        
        // Also validate due date
        if (!isDueDateValid(selectedDueDate, selectedDate)) {
            // Reset due date to 5 days after start date
            const newDueDate = new Date(selectedDate);
            newDueDate.setDate(newDueDate.getDate() + 5);
            setSelectedDueDate(newDueDate);
        }
    }, [contract]);

    // Tự động cập nhật ngày hết hạn khi ngày bắt đầu thay đổi
    useEffect(() => {
        // Luôn tự động cập nhật ngày hết hạn khi ngày bắt đầu thay đổi
        const newDueDate = new Date(selectedDate);
        newDueDate.setDate(newDueDate.getDate() + 5);
        setSelectedDueDate(newDueDate);
    }, [selectedDate]);

    const handleDateChange = (date: Date) => {
        handleDateSelection(date);
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
                        <Text style={styles.title}>Áp dụng mẫu hóa đơn</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.templateInfo}>
                        <Text style={styles.templateTitle}>
                            Mẫu: {templateName || 'Mẫu hóa đơn'}
                        </Text>
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
                            onConfirm={handleDateChange}
                            onCancel={() => setDatePickerOpen(false)}
                        />

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Giữ nguyên chỉ số đồng hồ từ mẫu</Text>
                            <Switch
                                trackColor={{ false: Colors.lightGray, true: Colors.primaryGreen }}
                                thumbColor={keepReadings ? Colors.white : Colors.white}
                                ios_backgroundColor={Colors.lightGray}
                                onValueChange={setKeepReadings}
                                value={keepReadings}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleApplyTemplate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <Text style={styles.createButtonText}>Áp dụng mẫu</Text>
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
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        padding: responsiveSpacing(20),
        paddingBottom: Platform.OS === 'ios' ? 0 : responsiveSpacing(20),
        maxHeight: '100%',
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
    closeButton: {
        padding: responsiveSpacing(5),
    },
    closeButtonText: {
        fontSize: responsiveFont(18),
        color: Colors.mediumGray,
        fontWeight: 'bold',
    },
    templateInfo: {
        backgroundColor: Colors.lightGray,
        padding: responsiveSpacing(15),
        borderRadius: scale(8),
        marginBottom: responsiveSpacing(20),
    },
    templateTitle: {
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: responsiveSpacing(8),
    },
    contractInfo: {
        backgroundColor: Colors.lightGray,
        padding: responsiveSpacing(15),
        borderRadius: scale(8),
        marginBottom: responsiveSpacing(20),
    },
    contractTitle: {
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: responsiveSpacing(8),
    },
    contractDetail: {
        fontSize: responsiveFont(14),
        color: Colors.mediumGray,
        marginBottom: responsiveSpacing(4),
    },
    formSection: {
        marginBottom: responsiveSpacing(20),
    },
    sectionTitle: {
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: responsiveSpacing(15),
    },
    datePickerButton: {
        backgroundColor: Colors.lightGray,
        padding: responsiveSpacing(15),
        borderRadius: scale(8),
        alignItems: 'center',
        marginBottom: responsiveSpacing(15),
    },
    datePickerButtonText: {
        fontSize: responsiveFont(16),
        color: Colors.dearkOlive,
        fontWeight: '500',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: responsiveSpacing(10),
        marginBottom: responsiveSpacing(15),
    },
    switchLabel: {
        fontSize: responsiveFont(14),
        color: Colors.mediumGray,
        flex: 1,
    },
    createButton: {
        backgroundColor: Colors.primaryGreen,
        borderRadius: 50,
        padding: responsiveSpacing(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: Colors.white,
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
    },
    bottomSafeArea: {
        height: Platform.OS === 'ios' ? responsiveSpacing(20) : 0,
        backgroundColor: Colors.white,
    },
    referenceInfo: {
        backgroundColor: Colors.lightGray,
        padding: responsiveSpacing(10),
        borderRadius: scale(8),
        marginTop: responsiveSpacing(10),
        marginBottom: responsiveSpacing(10),
        alignItems: 'center',
    },
    referenceText: {
        fontSize: responsiveFont(12),
        color: Colors.mediumGray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    contractDateInfo: {
        fontSize: responsiveFont(12),
        color: Colors.mediumGray,
        marginTop: responsiveSpacing(5),
        textAlign: 'center',
    },
    dateConstraintsInfo: {
        backgroundColor: '#FFF3CD', // Light yellow background for constraints
        padding: responsiveSpacing(10),
        borderRadius: scale(8),
        marginTop: responsiveSpacing(10),
        marginBottom: responsiveSpacing(10),
        alignItems: 'center',
    },
    dateConstraintsText: {
        fontSize: responsiveFont(12),
        color: '#856404', // Dark yellow color for constraints
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ApplyTemplateModal;
