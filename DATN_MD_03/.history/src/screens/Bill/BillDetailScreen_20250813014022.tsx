import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { SCREEN, scale, verticalScale } from '../../utils/responsive';
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
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);

    // Kiểm tra xem người dùng có phải là chủ trọ không
    const isLandlord = user?.role === 'chuTro';

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
                return Colors.darkGreen;
            case 'overdue':
                return Colors.red;
            case 'pending_confirmation':
                return Colors.primaryGreen;
            case 'issued':
                return Colors.mediumGray;
            default:
                return Colors.gray;
        }
    };

    // Get category text
    const getCategoryText = (category: string) => {
        switch (category) {
            case 'rent':
                return 'Tiền thuê';
            case 'utility':
                return 'Tiện ích';
            case 'service':
                return 'Dịch vụ';
            case 'maintenance':
                return 'Bảo trì';
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

    // Xử lý chọn phương thức thanh toán
    const handleSelectPaymentMethod = (paymentMethod: string) => {
        if (token && invoiceId) {
            dispatch(markAsPaid({ token, invoiceId, paymentMethod }));
        }
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/icons/icon_arrow_back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    {selectedInvoice ? `Hóa đơn tháng ${formatPeriod(selectedInvoice.period)}` : 'Chi tiết hóa đơn'}
                </Text>
                <View style={styles.placeholderView} />
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

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
                {items.map((item, index) => (
                    <View key={item._id || index} style={styles.itemContainer}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemCategory}>{getCategoryText(item.category)}</Text>
                        </View>
                        {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                        <View style={styles.itemDetails}>
                            {item.type === 'variable' && (
                                <Text style={styles.itemDetail}>
                                    Chỉ số: {item.previousReading || 0} → {item.currentReading || 0} (Sử dụng:{' '}
                                    {(item.currentReading || 0) - (item.previousReading || 0)})
                                </Text>
                            )}
                            <View style={styles.itemPriceRow}>
                                <Text style={styles.itemDetail}>
                                    {item.unitPrice.toLocaleString('vi-VN')} đ
                                    {item.isPerPerson && ` × ${item.personCount} người`}
                                    {item.type !== 'variable' && item.quantity > 1 && ` × ${item.quantity}`}
                                </Text>
                                <Text style={styles.itemAmount}>
                                    {item.amount.toLocaleString('vi-VN')} đ
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderSummary = () => {
        if (!selectedInvoice) {return null;}

        return (
            <View style={styles.summarySection}>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotal}>Tổng cộng:</Text>
                    <Text style={styles.summaryTotalValue}>
                        {selectedInvoice.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                </View>
                {selectedInvoice.paidAmount !== undefined && selectedInvoice.paidAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Đã thanh toán:</Text>
                        <Text style={[styles.summaryValue, { color: Colors.darkGreen }]}>
                            {selectedInvoice.paidAmount.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                )}
                {selectedInvoice.paidAmount !== undefined &&
                    selectedInvoice.paidAmount > 0 &&
                    selectedInvoice.paidAmount < selectedInvoice.totalAmount && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Còn lại:</Text>
                            <Text style={[styles.summaryValue, { color: Colors.red }]}>
                                {(
                                    selectedInvoice.totalAmount - selectedInvoice.paidAmount
                                ).toLocaleString('vi-VN')}{' '}
                                đ
                            </Text>
                        </View>
                    )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <LoadingOverlay 
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

            {loading ? (
                <LoadingOverlay 
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

                    {/* Hiển thị nút thanh toán nếu là người thuê và hóa đơn chưa thanh toán */}
                    {!isLandlord && selectedInvoice.status === 'issued' && (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={handlePayment}
                                disabled={markAsPaidLoading}
                            >
                                {markAsPaidLoading ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.payButtonText}>Thanh toán ngay</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Hiển thị nút xác nhận thanh toán nếu là chủ trọ và hóa đơn đang chờ xác nhận */}
                    {isLandlord && selectedInvoice.status === 'pending_confirmation' && (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmPayment}
                                disabled={confirmPaymentLoading}
                            >
                                {confirmPaymentLoading ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Xác nhận đã thanh toán</Text>
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
        fontWeight: '700',
        color: Colors.black,
        textAlign: 'center',
    },
    placeholderView: {
        width: 24,
    },
    section: {
        backgroundColor: Colors.white,
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
            },
            android: {
                elevation: 3,
            },
        }),
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
            },
            android: {
                elevation: 3,
            },
        }),
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
            },
            android: {
                elevation: 3,
            },
        }),
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
    paymentButton: {
        backgroundColor: Colors.limeGreen,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    paymentButtonText: {
        color: Colors.dearkOlive,
        fontWeight: 'bold',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: verticalScale(30),
    },
});

export default BillDetailScreen;
