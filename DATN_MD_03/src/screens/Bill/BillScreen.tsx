import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Modal,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoices } from '../../store/slices/billSlice';
import { Invoice } from '../../types/Bill';
import { Colors } from '../../theme/color';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SCREEN, scale, verticalScale } from '../../utils/responsive';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { Icons } from '../../assets/icons';
import { InvoiceCard, ContractSelectionModal, InvoiceCreationModal } from './components';
import { Contract } from '../../types/Contract';
import { deleteInvoice } from '../../store/services/billService';

// Kiểu dữ liệu cho các bộ lọc
type FilterType = 'status' | 'room' | 'tenant' | 'sort';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

type BillScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;

const BillScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<BillScreenNavigationProp>();
    const { user, token } = useAppSelector(state => state.auth);
    const { invoices, loading, error, pagination } = useAppSelector(
        state => state.bill,
    );
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
        undefined,
    );

    // Kiểm tra xem người dùng có phải là chủ trọ không
    const isLandlord = user?.role === 'chuTro';

    // Thêm state cho bộ lọc mới
    const [activeFilter, setActiveFilter] = useState<FilterType>('status');
    const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined);
    const [selectedTenant, setSelectedTenant] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);

    // State cho modal chọn hợp đồng
    const [contractModalVisible, setContractModalVisible] = useState(false);

    // State cho modal tạo hóa đơn
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // Lấy danh sách các phòng duy nhất từ hóa đơn
    const uniqueRooms = React.useMemo(() => {
        const roomsMap = new Map();
        invoices.forEach(invoice => {
            // Kiểm tra nếu có thông tin phòng trong hợp đồng
            if (invoice.contractId && typeof invoice.contractId === 'object' &&
                invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomNumber) {
                const roomInfo = invoice.contractId.contractInfo;
                const roomKey = roomInfo.roomNumber;
                const roomName = roomInfo.roomAddress
                    ? `${roomInfo.roomNumber} - ${roomInfo.roomAddress}`
                    : roomInfo.roomNumber;
                roomsMap.set(roomKey, { id: roomKey, name: roomName });
            }
            // Hoặc kiểm tra nếu có thông tin phòng trực tiếp
            else if (invoice.roomId && typeof invoice.roomId === 'object' && invoice.roomId._id) {
                const roomId = invoice.roomId._id;
                const roomName = invoice.roomId.name || invoice.roomId.roomNumber || `Phòng: ${roomId}`;
                roomsMap.set(roomId, { id: roomId, name: roomName });
            }
            // Nếu roomId là string nhưng có contractId, lấy thông tin từ contractId
            else if (invoice.roomId && typeof invoice.roomId === 'string' &&
                invoice.contractId && typeof invoice.contractId === 'object' &&
                invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomNumber) {
                const roomInfo = invoice.contractId.contractInfo;
                const roomKey = invoice.roomId; // Sử dụng roomId làm key
                const roomName = roomInfo.roomAddress
                    ? `${roomInfo.roomNumber} - ${roomInfo.roomAddress}`
                    : roomInfo.roomNumber;
                roomsMap.set(roomKey, { id: roomKey, name: roomName });
            }
        });
        return Array.from(roomsMap.values());
    }, [invoices]);

    // Lấy danh sách các người thuê duy nhất từ hóa đơn
    const uniqueTenants = React.useMemo(() => {
        const tenantsMap = new Map();
        invoices.forEach(invoice => {
            // Nếu tenantId là object
            if (invoice.tenantId && typeof invoice.tenantId === 'object') {
                const tenant = invoice.tenantId;
                if (tenant._id) {
                    const tenantName = tenant.fullName || tenant.email || tenant.phone || `ID: ${tenant._id}`;
                    tenantsMap.set(tenant._id, { id: tenant._id, name: tenantName });
                }
            }
            // Nếu tenantId là string nhưng có contractId, lấy thông tin từ contractId
            else if (invoice.tenantId && typeof invoice.tenantId === 'string' &&
                invoice.contractId && typeof invoice.contractId === 'object' &&
                invoice.contractId.contractInfo && invoice.contractId.contractInfo.tenantName) {
                const tenantInfo = invoice.contractId.contractInfo;
                const tenantKey = invoice.tenantId; // Sử dụng tenantId làm key
                const tenantName = tenantInfo.tenantName;
                tenantsMap.set(tenantKey, { id: tenantKey, name: tenantName });
            }
        });
        return Array.from(tenantsMap.values());
    }, [invoices]);

    // Cập nhật localInvoices khi có thay đổi về bộ lọc
    useEffect(() => {
        if (invoices.length > 0) {
            // Tạo bản sao của mảng invoices để không ảnh hưởng đến dữ liệu gốc
            let filteredInvoices = [...invoices];

            // Ẩn hóa đơn có trạng thái nháp nếu không phải là chủ trọ
            if (!isLandlord) {
                filteredInvoices = filteredInvoices.filter(invoice => invoice.status !== 'draft');
            }

            // Lọc theo trạng thái
            if (selectedStatus) {
                filteredInvoices = filteredInvoices.filter(
                    invoice => invoice.status === selectedStatus
                );
            }

            // Lọc theo phòng
            if (selectedRoom) {
                filteredInvoices = filteredInvoices.filter(invoice => {
                    // Nếu có thông tin phòng trong contractId
                    if (invoice.contractId && typeof invoice.contractId === 'object' &&
                        invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomNumber) {
                        return invoice.contractId.contractInfo.roomNumber === selectedRoom;
                    }
                    // Nếu roomId là object
                    else if (invoice.roomId && typeof invoice.roomId === 'object' && invoice.roomId._id) {
                        return invoice.roomId._id === selectedRoom;
                    }
                    // Nếu roomId là string
                    else if (invoice.roomId && typeof invoice.roomId === 'string') {
                        return invoice.roomId === selectedRoom;
                    }
                    return false;
                });
            }

            // Lọc theo người thuê
            if (selectedTenant) {
                filteredInvoices = filteredInvoices.filter(invoice => {
                    // Nếu tenantId là object
                    if (invoice.tenantId && typeof invoice.tenantId === 'object' && invoice.tenantId._id) {
                        return invoice.tenantId._id === selectedTenant;
                    }
                    // Nếu tenantId là string
                    else if (invoice.tenantId && typeof invoice.tenantId === 'string') {
                        return invoice.tenantId === selectedTenant;
                    }
                    return false;
                });
            }

            // Sắp xếp theo thứ tự đã chọn
            filteredInvoices.sort((a, b) => {
                switch (sortOrder) {
                    case 'newest':
                        // Sắp xếp theo ngày tạo mới nhất (giảm dần)
                        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
                    case 'oldest':
                        // Sắp xếp theo ngày tạo cũ nhất (tăng dần)
                        return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
                    case 'highest':
                        // Sắp xếp theo tổng tiền cao nhất
                        return b.totalAmount - a.totalAmount;
                    case 'lowest':
                        // Sắp xếp theo tổng tiền thấp nhất
                        return a.totalAmount - b.totalAmount;
                    default:
                        return 0;
                }
            });

            setLocalInvoices(filteredInvoices);
        } else {
            setLocalInvoices([]);
        }
    }, [invoices, selectedStatus, selectedRoom, selectedTenant, sortOrder, isLandlord]);

    // Hàm để tải dữ liệu hóa đơn
    const loadInvoices = useCallback((page = 1, shouldRefresh = false) => {
        if (token) {
            // Gọi action để lấy danh sách hóa đơn
            dispatch(fetchInvoices({
                token,
                page,
                limit: 10,
                status: selectedStatus,
            }));
        } else {
            // Hiển thị thông báo lỗi nếu không có token
            Alert.alert('Lỗi', 'Bạn cần đăng nhập để xem hóa đơn');
        }
    }, [dispatch, token, selectedStatus]);

    useEffect(() => {
        loadInvoices();
    }, [dispatch, token, selectedStatus]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadInvoices();
        setTimeout(() => setRefreshing(false), 1000); // Ensure refreshing state changes
    };

    const handleLoadMore = () => {
        if (pagination.page < pagination.totalPages && !loading && token) {
            dispatch(
                fetchInvoices({
                    token,
                    page: pagination.page + 1,
                    limit: pagination.limit,
                    status: selectedStatus,
                }),
            );
        }
    };

    const handleInvoicePress = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        const invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            Alert.alert('Lỗi', 'Không thể mở chi tiết hóa đơn này');
            return;
        }

        // Điều hướng đến màn hình chi tiết
        navigation.navigate('BillDetails', { invoiceId });
    };

    // Xử lý thay đổi loại bộ lọc (tab)
    const handleFilterTypeChange = (filterType: FilterType) => {
        setActiveFilter(filterType);
    };

    // Render các tab bộ lọc
    const renderFilterTabs = () => {
        const tabs: { id: FilterType; label: string }[] = [
            { id: 'status', label: 'Trạng thái' },
            { id: 'room', label: 'Phòng' },
            { id: 'tenant', label: 'Người thuê' },
            { id: 'sort', label: 'Sắp xếp' },
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabScrollContainer}
                style={styles.tabContainer}
                pagingEnabled={false}
                snapToAlignment="center"
                decelerationRate="fast">
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabButton,
                            activeFilter === tab.id ? styles.activeTabButton : {}
                        ]}
                        onPress={() => handleFilterTypeChange(tab.id)}>
                        <Text
                            style={[
                                styles.tabText,
                                activeFilter === tab.id ? styles.activeTabText : {}
                            ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Render các bộ lọc dựa trên tab đang active
    const renderActiveFilterContent = () => {
        switch (activeFilter) {
            case 'status':
                return renderStatusFilter();
            case 'room':
                return renderRoomFilter();
            case 'tenant':
                return renderTenantFilter();
            case 'sort':
                return renderSortOrderFilter();
            default:
                return null;
        }
    };

    const renderStatusFilter = () => {
        // Add draft status only for landlords
        const statuses = [
            { label: 'Tất cả', value: undefined },
            ...(isLandlord ? [{ label: 'Nháp', value: 'draft' }] : []),
            { label: 'Chưa thanh toán', value: 'issued' },
            { label: 'Đã thanh toán', value: 'paid' },
            { label: 'Quá hạn', value: 'overdue' },
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterButtonsScrollContainer}
                style={styles.filterButtonsContainer}
                decelerationRate="fast"
                snapToAlignment="start">
                {statuses.map((item, index) => (
                    <TouchableOpacity
                        key={`status-${index}`}
                        style={[
                            styles.filterButton,
                            selectedStatus === item.value
                                ? { backgroundColor: Colors.limeGreen }
                                : index === 0 && !selectedStatus ? { backgroundColor: Colors.limeGreen } : {},
                        ]}
                        onPress={() => setSelectedStatus(item.value)}>
                        <Text
                            style={[
                                styles.filterText,
                                (selectedStatus === item.value || (index === 0 && !selectedStatus))
                                    ? { color: Colors.black, fontWeight: 'bold' }
                                    : {},
                            ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderRoomFilter = () => {
        if (uniqueRooms.length === 0) {
            return (
                <View style={styles.filterContainer}>
                    <Text style={styles.noFilterText}>Không tìm thấy phòng nào</Text>
                </View>
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
                style={styles.filterContainer}
                decelerationRate="fast"
                snapToAlignment="start">
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedRoom === undefined
                            ? { backgroundColor: Colors.limeGreen }
                            : {},
                    ]}
                    onPress={() => setSelectedRoom(undefined)}>
                    <Text
                        style={[
                            styles.filterText,
                            selectedRoom === undefined ? { color: Colors.black, fontWeight: 'bold' } : {},
                        ]}>
                        Tất cả
                    </Text>
                </TouchableOpacity>
                {uniqueRooms.map((room, index) => (
                    <TouchableOpacity
                        key={`room-${index}`}
                        style={[
                            styles.filterButton,
                            selectedRoom === room.id
                                ? { backgroundColor: Colors.limeGreen }
                                : {},
                        ]}
                        onPress={() => setSelectedRoom(room.id)}>
                        <Text
                            style={[
                                styles.filterText,
                                selectedRoom === room.id ? { color: Colors.black, fontWeight: 'bold' } : {},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {room.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderTenantFilter = () => {
        if (uniqueTenants.length === 0) {
            return (
                <View style={styles.filterContainer}>
                    <Text style={styles.noFilterText}>Không tìm thấy người thuê nào</Text>
                </View>
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
                style={styles.filterContainer}
                decelerationRate="fast"
                snapToAlignment="start">
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedTenant === undefined
                            ? { backgroundColor: Colors.limeGreen }
                            : {},
                    ]}
                    onPress={() => setSelectedTenant(undefined)}>
                    <Text
                        style={[
                            styles.filterText,
                            selectedTenant === undefined ? { color: Colors.black, fontWeight: 'bold' } : {},
                        ]}>
                        Tất cả
                    </Text>
                </TouchableOpacity>
                {uniqueTenants.map((tenant, index) => (
                    <TouchableOpacity
                        key={`tenant-${index}`}
                        style={[
                            styles.filterButton,
                            selectedTenant === tenant.id
                                ? { backgroundColor: Colors.limeGreen }
                                : {},
                        ]}
                        onPress={() => setSelectedTenant(tenant.id)}>
                        <Text
                            style={[
                                styles.filterText,
                                selectedTenant === tenant.id ? { color: Colors.black, fontWeight: 'bold' } : {},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {tenant.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderSortOrderFilter = () => {
        const sortOptions = [
            { label: 'Mới nhất', value: 'newest' },
            { label: 'Cũ nhất', value: 'oldest' },
            { label: 'Giá cao nhất', value: 'highest' },
            { label: 'Giá thấp nhất', value: 'lowest' },
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
                style={styles.filterContainer}
                decelerationRate="fast"
                snapToAlignment="start">
                {sortOptions.map((item, index) => (
                    <TouchableOpacity
                        key={`sort-${index}`}
                        style={[
                            styles.filterButton,
                            sortOrder === item.value
                                ? { backgroundColor: Colors.limeGreen }
                                : {},
                        ]}
                        onPress={() => setSortOrder(item.value as SortOrder)}>
                        <Text
                            style={[
                                styles.filterText,
                                sortOrder === item.value ? { color: Colors.black, fontWeight: 'bold' } : {},
                            ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Xử lý khi nhấn vào nút tạo hóa đơn mới
    const handleCreateNewInvoice = () => {
        // Hiển thị modal chọn hợp đồng
        setContractModalVisible(true);
    };

    // Xử lý khi chọn hợp đồng
    const handleSelectContract = (contract: Contract) => {
        setSelectedContract(contract);
        setContractModalVisible(false);
        setInvoiceModalVisible(true);
    };

    // Xử lý khi tạo hóa đơn thành công
    const handleInvoiceCreationSuccess = () => {
        // Tải lại danh sách hóa đơn
        loadInvoices();
    };

    // Xử lý khi nhấn nút sửa hóa đơn
    const handleEditInvoice = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        const invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            Alert.alert('Lỗi', 'Không thể chỉnh sửa hóa đơn này');
            return;
        }

        // Điều hướng đến màn hình chỉnh sửa hóa đơn
        navigation.navigate('EditInvoice', { invoiceId });
    };

    // Xử lý khi nhấn nút xóa hóa đơn
    const handleDeleteInvoice = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        const invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            Alert.alert('Lỗi', 'Không thể xóa hóa đơn này');
            return;
        }

        // Hiển thị hộp thoại xác nhận xóa
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa hóa đơn này không?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => deleteInvoiceHandler(invoiceId),
                },
            ],
            { cancelable: true }
        );
    };

    // Hàm gọi API để xóa hóa đơn
    const deleteInvoiceHandler = async (invoiceId: string) => {
        if (!token) {
            Alert.alert('Lỗi', 'Bạn cần đăng nhập để thực hiện chức năng này');
            return;
        }

        try {
            const response = await deleteInvoice(token, invoiceId);

            if (response.success) {
                // Hiển thị thông báo thành công
                Alert.alert('Thành công', response.message || 'Đã xóa hóa đơn thành công');

                // Tải lại danh sách hóa đơn
                loadInvoices();
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi xóa hóa đơn');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi xóa hóa đơn');
        }
    };

    // Xử lý quay lại màn hình hồ sơ
    const handleBackToProfile = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'UITab' }],
            })
        );
    };

    // Điều hướng đến màn hình mẫu hóa đơn
    const navigateToTemplates = () => {
        navigation.navigate('InvoiceTemplates');
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text>Vui lòng đăng nhập để xem hóa đơn</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackToProfile}>
                    <Image
                        source={require('../../assets/icons/icon_arrow_back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Hóa đơn của bạn</Text>
                {isLandlord ? (
                    <TouchableOpacity onPress={navigateToTemplates}>
                        <Text style={styles.templateButton}>Mẫu</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderView} />
                )}
            </View>

            {/* Các tab bộ lọc */}
            <View style={styles.filterTabsWrapper}>
                {renderFilterTabs()}
            </View>

            {/* Nội dung bộ lọc dựa trên tab đang active */}
            <View style={styles.activeFilterWrapper}>
                {renderActiveFilterContent()}
            </View>

            {loading && !refreshing && (
                <ActivityIndicator
                    size="large"
                    color={Colors.primaryGreen}
                    style={styles.initialLoader}
                />
            )}

            <FlatList
                data={localInvoices.length > 0 ? localInvoices : invoices}
                keyExtractor={item => item._id?.toString() || item.id?.toString() || item.invoiceNumber}
                renderItem={({ item }) => (
                    <InvoiceCard
                        invoice={item}
                        onPress={handleInvoicePress}
                        onEdit={handleEditInvoice}
                        onDelete={handleDeleteInvoice}
                    />
                )}
                contentContainerStyle={styles.flatListContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && !refreshing ? (
                        <ActivityIndicator
                            size="large"
                            color={Colors.primaryGreen}
                            style={styles.loader}
                        />
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {error ? 'Đã xảy ra lỗi khi tải dữ liệu' : 'Không tìm thấy hóa đơn nào'}
                                {'\n'}
                                {(selectedStatus || selectedRoom || selectedTenant) ? 'với bộ lọc đã chọn' : ''}
                            </Text>
                        </View>
                    ) : null
                }
            />

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* Floating Action Button cho chủ trọ */}
            {isLandlord && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.7}
                    onPress={handleCreateNewInvoice}>
                    <Text style={styles.fabPlusIcon}>+</Text>
                    <Text style={styles.fabLabel}>Tạo hóa đơn mới</Text>
                </TouchableOpacity>
            )}

            {/* Modal chọn hợp đồng */}
            <ContractSelectionModal
                visible={contractModalVisible}
                onClose={() => setContractModalVisible(false)}
                onSelectContract={handleSelectContract}
            />

            {/* Modal tạo hóa đơn */}
            <InvoiceCreationModal
                visible={invoiceModalVisible}
                onClose={() => setInvoiceModalVisible(false)}
                contract={selectedContract}
                onSuccess={handleInvoiceCreationSuccess}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
        marginTop: 10
    },
    headerContainer: {
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
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        textAlign: 'center',
        flex: 1,
    },
    placeholderView: {
        width: 24,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialLoader: {
        position: 'absolute',
        top: SCREEN.height / 3,
        left: 0,
        right: 0,
    },
    loader: {
        marginVertical: 20,
    },
    filterTabsWrapper: {
        marginBottom: 4,
    },
    activeFilterWrapper: {
        marginBottom: 8,
    },
    tabContainer: {
        paddingLeft: 16,
        marginBottom: 4,
        maxHeight: 40,
        flexGrow: 0,
    },
    tabScrollContainer: {
        paddingRight: 16,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: Colors.lightGray,
        minWidth: 80,
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: Colors.black,
    },
    tabText: {
        fontWeight: '500',
        color: Colors.dearkOlive,
    },
    activeTabText: {
        color: Colors.white,
    },
    filterButtonsContainer: {
        paddingLeft: 16,
        marginBottom: 10,
        maxHeight: 36,
    },
    filterButtonsScrollContainer: {
        paddingRight: 16,
    },
    filterContainer: {
        paddingLeft: 16,
        marginBottom: 10,
        maxHeight: 36,
    },
    filterScrollContainer: {
        paddingRight: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        marginRight: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    filterText: {
        color: Colors.black,
        fontWeight: '400',
    },
    noFilterText: {
        color: Colors.mediumGray,
        fontStyle: 'italic',
        padding: 8,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.mediumGray,
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#FFECEC',
        padding: 10,
        margin: 16,
        borderRadius: 8,
    },
    errorText: {
        color: Colors.red,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#8BC34A',
        borderRadius: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 999,
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    fabIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    fabIcon: {
        width: 18,
        height: 18,
        tintColor: 'white',
    },
    fabLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.2,
    },
    fabPlusIcon: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
        marginTop: -2,
    },
    flatListContent: {
        paddingBottom: 80, // Increased from 20 to 80 to accommodate FAB
    },
    templateButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
    },
});

export default BillScreen; 