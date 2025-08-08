import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Invoice } from '../../../types/Bill';
import { Colors } from '../../../theme/color';
import { scale } from '../../../utils/responsive';
import { useAppSelector } from '../../../hooks/redux';

interface InvoiceCardProps {
    invoice: Invoice;
    onPress: (invoice: Invoice) => void;
    onEdit?: (invoice: Invoice) => void;
    onDelete?: (invoice: Invoice) => void;
}

// Hàm định dạng ngày tháng
const formatDateDisplay = (dateString: string, format: string = 'DD/MM/YYYY') => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.log('Lỗi khi định dạng ngày tháng:', error);
        return dateString;
    }
};

// Hàm truy cập an toàn các thuộc tính lồng nhau
const getNestedValue = (obj: any, path: string, defaultValue: any = undefined) => {
    try {
        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result === null || result === undefined || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }

        return result !== undefined ? result : defaultValue;
    } catch (error) {
        console.log(`Lỗi khi truy cập đường dẫn ${path}:`, error);
        return defaultValue;
    }
};

// Map status to color
const getStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return Colors.primaryGreen;
        case 'pending':
            return Colors.limeGreen;
        case 'overdue':
            return Colors.red;
        case 'draft':
            return Colors.mediumGray;
        case 'cancelled':
            return Colors.darkGray;
        default:
            return Colors.mediumGray;
    }
};

// Map status to Vietnamese
const getStatusText = (status: string) => {
    switch (status) {
        case 'paid':
            return 'Đã thanh toán';
        case 'overdue':
            return 'Quá hạn';
        case 'pending_confirmation':
            return 'Chờ xác nhận';
        case 'issued':
            return 'Đã phát hành';
        case 'draft':
            return 'Nháp';
        case 'canceled':
            return 'Đã hủy';
        default:
            return status;
    }
};

// Hàm xử lý hiển thị kỳ hóa đơn
const formatPeriod = (period: string | { month: number; year: number } | undefined) => {
    if (!period) return 'N/A';

    if (typeof period === 'string') {
        // Nếu period là string, dùng formatDateDisplay
        return formatDateDisplay(period, 'MM/YYYY');
    } else if (typeof period === 'object' && 'month' in period && 'year' in period) {
        // Nếu period là object với month và year
        return `${period.month.toString().padStart(2, '0')}/${period.year}`;
    }

    return 'N/A';
};

// Tạo tên hóa đơn dựa trên tháng và năm
const getInvoiceTitle = (invoice: Invoice) => {
    // Lấy kỳ hóa đơn
    const period = invoice.period;
    let monthStr = '';
    let yearStr = '';

    if (typeof period === 'string') {
        // Nếu period là string, parse ngày tháng
        const date = new Date(period);
        monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
        yearStr = date.getFullYear().toString();
    } else if (typeof period === 'object' && 'month' in period && 'year' in period) {
        // Nếu period là object với month và year
        monthStr = period.month.toString().padStart(2, '0');
        yearStr = period.year.toString();
    } else {
        // Nếu không có thông tin period rõ ràng, sử dụng số hóa đơn
        return `Hóa đơn #${invoice.invoiceNumber}`;
    }

    // Hiển thị theo định dạng tháng/năm dạng số
    return `Hóa đơn tháng ${monthStr}/${yearStr}`;
};

// Hàm lấy tên người thuê
const getTenantName = (invoice: Invoice) => {
    // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
    if (invoice.contractId && typeof invoice.contractId === 'object' && invoice.contractId.contractInfo) {
        const tenantName = invoice.contractId.contractInfo.tenantName;
        if (tenantName) {
            return tenantName;
        }
    }

    // Nếu tenantId là object có chứa fullName
    const tenant = invoice.tenantId;
    if (tenant && typeof tenant === 'object') {
        // Ưu tiên sử dụng fullName nếu có
        if (tenant.fullName) return tenant.fullName;

        // Nếu có name thì sử dụng
        if (tenant.name) return tenant.name;

        // Nếu có displayName thì sử dụng
        if (tenant.displayName) return tenant.displayName;

        // Nếu có email hoặc phone
        if (tenant.email) return tenant.email;
        if (tenant.phone) return tenant.phone;
    }

    // Nếu tenantId là string, tham chiếu đến hợp đồng để lấy thông tin
    if (tenant && typeof tenant === 'string' && invoice.contractId &&
        typeof invoice.contractId === 'object' && invoice.contractId.contractInfo) {
        return invoice.contractId.contractInfo.tenantName;
    }

    // Fallback: Hiển thị "Người thuê" thay vì ID
    return '....';
};

// Hàm lấy thông tin phòng
const getRoomInfo = (invoice: Invoice) => {
    // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
    if (invoice.contractId && typeof invoice.contractId === 'object' && invoice.contractId.contractInfo) {
        const roomNumber = invoice.contractId.contractInfo.roomNumber;
        if (roomNumber) {
            return roomNumber;
        }
    }

    // Kiểm tra nếu roomId là object
    if (invoice.roomId && typeof invoice.roomId === 'object') {
        // Ưu tiên sử dụng roomNumber nếu có
        if (invoice.roomId.roomNumber) return invoice.roomId.roomNumber;

        // Hoặc sử dụng name nếu có
        if (invoice.roomId.name) return invoice.roomId.name;

        // Hoặc sử dụng title nếu có
        if (invoice.roomId.title) return invoice.roomId.title;
    }

    // Nếu roomId là string, tham chiếu đến hợp đồng để lấy thông tin
    if (invoice.roomId && typeof invoice.roomId === 'string' && invoice.contractId &&
        typeof invoice.contractId === 'object' && invoice.contractId.contractInfo) {
        return invoice.contractId.contractInfo.roomNumber;
    }

    // Fallback: Hiển thị "Phòng cho thuê" thay vì ID
    return '....';
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onPress, onEdit, onDelete }) => {
    // Get user role from Redux store
    const { user } = useAppSelector(state => state.auth);
    const isLandlord = user?.role === 'chuTro';
    const isDraft = invoice.status === 'draft';

    // Show edit/delete buttons only for landlords and draft invoices
    const showActions = isLandlord && isDraft;

    // Stop propagation to prevent triggering the card's onPress when clicking buttons
    const handleEdit = (e: any) => {
        e.stopPropagation();
        if (onEdit) onEdit(invoice);
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        if (onDelete) onDelete(invoice);
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={styles.container}
                onPress={() => onPress(invoice)}
                activeOpacity={0.8}>
                <View style={styles.header}>
                    <Text style={styles.invoiceTitle}>{getInvoiceTitle(invoice)}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(invoice.status) },
                        ]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                    </View>
                </View>

                {/* Chỉ thêm phần hiển thị "Người ở cùng" nếu isRoommate là true */}
                {invoice.isRoommate && (
                    <View style={styles.roommateBadge}>
                        <Text style={styles.roommateText}>Người ở cùng</Text>
                    </View>
                )}

                <View style={styles.content}>
                    <Text style={styles.invoiceNumber}>Mã hóa đơn: #{invoice.invoiceNumber}</Text>

                    {/* Hiển thị thông tin phòng */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Phòng:</Text>
                        <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                            {getRoomInfo(invoice) !== 'Phòng cho thuê' ? getRoomInfo(invoice) : (
                                invoice.contractId && typeof invoice.contractId === 'object' &&
                                    invoice.contractId.contractInfo ?
                                    invoice.contractId.contractInfo.roomNumber : 'Phòng cho thuê'
                            )}
                        </Text>
                    </View>

                    {/* Thêm thông tin người thuê nếu có */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Người thuê:</Text>
                        <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                            {getTenantName(invoice) !== 'Người thuê' ? getTenantName(invoice) : (
                                invoice.contractId && typeof invoice.contractId === 'object' &&
                                    invoice.contractId.contractInfo ?
                                    invoice.contractId.contractInfo.tenantName : 'Người thuê'
                            )}
                        </Text>
                    </View>

                    {/* Ngày xuất hóa đơn nếu có */}
                    {invoice.issueDate && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Ngày phát hành:</Text>
                            <Text style={styles.value}>
                                {formatDateDisplay(invoice.issueDate)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.row}>
                        <Text style={styles.label}>Hạn thanh toán:</Text>
                        <Text style={styles.value}>
                            {formatDateDisplay(invoice.dueDate)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Trạng thái:</Text>
                        <Text
                            style={[styles.value, { color: getStatusColor(invoice.status) }]}>
                            {getStatusText(invoice.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalAmount}>
                        {invoice.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Action buttons for landlords and draft invoices */}
            {showActions && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleEdit}
                    >
                        <Text style={styles.editButtonText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteButtonText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        marginVertical: 5, // Reduced from 8
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    container: {
        padding: 10, // Reduced from 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6, // Reduced from 10
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    content: {
        marginBottom: 6, // Reduced from 10
    },
    invoiceNumber: {
        fontSize: 14,
        color: Colors.limeGreen,
        marginBottom: 6, // Reduced from 10
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3, // Reduced from 6
    },
    label: {
        fontSize: 14,
        color: Colors.mediumGray,
        width: scale(100),
    },
    value: {
        fontSize: 14,
        color: Colors.dearkOlive,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2, // Reduced from 5
        paddingTop: 6, // Reduced from 10
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 6,
        marginLeft: 10,
        backgroundColor: Colors.primaryGreen,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: Colors.red,
    },
    deleteButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    roommateBadge: {
        position: 'absolute',
        top: scale(40),
        right: scale(0),
        backgroundColor: Colors.primaryGreen + '20',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderTopLeftRadius: scale(12),
        borderBottomLeftRadius: scale(12),
        borderRightWidth: scale(3),
        borderRightColor: Colors.primaryGreen,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roommateText: {
        fontSize: scale(11),
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
});

export default InvoiceCard; 