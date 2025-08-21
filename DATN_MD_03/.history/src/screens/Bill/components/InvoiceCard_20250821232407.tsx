import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
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
    if (!dateString) {return '';}
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        
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
        
        return defaultValue;
    }
};

// Map status to color
const getStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return Colors.limeGreen; // Xanh lá đậm
        case 'pending':
            return '#17A2B8'; // Xanh dương
        case 'pending_confirmation':
            return '#007BFF'; // Xanh dương đậm (đã đổi từ vàng)
        case 'issued':
            return '#FFC107'; // Vàng (đã đổi từ xanh dương đậm)
        case 'overdue':
            return '#DC3545'; // Đỏ
        case 'draft':
            return '#6C757D'; // Xám
        case 'canceled':
            return '#343A40'; // Đen xám
        default:
            return Colors.mediumGray;
    }
};

// Map status to appropriate text color for contrast
const getStatusTextColor = (status: string) => {
    switch (status) {
        case 'issued': // yellow background
            return Colors.black;
        case 'paid': // bright lime
            return Colors.black;
        case 'draft':
        case 'pending':
        case 'pending_confirmation':
        case 'overdue':
        case 'canceled':
        default:
            return Colors.white;
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
            return 'Chưa thanh toán';
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
    if (!period) {return 'N/A';}

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
        if (tenant.fullName) {return tenant.fullName;}

        // Nếu có name thì sử dụng
        if (tenant.name) {return tenant.name;}

        // Nếu có displayName thì sử dụng
        if (tenant.displayName) {return tenant.displayName;}

        // Nếu có email hoặc phone
        if (tenant.email) {return tenant.email;}
        if (tenant.phone) {return tenant.phone;}
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
        if (invoice.roomId.roomNumber) {return invoice.roomId.roomNumber;}

        // Hoặc sử dụng name nếu có
        if (invoice.roomId.name) {return invoice.roomId.name;}

        // Hoặc sử dụng title nếu có
        if (invoice.roomId.title) {return invoice.roomId.title;}
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
    const isOverdue = invoice.status === 'overdue';
    const isIssued = invoice.status === 'issued';

    // Permissions: landlords can edit if draft or overdue; delete if draft or issued
    const canEdit = isLandlord && (isDraft || isOverdue);
    const canDelete = isLandlord && (isDraft || isIssued);
    const showActions = canEdit || canDelete;

    // Stop propagation to prevent triggering the card's onPress when clicking buttons
    const handleEdit = (e: any) => {
        e.stopPropagation();
        if (onEdit) {onEdit(invoice);}
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        if (onDelete) {onDelete(invoice);}
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={styles.container}
                onPress={() => onPress(invoice)}
                activeOpacity={0.8}>
                
                {/* Header với mã phòng và status */}
                <View style={styles.header}>
                    <Text style={styles.roomCode}>{getRoomInfo(invoice)}</Text>
                    <View style={styles.headerRight}>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: getStatusColor(invoice.status),
                                },
                            ]}>
                            <Text style={[
                                styles.statusText,
                                { color: getStatusTextColor(invoice.status) },
                            ]}>
                                {getStatusText(invoice.status)}
                            </Text>
                        </View>
                        {invoice.isRoommate && (
                            <View style={styles.roommateBadgeInline}>
                                <Image
                                    source={require('../../../assets/icons/icon_person.png')}
                                    style={styles.roommateIcon}
                                />
                                <Text style={styles.roommateText}>Người ở cùng</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Địa chỉ phòng */}
                <Text style={styles.address}>
                    {invoice.contractId && typeof invoice.contractId === 'object' && 
                     invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomAddress 
                     ? invoice.contractId.contractInfo.roomAddress 
                     : 'Số 95, Phố Nguyễn Đình Thi, Thụy Khuê, Tây Hồ...'}
                </Text>

                {/* Thông tin hóa đơn */}
                <View style={styles.invoiceInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã hóa đơn:</Text>
                        <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Người thuê:</Text>
                        <Text style={styles.infoValue}>{getTenantName(invoice)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày tạo:</Text>
                        <Text style={styles.infoValue}>
                            {invoice.issueDate 
                                ? formatDateDisplay(invoice.issueDate)
                                : invoice.createdAt 
                                    ? formatDateDisplay(invoice.createdAt)
                                    : formatDateDisplay(new Date().toISOString())
                            }
                        </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hạn thanh toán:</Text>
                        <Text style={styles.infoValue}>{formatDateDisplay(invoice.dueDate)}</Text>
                    </View>
                    
                    {invoice.status === 'paid' && invoice.paymentDate && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Ngày thanh toán:</Text>
                            <Text style={styles.infoValue}>{formatDateDisplay(invoice.paymentDate)}</Text>
                        </View>
                    )}
                </View>

                {/* Action buttons for landlords, conditional by status */}
                {showActions && (
                    <View style={styles.actionContainer}>
                        {canEdit && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleEdit}
                            >
                                <Text style={styles.editButtonText}>Chỉnh sửa hóa đơn</Text>
                            </TouchableOpacity>
                        )}
                        {canDelete && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteButtonText}>Xóa hóa đơn</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>

            {/* Footer màu xanh với kỳ hóa đơn và số tiền */}
            <View style={styles.greenFooter}>
                <Text style={styles.periodText}>{getInvoiceTitle(invoice)}</Text>
                <Text style={styles.amountText}>
                    {invoice.totalAmount.toLocaleString('vi-VN')}VNĐ
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        // enable outer shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    container: {
        padding: 20,
        marginBottom: -20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roomCode: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 3,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 25,
        minWidth: 65,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.white,
        textAlign: 'center',
    },
    address: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 8,
        lineHeight: 22,
    },
    invoiceInfo: {
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.black,
        flex: 1,
        marginRight: 6,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 32,
        marginBottom: 8,
        paddingHorizontal: 2,
        height: 40,
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 25,
        backgroundColor: Colors.limeGreen,
        minWidth: 130,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    editButtonText: {
        color: Colors.black,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: Colors.red,
    },
    deleteButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
    },
    roommateBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(139, 195, 74, 0.15)', // nhẹ, cùng tông primaryGreen
        borderColor: 'rgba(139, 195, 74, 0.35)',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    roommateBadgeInline: {
        backgroundColor: 'rgba(139, 195, 74, 0.15)',
        borderColor: 'rgba(139, 195, 74, 0.35)',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    roommateText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primaryGreen,
    },
    roommateIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
        tintColor: Colors.primaryGreen,
    },
    greenFooter: {
        backgroundColor: Colors.limeGreen,
        padding: 13,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    periodText: {
        fontSize: 15,
        color: Colors.black,
        fontWeight: 'bold',
    },
    amountText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: Colors.black,
    },
});

export default InvoiceCard;
