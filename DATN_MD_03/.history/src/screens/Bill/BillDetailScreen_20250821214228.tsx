import React, { useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Platform,
    UIManager,
    LayoutAnimation,
    StatusBar,
} from 'react-native';
import LoadingAnimationWrapper from '../../components/LoadingAnimationWrapper';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import {
    fetchInvoiceDetails,
    confirmPayment,
    resetConfirmPaymentState,
    completeInvoice,
    resetCompleteInvoiceState,
    markAsPaid,
    resetMarkAsPaidState,
} from '../../store/slices/billSlice';
import { RootStackParamList } from '../../types/route';
import { SCREEN, scale, verticalScale, responsiveSpacing } from '../../utils/responsive';
import { Invoice, InvoiceItem } from '../../types/Bill';
import { Role } from '../../types/User';
import PaymentMethodModal from './components/PaymentMethodModal';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';

type BillDetailRouteProps = RouteProp<RootStackParamList, 'BillDetails'>;

const BillDetailScreen = () => {
    const route = useRoute<BillDetailRouteProps>();
    const { invoiceId } = route.params;
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { token, user } = useAppSelector(state => state.auth);
    const isFocused = useIsFocused();
    
    // Sử dụng CustomAlertModal hook
    const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
    
    const {
        selectedInvoice,
        loading,
        error,
        confirmPaymentLoading,
        confirmPaymentSuccess,
        confirmPaymentError,
        markAsPaidLoading,
        markAsPaidSuccess,
        markAsPaidError,
        completeInvoiceLoading,
        completeInvoiceSuccess,
        completeInvoiceError,
    } = useAppSelector(state => state.bill);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    // Kiểm tra xem người dùng có phải là chủ trọ không
    const isLandlord = user?.role === 'chuTro';

    // Bật LayoutAnimation cho Android để có hiệu ứng mở/đóng mượt mà
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const toggleItemExpanded = (key: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedKey(prev => (prev === key ? null : key));
    };

    useEffect(() => {
        if (token && invoiceId) {
            dispatch(fetchInvoiceDetails({ token, invoiceId }));
        }

        // Reset trạng thái khi component mount
        return () => {
            dispatch(resetConfirmPaymentState());
            dispatch(resetCompleteInvoiceState());
            dispatch(resetMarkAsPaidState());
        };
    }, [dispatch, token, invoiceId]);

    // Hiển thị thông báo khi đánh dấu đã thanh toán thành công hoặc thất bại
    useEffect(() => {
        if (confirmPaymentSuccess) {

            showSuccess("Đã xác nhận thanh toán hóa đơn thành công!");
            // Reload invoice details after successful confirmation
            if (token && invoiceId) {
                dispatch(fetchInvoiceDetails({ token, invoiceId }));
            }

            dispatch(resetConfirmPaymentState());
        }

        if (confirmPaymentError) {

            showError(`Không thể xác nhận thanh toán hóa đơn: ${confirmPaymentError}`);

            dispatch(resetConfirmPaymentState());
        }
    }, [confirmPaymentSuccess, confirmPaymentError, dispatch, token, invoiceId]);

    // Hiển thị thông báo khi người thuê thanh toán thành công hoặc thất bại
    useEffect(() => {
        if (markAsPaidSuccess) {

            showSuccess("Đã thanh toán hóa đơn thành công!");
            // Reload invoice details after successful payment
            if (token && invoiceId) {
                dispatch(fetchInvoiceDetails({ token, invoiceId }));
            }

            dispatch(resetMarkAsPaidState());
            setPaymentModalVisible(false);
        }

        if (markAsPaidError) {

            showError(`Không thể thanh toán hóa đơn: ${markAsPaidError}`);

            dispatch(resetMarkAsPaidState());
        }
    }, [markAsPaidSuccess, markAsPaidError, dispatch, token, invoiceId]);

    // Hiển thị thông báo khi hoàn thành hóa đơn thành công hoặc thất bại
    useEffect(() => {
        if (completeInvoiceSuccess) {

            showSuccess("Đã hoàn thành hóa đơn thành công!");

            dispatch(resetCompleteInvoiceState());
        }

        if (completeInvoiceError) {

            showError(`Không thể hoàn thành hóa đơn: ${completeInvoiceError}`);

            dispatch(resetCompleteInvoiceState());
        }
    }, [completeInvoiceSuccess, completeInvoiceError, dispatch]);

    // Format date function
    const formatDate = (dateString?: string) => {
        if (!dateString) {return 'N/A';}
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Format period
    const formatPeriod = (period: any) => {
        if (!period) {return 'N/A';}
        if (typeof period === 'string') {
            return formatDate(period).substring(3); // Return MM/YYYY
        }
        if (period.month && period.year) {
            return `${period.month.toString().padStart(2, '0')}/${period.year}`;
        }
        return 'N/A';
    };

    // Tính ngày bắt đầu tính hóa đơn từ dữ liệu sẵn có
    // const getInvoiceStartDate = (invoice?: Invoice) => {
    //     if (!invoice) {return 'N/A';}
    //     // Ưu tiên ngày phát hành nếu có
    //     if (invoice.issueDate) {
    //         return formatDate(invoice.issueDate);
    //     }
    //     // Fallback sang ngày tạo
    //     if ((invoice as any).createdAt) {
    //         return formatDate((invoice as any).createdAt);
    //     }
    //     // Fallback cuối: từ kỳ hóa đơn
    //     const p: any = invoice.period;
    //     if (p) {
    //         if (typeof p === 'string') {
    //             return formatDate(p);
    //         }
    //         if (typeof p === 'object' && 'month' in p && 'year' in p) {
    //             const d = new Date(p.year, p.month - 1, 1);
    //             return formatDate(d.toISOString());
    //         }
    //     }
    //     return 'N/A';
    // };

    // Get payment status text
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

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
        case 'paid':
            return Colors.limeGreen;
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

    // Get category text
    const getCategoryText = (category: string) => {
        switch (category) {
            case 'rent':
                return 'Tiền phòng';
            case 'utility':
                return 'Tiền điện';
            case 'service':
                return 'Phí dịch vụ';
            case 'maintenance':
                return 'Phí đỗ xe';
            default:
                return 'Khác';
        }
    };

    // Xử lý xác nhận thanh toán
    const handleConfirmPayment = () => {

        showConfirm(
            "Bạn có chắc chắn muốn xác nhận hoá đơn này đã thanh toán?",
            () => {
                if (token && invoiceId) {
                    dispatch(confirmPayment({ token, invoiceId }));
                }
            },
            "Xác nhận thanh toán"

        );
    };

    // Xử lý hoàn thành hóa đơn
    const handleCompleteInvoice = () => {

        showConfirm(
            "Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã hoàn thành?",
            () => {
                if (token && invoiceId) {
                    dispatch(completeInvoice({ token, invoiceId }));
                }
            },
            "Hoàn thành hóa đơn"

        );
    };

    // Xử lý thanh toán
    const handlePayment = () => {
        setPaymentModalVisible(true);
    };

    // Xử lý khi hóa đơn đã quá hạn
    const handleOverduePress = () => {
        showAlert({
            title: 'Quá hạn',
            message: 'Hóa đơn này đã quá hạn. Vui lòng liên hệ chủ trọ để được cập nhật và thanh toán.',
            type: 'warning',
            autoHide: false,
        });
    };

    // Xử lý chọn phương thức thanh toán
    const handleSelectPaymentMethod = (paymentMethod: string) => {
        if (token && invoiceId) {
            dispatch(markAsPaid({ token, invoiceId, paymentMethod }));
        }
    };

    const renderHeader = () => {
        const title = selectedInvoice ? `Hóa đơn tháng ${formatPeriod(selectedInvoice.period)}` : 'Chi tiết hóa đơn';
        const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
        return (
            <View style={{ paddingTop: statusBarHeight, alignItems: 'center', marginBottom: 30 }}>
                <UIHeader
                    title={title}
                    iconLeft={'back'}
                    onPressLeft={() => navigation.goBack()}
                />
            </View>
        );
    };

    const renderInvoiceInfo = () => {
        if (!selectedInvoice) {return null;}

        const roomInfo = selectedInvoice.contractId?.contractInfo || {};
        const tenant = selectedInvoice.tenantId;

        // Helper function to get tenant name
        const getTenantName = () => {
            // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
            if (selectedInvoice.contractId && typeof selectedInvoice.contractId === 'object' &&
                selectedInvoice.contractId.contractInfo) {
                const tenantName = selectedInvoice.contractId.contractInfo.tenantName;
                if (tenantName) {
                    return tenantName;
                }
            }

            // Nếu tenantId là object có chứa thông tin
            const tenant = selectedInvoice.tenantId;
            if (tenant && typeof tenant === 'object') {
                if (tenant.fullName) {return tenant.fullName;}
                if (tenant.name) {return tenant.name;}
                if (tenant.displayName) {return tenant.displayName;}
                if (tenant.firstName && tenant.lastName) {return `${tenant.firstName} ${tenant.lastName}`;}
                if (tenant.firstName) {return tenant.firstName;}
                if (tenant.lastName) {return tenant.lastName;}
                if (tenant.email) {return tenant.email;}
                if (tenant.phone) {return tenant.phone;}
            }

            // Nếu tenantId là string, tham chiếu đến hợp đồng để lấy thông tin
            if (tenant && typeof tenant === 'string' && selectedInvoice.contractId &&
                typeof selectedInvoice.contractId === 'object' && selectedInvoice.contractId.contractInfo) {
                return selectedInvoice.contractId.contractInfo.tenantName;
            }

            // Fallback
            return 'Người thuê';
        };

        // Helper function to get room info
        const getRoomInfo = () => {
            // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
            if (selectedInvoice.contractId && typeof selectedInvoice.contractId === 'object' &&
                selectedInvoice.contractId.contractInfo) {
                const roomNumber = selectedInvoice.contractId.contractInfo.roomNumber;
                if (roomNumber) {
                    return roomNumber;
                }
            }

            // Kiểm tra nếu roomId là object
            if (selectedInvoice.roomId && typeof selectedInvoice.roomId === 'object') {
                if (selectedInvoice.roomId.roomNumber) {return selectedInvoice.roomId.roomNumber;}
                if (selectedInvoice.roomId.name) {return selectedInvoice.roomId.name;}
                if (selectedInvoice.roomId.title) {return selectedInvoice.roomId.title;}
            }

            // Nếu roomId là string, tham chiếu đến hợp đồng để lấy thông tin
            if (selectedInvoice.roomId && typeof selectedInvoice.roomId === 'string' && selectedInvoice.contractId &&
                typeof selectedInvoice.contractId === 'object' && selectedInvoice.contractId.contractInfo) {
                return selectedInvoice.contractId.contractInfo.roomNumber;
            }

            // Fallback
            return 'Phòng cho thuê';
        };

        return (
            <View style={styles.invoiceSummaryCard}>
                <View style={styles.roomNumberRow}>
                    <Text style={styles.roomNumber}>{getRoomInfo()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedInvoice.status) }]}>
                        <Text style={styles.statusBadgeText}>{getStatusText(selectedInvoice.status)}</Text>
                    </View>
                </View>
                
                <View style={styles.invoiceDetailsGrid}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mã hóa đơn</Text>
                        <Text style={styles.detailValue}>{selectedInvoice.invoiceNumber}</Text>
                    </View>
                    {/* <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ngày bắt đầu</Text>
                        <Text style={styles.detailValue}>{getInvoiceStartDate(selectedInvoice)}</Text>
                    </View> */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Người thuê</Text>
                        <Text style={styles.detailValue}>{getTenantName()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ngày phát hành</Text>
                        <Text style={styles.detailValue}>
                            {selectedInvoice.issueDate ? formatDate(selectedInvoice.issueDate) : 'Chưa phát hành'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Hạn thanh toán</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedInvoice.dueDate)}</Text>
                    </View>
                    {selectedInvoice.status === 'paid' && selectedInvoice.paymentDate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ngày thanh toán</Text>
                            <Text style={styles.detailValue}>{formatDate(selectedInvoice.paymentDate)}</Text>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Địa chỉ</Text>
                        <Text style={styles.detailValue}>
                            {selectedInvoice.contractId?.contractInfo?.roomAddress || 'Không có địa chỉ'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderInvoiceItems = () => {
        if (!selectedInvoice || !selectedInvoice.items || selectedInvoice.items.length === 0) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
                    <Text style={styles.emptyMessage}>Không có thông tin chi tiết hóa đơn</Text>
                </View>
            );
        }

        const items = selectedInvoice.items;

        const renderItemDetails = (item: InvoiceItem, align: 'left' | 'right') => {
            const rows: { label: string; value: string }[] = [];
            if (item.description) {rows.push({ label: 'Mô tả', value: item.description });}
            if (item.quantity > 0) {
                rows.push({ label: 'Số lượng', value: `${item.quantity}` });
            }
            rows.push({ label: 'Đơn giá', value: `${item.unitPrice.toLocaleString('vi-VN')}VND${item.category === 'rent' ? '/tháng' : ''}` });
            if (item.isPerPerson) {
                rows.push({ label: 'Tính theo người', value: `${item.personCount || 1} người` });
            }
            if (item.previousReading !== undefined) {
                rows.push({ label: 'Chỉ số cũ', value: `${item.previousReading}` });
            }
            if (item.currentReading !== undefined) {
                rows.push({ label: 'Chỉ số mới', value: `${item.currentReading}` });
            }
            // Thêm dòng hiển thị số đã sử dụng
            if (item.previousReading !== undefined && item.currentReading !== undefined) {
                const usage = item.currentReading - item.previousReading;
                rows.push({ label: 'Số đã sử dụng', value: `${usage}` });
            }
            

            const sideStyle = align === 'left' ? styles.expandedDetailConnectedLeft : styles.expandedDetailConnectedRight;

            return (
                <View style={[styles.expandedDetailContainer, sideStyle]}>
                    <Text style={styles.expandedDetailTitle}>Chi tiết {item.name || getCategoryText(item.category)}</Text>
                    {rows.map((row, idx) => (
                        <View key={idx} style={styles.itemDetailRow}>
                            <Text style={styles.itemDetailLabel}>{row.label}</Text>
                            <Text style={styles.itemDetailValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>
            );
        };

        return (
            <View style={styles.itemsContainer}>
                <View style={styles.itemsGrid}>
                    {(() => {
                        const rows: React.ReactNode[] = [];
                        for (let i = 0; i < items.length; i += 2) {
                            const left = items[i];
                            const right = items[i + 1];
                            const leftKey = String(left._id || i);
                            const rightKey = right ? String(right._id || i + 1) : null;
                            const isLeftExpanded = expandedKey === leftKey;
                            const isRightExpanded = rightKey ? expandedKey === rightKey : false;
                            rows.push(
                                <View key={`row-${i}`} style={[styles.itemsRow, (isLeftExpanded || isRightExpanded) && styles.itemsRowExpanded]}>
                                    <TouchableOpacity style={[styles.itemCard, isLeftExpanded && styles.itemCardExpanded, isLeftExpanded && styles.itemCardExpandedLeft]} activeOpacity={0.85} onPress={() => toggleItemExpanded(leftKey)}>
                                        <View style={styles.itemHeaderRow}>
                                            <View style={styles.itemIconContainer}>
                                                <Image source={getItemIcon(left)} style={styles.itemIcon} resizeMode="contain" />
                                            </View>
                                            <Text style={styles.itemCardName}>{left.name || getCategoryText(left.category)}</Text>
                                        </View>
                                        <Text style={styles.itemCardAmount}>{left.amount.toLocaleString('vi-VN')}VND</Text>
                                    </TouchableOpacity>
                                    {right && (
                                        <TouchableOpacity style={[styles.itemCard, isRightExpanded && styles.itemCardExpanded, isRightExpanded && styles.itemCardExpandedRight]} activeOpacity={0.85} onPress={() => rightKey && toggleItemExpanded(rightKey)}>
                                            <View style={styles.itemHeaderRow}>
                                                <View style={styles.itemIconContainer}>
                                                    <Image source={getItemIcon(right)} style={styles.itemIcon} resizeMode="contain" />
                                                </View>
                                                <Text style={styles.itemCardName}>{right.name || getCategoryText(right.category)}</Text>
                                            </View>
                                            <Text style={styles.itemCardAmount}>{right.amount.toLocaleString('vi-VN')}VND</Text>
                                        </TouchableOpacity>
                                    )}
                                    {!right && <View style={{ width: '49%' }} />}
                                </View>
                            );
                            if (isLeftExpanded) {
                                rows.push(<View key={`detail-${leftKey}`}>{renderItemDetails(left, 'left')}</View>);
                            } else if (isRightExpanded && right) {
                                rows.push(<View key={`detail-${rightKey}`}>{renderItemDetails(right, 'right')}</View>);
                            }
                        }
                        return rows;
                    })()}
                </View>
            </View>
        );
    };

    // Hàm helper để lấy icon cho từng loại item
    const getItemIcon = (item: InvoiceItem) => {
        const itemName = item.name?.toLowerCase() || '';
        const category = item.category;
        
        // Kiểm tra tên item cụ thể trước
        if (itemName.includes('điện') || itemName.includes('electricity')) {
            return require('../../assets/icons/icon_electrical.png');
        }
        if (itemName.includes('nước') || itemName.includes('water')) {
            return require('../../assets/icons/icon_tien_nuoc.png');
        }
        if (itemName.includes('wifi') || itemName.includes('internet')) {
            return require('../../assets/icons/icon_wifi.png');
        }
        if (itemName.includes('đỗ xe') || itemName.includes('parking') || itemName.includes('xe')) {
            return require('../../assets/icons/icon_thang_may.png');
        }
        if (itemName.includes('vệ sinh') || itemName.includes('sanitation')) {
            return require('../../assets/icons/icon_ve_sinh.png');
        }
        if (itemName.includes('điều hòa') || itemName.includes('air')) {
            return require('../../assets/icons/icon_dieu_hoa.png');
        }
        if (itemName.includes('tủ lạnh') || itemName.includes('fridge')) {
            return require('../../assets/icons/icon_tu_lanh.png');
        }
        if (itemName.includes('máy giặt') || itemName.includes('washing')) {
            return require('../../assets/icons/icon_may_giat.png');
        }
        if (itemName.includes('bàn ghế') || itemName.includes('table')) {
            return require('../../assets/icons/icon_table_chair_default.png');
        }
        if (itemName.includes('tủ quần áo') || itemName.includes('wardrobe')) {
            return require('../../assets/icons/icon_tu_quan_ao.png');
        }
        if (itemName.includes('sofa')) {
            return require('../../assets/icons/icon_sofa.png');
        }
        if (itemName.includes('quạt') || itemName.includes('fan')) {
            return require('../../assets/icons/icon_quat_tran.png');
        }
        if (itemName.includes('gương') || itemName.includes('mirror')) {
            return require('../../assets/icons/icon_guong.png');
        }
        if (itemName.includes('bình nóng lạnh') || itemName.includes('water heater')) {
            return require('../../assets/icons/icon_nong_lanh.png');
        }
        if (itemName.includes('kệ bếp') || itemName.includes('kitchen')) {
            return require('../../assets/icons/icon_ke_bep.png');
        }
        if (itemName.includes('giường') || itemName.includes('bed')) {
            return require('../../assets/icons/icon_giuong_ngu.png');
        }
        if (itemName.includes('chăn') || itemName.includes('ga') || itemName.includes('đệm')) {
            return require('../../assets/icons/icon_chan_ga_goi.png');
        }
        if (itemName.includes('rèm') || itemName.includes('curtain')) {
            return require('../../assets/icons/icon_rem_cua.png');
        }
        if (itemName.includes('đồ gia dụng') || itemName.includes('appliance')) {
            return require('../../assets/icons/icon_do_gia_dung_default.png');
        }
        
        // Fallback theo category
        switch (category) {
            case 'rent':
                return require('../../assets/icons/icon_room.png');
            case 'utility':
                return require('../../assets/icons/icon_electrical.png');
            case 'service':
                return require('../../assets/icons/icon_ve_sinh.png');
            case 'maintenance':
                return require('../../assets/icons/icon_thang_may.png');
            default:
                return require('../../assets/icons/icon_room.png');
        }
    };

    const renderSummary = () => {
        if (!selectedInvoice) {return null;}

        return (
            <View style={styles.totalAmountSection}>
                <View style={styles.totalAmountContainer}>
                    <Text style={styles.totalAmountLabel}>Tổng tiền</Text>
                    <Text style={styles.totalAmountValue}>
                        {selectedInvoice.totalAmount.toLocaleString('vi-VN')}VND
                    </Text>
                </View>
            </View>
        );
    };

    if (isFocused && loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <LoadingAnimationWrapper 
                    visible={true}
                    message="Đang tải thông tin hóa đơn..."
                    size="large"
                />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Đã xảy ra lỗi khi tải thông tin hóa đơn: {error}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            if (token && invoiceId) {
                                dispatch(fetchInvoiceDetails({ token, invoiceId }));
                            }
                        }}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!selectedInvoice) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không tìm thấy thông tin hóa đơn</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            {isFocused && loading ? (
                <LoadingAnimationWrapper 
                    visible={true}
                    message="Đang tải thông tin hóa đơn..."
                    size="large"
                />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            if (token && invoiceId) {
                                dispatch(fetchInvoiceDetails({ token, invoiceId }));
                            }
                        }}
                    >
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : selectedInvoice ? (
                <>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {renderInvoiceInfo()}
                        {renderInvoiceItems()}
                        {renderSummary()}
                    </ScrollView>

                    {/* Hiển thị nút thanh toán nếu là người thuê và hóa đơn chưa thanh toán hoặc quá hạn */}
                    {!isLandlord && (selectedInvoice.status === 'issued' || selectedInvoice.status === 'overdue') && (
                        <View style={styles.paymentButtonContainer}>
                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={selectedInvoice.status === 'overdue' ? handleOverduePress : handlePayment}
                                disabled={markAsPaidLoading}
                            >
                                {markAsPaidLoading && selectedInvoice.status !== 'overdue' ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.paymentButtonText}>
                                        {selectedInvoice.status === 'overdue' ? 'Quá hạn' : 'Xác nhận thanh toán'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Hiển thị nút xác nhận thanh toán nếu là chủ trọ và hóa đơn đang chờ xác nhận */}
                    {isLandlord && selectedInvoice.status === 'pending_confirmation' && (
                        <View style={styles.paymentButtonContainer}>
                            <TouchableOpacity
                                style={styles.paymentButton}
                                onPress={handleConfirmPayment}
                                disabled={confirmPaymentLoading}
                            >
                                {confirmPaymentLoading ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.paymentButtonText}>Xác nhận đã thanh toán</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}


                </>
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không tìm thấy thông tin hóa đơn</Text>
                </View>
            )}

            {/* Modal chọn phương thức thanh toán */}
            <PaymentMethodModal
                visible={paymentModalVisible}
                onClose={() => setPaymentModalVisible(false)}
                onSelectPaymentMethod={handleSelectPaymentMethod}
                isLoading={markAsPaidLoading}
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
    scrollContainer: {
        paddingBottom: verticalScale(30),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.mediumGray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: Colors.red,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: Colors.primaryGreen,
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    headerContainer: {
        marginTop: 20,
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
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
    },
    placeholderView: {
        width: 24,
    },
    section: {
        backgroundColor: Colors.white,
        marginTop: 10,
        paddingHorizontal: responsiveSpacing(20),
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: Colors.dearkOlive,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.mediumGray,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '500',
        flex: 1.5,
        textAlign: 'right',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1.5,
        textAlign: 'right',
    },
    emptyMessage: {
        textAlign: 'center',
        color: Colors.mediumGray,
        fontStyle: 'italic',
        marginVertical: 10,
    },
    itemContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 3,
    },
    itemCategory: {
        fontSize: 12,
        color: Colors.mediumGray,
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        overflow: 'hidden',
        textAlign: 'center',
    },
    itemDesc: {
        fontSize: 13,
        color: Colors.mediumGray,
        marginTop: 3,
    },
    itemDetails: {
        marginTop: 5,
    },
    itemDetail: {
        fontSize: 13,
        color: Colors.dearkOlive,
    },
    itemPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    itemAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    summarySection: {
        backgroundColor: Colors.white,
        marginTop: 10,
        paddingHorizontal: responsiveSpacing(20),
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.dearkOlive,
    },
    summaryValue: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '500',
    },
    summaryTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    payButton: {
        backgroundColor: Colors.primaryGreen,
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: Colors.primaryGreen,
        marginHorizontal: 15,
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    completeButton: {
        backgroundColor: Colors.darkGreen,
        marginHorizontal: 15,
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonContainer: {
        padding: 15,
        marginBottom: 15,
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: verticalScale(30),
    },
    // New styles for the new design
    invoiceSummaryCard: {
        backgroundColor: Colors.white,
        marginTop: 10,
        paddingHorizontal: responsiveSpacing(20),
        paddingVertical: 20,
        borderRadius: 8,
        marginHorizontal: 15,
    },
    roomNumberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    roomNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.white,
    },
    invoiceDetailsGrid: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.black,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '500',
        flex: 1.5,
        textAlign: 'right',
    },
    itemsContainer: {
        backgroundColor: 'transparent',
        marginTop: 10,
        paddingHorizontal: 15,
        
    },
    itemsGrid: {
        flexDirection: 'column',
        width: '100%',
    },
    itemsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 8,
    },
    itemsRowExpanded: {
        marginBottom: -1,
    },
    itemCard: {
        width: '49%',
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        alignItems: 'flex-start',
    },
    itemCardExpanded: {
        backgroundColor: '#BAFD00',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: -5,
        borderColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 0,
        paddingBottom: 25,
    },
    itemCardExpandedLeft: {
        borderBottomLeftRadius: 0,
    },
    itemCardExpandedRight: {
        borderBottomRightRadius: 0,
    },
    itemCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemInfoContainer: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    itemAmountContainer: {
        alignItems: 'flex-end',
    },
    itemIconContainer: {
        marginBottom: 0,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        alignSelf: 'flex-start',
        width: '100%',
        justifyContent: 'flex-start',
    },
    itemCardCategory: {
        fontSize: 12,
        color: Colors.mediumGray,
        marginTop: 2,
    },
    itemDescriptionContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    itemDescription: {
        fontSize: 13,
        color: Colors.mediumGray,
        fontStyle: 'italic',
    },
    itemIcon: {
        width: 20,
        height: 20,
    },
    itemCardName: {
        fontSize: 14,
        color: Colors.black,
        textAlign: 'left',
        fontWeight: '500',
        lineHeight: 20,
    },
    itemCardAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
    },
    itemDetailsBox: {
        width: '100%',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    itemDetailsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.dearkOlive,
        marginBottom: 8,
        textAlign: 'left',
    },
    itemDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemDetailLabel: {
        fontSize: 12,
        color: Colors.black,
        flex: 1,
        fontWeight: '500',
    },
    itemDetailValue: {
        fontSize: 12,
        color: Colors.black,
        fontWeight: '500',
        flex: 1.5,
        textAlign: 'right',
    },
    expandedDetailContainer: {
        width: '100%',
        backgroundColor: '#BAFD00',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderTopWidth: 0,
    },
    expandedDetailConnectedLeft: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginTop: -5,
        paddingTop: 0,
    },
    expandedDetailConnectedRight: {
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        marginTop: -5,
        paddingTop: 0,
    },
    expandedDetailTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.black,
        marginBottom: 10,
    },
    totalAmountSection: {
        backgroundColor: 'transparent',
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
        // marginHorizontal: 15,
    },
    totalAmountContainer: {
        backgroundColor: '#BAFD00',
        borderRadius: 10,
        padding: 20,
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: 80,
        width: '100%',
        marginHorizontal: 0,
    },
    totalAmountLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.black,
        marginBottom: 8,
        textAlign: 'left',
    },
    totalAmountValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'left',
    },
    paymentButtonContainer: {
        padding: 15,
        marginBottom: 15,
    },
    paymentButton: {
        backgroundColor: '#BAFD00',
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        width: '100%',
        marginHorizontal: 0,
    },
    paymentButtonText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default BillDetailScreen;

