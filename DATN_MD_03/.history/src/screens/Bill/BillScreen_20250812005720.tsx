import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    Platform,
    Animated,
    Easing,
} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoices, fetchRoommateInvoices } from '../../store/slices/billSlice';
import { Invoice } from '../../types/Bill';
import { Colors } from '../../theme/color';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { SCREEN, scale, verticalScale } from '../../utils/responsive';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { Icons } from '../../assets/icons';
import { InvoiceCard, ContractSelectionModal, InvoiceCreationModal } from './components';
import { Contract } from '../../types/Contract';
import { deleteInvoice, checkUserIsCoTenant } from '../../store/services/billService';
import { api } from '../../api/api';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';

// Kiểu dữ liệu cho các bộ lọc
type FilterType = 'status' | 'room' | 'tenant' | 'sort';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

type BillScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;

const BillScreen = () => {
    console.log('=== BillScreen component mounted ===');

    const dispatch = useAppDispatch();
    const navigation = useNavigation<BillScreenNavigationProp>();
    const { user, token } = useAppSelector(state => state.auth);
    const { invoices, loading, error, pagination } = useAppSelector(
        state => state.bill,
    );
    
    // Sử dụng CustomAlertModal hook
    const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
    
    // Thêm biến isMounted nếu chưa có
    const isMounted = useRef<boolean>(true);
    const [isRefreshing, setRefreshing] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
        undefined,
    );

    // Kiểm tra xem người dùng có phải là chủ trọ không
    const isLandlord = user?.role === 'chuTro';

    // State để theo dõi xem người dùng có phải là người ở cùng không
    const [isUserCoTenant, setIsUserCoTenant] = useState(false);

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
        // Tạo bản sao của mảng invoices để không ảnh hưởng đến dữ liệu gốc
        let allInvoices = [...invoices];

        console.log('Processing invoices:', allInvoices.length, 'roommate status:', isUserCoTenant);

        // Kiểm tra từng hóa đơn xem có phải người ở cùng không
        let roommateInvoices = allInvoices.filter(invoice => invoice.isRoommate === true);
        let regularInvoices = allInvoices.filter(invoice => invoice.isRoommate !== true);

        console.log('Initial invoice counts:');
        console.log('- Roommate invoices:', roommateInvoices.length);
        console.log('- Regular invoices:', regularInvoices.length);
        console.log('- Unknown status:', allInvoices.length - roommateInvoices.length - regularInvoices.length);

        // Nếu người dùng không phải người ở cùng, ẩn tất cả hóa đơn người ở cùng
        if (isUserCoTenant === false) {
            console.log('User is not co-tenant, filtering out roommate invoices');
            allInvoices = allInvoices.filter(invoice => invoice.isRoommate !== true);
            console.log('After filtering: remaining invoices:', allInvoices.length);
        }

        // Ẩn hóa đơn có trạng thái nháp nếu không phải là chủ trọ
        if (!isLandlord) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(invoice => invoice.status !== 'draft');
            console.log('Filtered out draft invoices:', countBefore - allInvoices.length);
        }

        // Lọc theo trạng thái
        if (selectedStatus) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(
                invoice => invoice.status === selectedStatus
            );
            console.log('Filtered by status:', selectedStatus, '- remaining:', allInvoices.length, '(removed', countBefore - allInvoices.length, ')');
        }

        // Lọc theo phòng
        if (selectedRoom) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(invoice => {
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
            console.log('Filtered by room:', selectedRoom, '- remaining:', allInvoices.length, '(removed', countBefore - allInvoices.length, ')');
        }

        // Lọc theo người thuê
        if (selectedTenant) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(invoice => {
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
            console.log('Filtered by tenant:', selectedTenant, '- remaining:', allInvoices.length, '(removed', countBefore - allInvoices.length, ')');
        }

        // Sắp xếp theo thứ tự đã chọn
        allInvoices.sort((a, b) => {
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
        console.log('Sorted by:', sortOrder);

        // Cập nhật danh sách hóa đơn
        setLocalInvoices(allInvoices);
        console.log('Final invoice count:', allInvoices.length);

        // Kiểm tra lại trạng thái của các hóa đơn cuối cùng
        roommateInvoices = allInvoices.filter(invoice => invoice.isRoommate === true);
        regularInvoices = allInvoices.filter(invoice => invoice.isRoommate !== true);

        console.log('Final invoice breakdown:');
        console.log('- Roommate invoices:', roommateInvoices.length);
        console.log('- Regular invoices:', regularInvoices.length);
        console.log('- Unknown status:', allInvoices.length - roommateInvoices.length - regularInvoices.length);

    }, [invoices, selectedStatus, selectedRoom, selectedTenant, sortOrder, isLandlord, user?.role, isUserCoTenant]);

    useEffect(() => {
        // Log danh sách hóa đơn khi có thay đổi
        if (localInvoices.length > 0) {
            // Chi tiết hơn về các hóa đơn
            console.log('Tổng số hóa đơn sau khi lọc:', localInvoices.length);
            console.log('Số hóa đơn người ở cùng:', localInvoices.filter(inv => inv.isRoommate === true).length);
            console.log('Số hóa đơn thường:', localInvoices.filter(inv => inv.isRoommate !== true).length);

            // Kiểm tra các thuộc tính chính của hóa đơn đầu tiên
            if (localInvoices[0]) {
                const firstInvoice = localInvoices[0];
                console.log('Thông tin hóa đơn đầu tiên:', {
                    id: firstInvoice._id || firstInvoice.id,
                    isRoommate: firstInvoice.isRoommate,
                    contractId: typeof firstInvoice.contractId === 'object' ? 'Object' : firstInvoice.contractId,
                    status: firstInvoice.status,
                });
            }
        } else {
            console.log('Không có hóa đơn nào được hiển thị');
        }
    }, [localInvoices]);

    // Sử dụng useFocusEffect để kiểm tra khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            // Tạo một biến để theo dõi component đã unmount chưa
            const isMounted = { current: true };
            console.log('=== FOCUS EFFECT STARTED ===');

            // Nếu không có token hoặc đang logout, không gọi API
            if (!token) {
                console.log('No token available, skipping API calls');
                return () => {
                    isMounted.current = false;
                    console.log('=== FOCUS EFFECT CLEANUP (no token) ===');
                };
            }

            // Kiểm tra role trước khi quyết định gọi API
            if (isLandlord) {
                console.log('User is landlord, fetching regular invoices only');
                dispatch(fetchInvoices({
                    token,
                    page: 1,
                    limit: 10,

                    status: selectedStatus || undefined

                }));
                return () => {
                    isMounted.current = false;
                    console.log('=== FOCUS EFFECT CLEANUP (landlord) ===');
                };
            }

            // Chỉ gọi API check người ở cùng nếu là người thuê và có token
            if (user?.role === 'nguoiThue') {
                console.log('User is tenant, checking co-tenant status');

                // Sử dụng một biến để theo dõi API nào đang được gọi
                let isCheckingCoTenant = true;

                const checkAndLoadData = async () => {
                    try {

                        if (!isMounted.current) return;


                        console.log('Checking if user is co-tenant...');
                        const result = await checkUserIsCoTenant(token);

                        // Nếu component unmounted trong quá trình gọi API, dừng lại

                        if (!isMounted.current) return;


                        console.log('Co-tenant check result:', JSON.stringify(result, null, 2));
                        const isCoTenant = result.success && result.isCoTenant;
                        setIsUserCoTenant(isCoTenant);

                        console.log('Loading invoices based on co-tenant status:', isCoTenant);

                        // Sử dụng AbortController để có thể hủy request nếu cần
                        const controller = new AbortController();

                        if (isCoTenant) {
                            dispatch(fetchRoommateInvoices({
                                token,
                                page: 1,
                                limit: 10,
                                status: selectedStatus || undefined,
                                signal: controller.signal,
                            }));
                        } else {
                            dispatch(fetchInvoices({
                                token,
                                page: 1,
                                limit: 10,
                                status: selectedStatus || undefined,
                                signal: controller.signal,
                            }));
                        }

                        isCheckingCoTenant = false;

                    } catch (error) {
                        console.error('Error in checkAndLoadData:', error);

                        // Nếu có lỗi, vẫn đảm bảo gọi API lấy hóa đơn thông thường
                        if (isMounted.current) {
                            setIsUserCoTenant(false);
                            dispatch(fetchInvoices({
                                token,
                                page: 1,
                                limit: 10,

                                status: selectedStatus || undefined

                            }));
                        }

                        isCheckingCoTenant = false;
                    }
                };

                // Gọi hàm check ngay lập tức
                checkAndLoadData();

                // Cleanup function
                return () => {
                    isMounted.current = false;
                    console.log('=== FOCUS EFFECT CLEANUP (tenant) ===');

                    // Nếu đang trong quá trình check co-tenant, log để debug
                    if (isCheckingCoTenant) {
                        console.log('WARNING: Component unmounted while checking co-tenant status');
                    }
                };
            } else {
                // Người dùng không phải landlord và không phải tenant
                console.log('User role is not recognized:', user?.role);
                return () => {
                    isMounted.current = false;
                    console.log('=== FOCUS EFFECT CLEANUP (unknown role) ===');
                };
            }
        }, [dispatch, token, isLandlord, user?.role, selectedStatus])
    );

    // Thêm lại useEffect cho các thay đổi về bộ lọc
    useEffect(() => {
        if (token && isUserCoTenant !== undefined) {
            console.log('Filter changed, reloading with isUserCoTenant:', isUserCoTenant);
            // Tải lại dữ liệu khi bộ lọc thay đổi
            if (isUserCoTenant) {
                dispatch(fetchRoommateInvoices({
                    token,
                    page: 1,
                    limit: 10,
                    status: selectedStatus || undefined,
                }));
            } else {
                dispatch(fetchInvoices({
                    token,
                    page: 1,
                    limit: 10,
                    status: selectedStatus || undefined,
                }));
            }
        }
    }, [dispatch, token, selectedStatus, isUserCoTenant]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleRefresh = useCallback(() => {
        // Nếu không có token, không làm gì cả
        if (!token) {
            console.log('No token available for refresh');
            return;
        }

        console.log('Starting refresh with token available');
        setRefreshing(true);

        const refreshData = async () => {
            try {
                // Nếu là chủ trọ, chỉ cần lấy hóa đơn thông thường
                if (isLandlord) {
                    console.log('Refreshing as landlord, fetching regular invoices');
                    await dispatch(fetchInvoices({
                        token,
                        page: 1,
                        limit: 10,

                        status: selectedStatus || undefined

                    })).unwrap();
                    setRefreshing(false);
                    return;
                }

                // Kiểm tra lại trạng thái người ở cùng
                if (user?.role === 'nguoiThue') {
                    console.log('Refreshing as tenant, checking co-tenant status');
                    const result = await checkUserIsCoTenant(token);
                    const isCoTenant = result.success && result.isCoTenant;

                    console.log('Refresh co-tenant check result:', isCoTenant);
                    setIsUserCoTenant(isCoTenant);

                    if (isCoTenant) {
                        await dispatch(fetchRoommateInvoices({
                            token,
                            page: 1,
                            limit: 10,

                            status: selectedStatus || undefined

                        })).unwrap();
                    } else {
                        await dispatch(fetchInvoices({
                            token,
                            page: 1,
                            limit: 10,

                            status: selectedStatus || undefined

                        })).unwrap();
                    }
                } else {
                    console.log('Refreshing with unknown role, fetching regular invoices');
                    await dispatch(fetchInvoices({
                        token,
                        page: 1,
                        limit: 10,
                    status: selectedStatus || undefined

                    })).unwrap();
                }
            } catch (error) {
                console.error('Error during refresh:', error);
            } finally {
                setRefreshing(false);
            }
        };

        refreshData();
    }, [dispatch, token, selectedStatus, isLandlord, user?.role, isUserCoTenant]);

    const handleLoadMore = () => {
        if (pagination.page < pagination.totalPages && !loading && token) {
            dispatch(
                fetchInvoices({
                    token,
                    page: pagination.page + 1,
                    limit: pagination.limit,
                    status: selectedStatus || undefined,
                }),
            );
        }
    };

    const handleInvoicePress = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        let invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            showError('Không thể mở chi tiết hóa đơn này');
            return;
        }

        // Nếu là hóa đơn người ở cùng, loại bỏ hậu tố "-roommate" khỏi ID
        if (invoice.isRoommate === true && invoiceId.includes('-roommate')) {
            invoiceId = invoiceId.replace('-roommate', '');
        }

        // Ghi log để kiểm tra dữ liệu
        console.log('Invoice pressed:', {
            id: invoiceId,
            isRoommate: invoice.isRoommate,
            status: invoice.status,
        });

        // Kiểm tra nếu đây là hóa đơn của người ở cùng
        if (invoice.isRoommate === true) {
            console.log('Navigating to RoommateInvoiceDetails with ID:', invoiceId);
            // Điều hướng đến màn hình chi tiết hóa đơn người ở cùng
            navigation.navigate('RoommateInvoiceDetails', { invoiceId });
        } else {
            console.log('Navigating to BillDetails with ID:', invoiceId);
            // Điều hướng đến màn hình chi tiết hóa đơn thông thường
            navigation.navigate('BillDetails', { invoiceId });
        }
    };

    // Xử lý thay đổi loại bộ lọc (tab)
    const handleFilterTypeChange = (filterType: FilterType) => {
        setActiveFilter(filterType);
    };

    // State để theo dõi dropdown nào đang mở
    const [openDropdown, setOpenDropdown] = useState<FilterType | null>(null);

    // Create animation values for each dropdown type
    const statusAnimRef = useRef(new Animated.Value(0)).current;
    const roomAnimRef = useRef(new Animated.Value(0)).current;
    const tenantAnimRef = useRef(new Animated.Value(0)).current;
    const sortAnimRef = useRef(new Animated.Value(0)).current;

    // Get animation reference for a specific dropdown
    const getAnimationForDropdown = (dropdownType: FilterType | null): Animated.Value => {
        switch (dropdownType) {
            case 'status': return statusAnimRef;
            case 'room': return roomAnimRef;
            case 'tenant': return tenantAnimRef;
            case 'sort': return sortAnimRef;
            default: return new Animated.Value(0);
        }
    };

    // Animation for content dropdown
    const [contentAnimation] = useState(new Animated.Value(0));

    // Animate dropdown open/close
    useEffect(() => {
        // Animate content area
        Animated.timing(contentAnimation, {
            toValue: openDropdown ? 1 : 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();

        // Get all dropdown types
        const allDropdowns: FilterType[] = ['status', 'room', 'tenant', 'sort'];

        // Animate each arrow
        allDropdowns.forEach(dropdownType => {
            const anim = getAnimationForDropdown(dropdownType);
            Animated.timing(anim, {
                toValue: openDropdown === dropdownType ? 1 : 0,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        });
    }, [openDropdown, statusAnimRef, roomAnimRef, tenantAnimRef, sortAnimRef, contentAnimation]);

    // Theo dõi khi user role hoặc trạng thái co-tenant thay đổi để reset dropdown
    useEffect(() => {
        // Nếu người dùng là tenant hoặc co-tenant và dropdown đang mở là room hoặc tenant, đóng nó lại
        if ((user?.role === 'nguoiThue' || isUserCoTenant) &&
            (openDropdown === 'room' || openDropdown === 'tenant')) {
            setOpenDropdown(null);
        }
    }, [user?.role, isUserCoTenant, openDropdown]);

    // Render các dropdown bộ lọc
    const renderFilterTabs = () => {
        // Kiểm tra nếu người dùng là người thuê hoặc người ở cùng
        const isTenantOrCoTenant = user?.role === 'nguoiThue' || isUserCoTenant;

        // Lọc tab dựa trên vai trò người dùng
        let tabs: { id: FilterType; label: string }[] = [
            { id: 'status', label: 'Trạng thái' },
            { id: 'sort', label: 'Sắp xếp' },
        ];

        // Thêm tab Phòng và Người thuê chỉ khi người dùng là chủ trọ
        if (!isTenantOrCoTenant) {
            tabs.splice(1, 0,
                { id: 'room', label: 'Phòng' },
                { id: 'tenant', label: 'Người thuê' }
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dropdownsScrollContainer}
                style={styles.dropdownsContainer}>
                {tabs.map(tab => (
                    <View key={tab.id} style={styles.dropdownWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.dropdownButton,

                                openDropdown === tab.id ? styles.activeDropdownButton : {}
                            ]}

                            onPress={() => {
                                if (openDropdown === tab.id) {
                                    setOpenDropdown(null);
                                } else {
                                    setOpenDropdown(tab.id);
                                    handleFilterTypeChange(tab.id);
                                }
                            }}>
                            <Text style={styles.dropdownButtonText} numberOfLines={1} ellipsizeMode="tail">

                                {tab.label}
                                {tab.id === 'status' && selectedStatus &&
                                    `: ${selectedStatus === 'draft' ? 'Nháp' :
                                        selectedStatus === 'issued' ? 'Chưa thanh toán' :
                                            selectedStatus === 'paid' ? 'Đã thanh toán' :
                                                selectedStatus === 'overdue' ? 'Quá hạn' : ''}`

                                }
                                {tab.id === 'room' && selectedRoom &&
                                    `: ${uniqueRooms.find(r => r.id === selectedRoom)?.name || ''}`
                                }
                                {tab.id === 'tenant' && selectedTenant &&
                                    `: ${uniqueTenants.find(t => t.id === selectedTenant)?.name || ''}`
                                }
                                {tab.id === 'sort' &&
                                    `: ${sortOrder === 'newest' ? 'Mới nhất' :
                                        sortOrder === 'oldest' ? 'Cũ nhất' :

                                            sortOrder === 'highest' ? 'Giá cao nhất' :
                                                sortOrder === 'lowest' ? 'Giá thấp nhất' : ''}`

                                }
                            </Text>
                            <Animated.Image
                                source={require('../../assets/icons/icon_arrow_down.png')}
                                style={[
                                    styles.dropdownIcon,
                                    {
                                        transform: [{
                                            rotate: getAnimationForDropdown(tab.id).interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg'],
                                            }),
                                        }],
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        );
    };

    // Render các bộ lọc dựa trên dropdown đang mở
    const renderActiveFilterContent = () => {
        // Always render something to avoid layout jumps, but we'll control visibility with animation
        if (!openDropdown) {
            // Return an empty placeholder when no dropdown is selected
            return <View style={{ height: 0 }} />;
        }

        switch (openDropdown) {
            case 'status':
                return renderStatusFilter();
            case 'room':
                return renderRoomFilter();
            case 'tenant':
                return renderTenantFilter();
            case 'sort':
                return renderSortOrderFilter();
            default:
                return <View style={{ height: 0 }} />;
        }
    };

    const renderStatusFilter = () => {
        // Add draft status only for landlords
        const statuses = [
            { label: 'Tất cả', value: undefined },
            ...(isLandlord ? [{ label: 'Nháp', value: 'draft' }] : []),
            { label: 'Chưa thanh toán', value: 'issued' },
            { label: 'Chờ xác nhận', value: 'pending_confirmation' },
            { label: 'Đã thanh toán', value: 'paid' },
            { label: 'Quá hạn', value: 'overdue' },
        ];

        return (
            <View style={styles.dropdownOptionsContainer}>
                {statuses.map((item, index) => {
                    const isSelected = selectedStatus === item.value || (index === 0 && !selectedStatus);
                    return (
                        <TouchableOpacity
                            key={`status-${index}`}
                            style={[
                                styles.dropdownOption,
                                isSelected ? styles.dropdownOptionSelected : {},
                            ]}
                            onPress={() => {
                                setSelectedStatus(item.value);
                                setOpenDropdown(null);
                            }}>
                            <Text
                                style={[
                                    styles.dropdownOptionText,
                                    isSelected ? styles.dropdownOptionTextSelected : {},
                                ]}>
                                {item.label}
                            </Text>
                            {isSelected && (
                                <Image
                                    source={require('../../assets/icons/icon_check.png')}
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderRoomFilter = () => {
        if (uniqueRooms.length === 0) {
            return (
                <View style={styles.dropdownOptionsContainer}>
                    <Text style={styles.noFilterText}>Không tìm thấy phòng nào</Text>
                </View>
            );
        }

        return (
            <View style={styles.dropdownOptionsContainer}>
                <TouchableOpacity
                    style={[
                        styles.dropdownOption,
                        selectedRoom === undefined ? styles.dropdownOptionSelected : {},
                    ]}
                    onPress={() => {
                        setSelectedRoom(undefined);
                        setOpenDropdown(null);
                    }}>
                    <Text
                        style={[
                            styles.dropdownOptionText,
                            selectedRoom === undefined ? styles.dropdownOptionTextSelected : {},
                        ]}>
                        Tất cả
                    </Text>
                    {selectedRoom === undefined && (
                        <Image
                            source={require('../../assets/icons/icon_check.png')}
                            style={styles.checkIcon}
                        />
                    )}
                </TouchableOpacity>
                {uniqueRooms.map((room, index) => {
                    const isSelected = selectedRoom === room.id;
                    return (
                        <TouchableOpacity
                            key={`room-${index}`}
                            style={[
                                styles.dropdownOption,
                                isSelected ? styles.dropdownOptionSelected : {},
                            ]}
                            onPress={() => {
                                setSelectedRoom(room.id);
                                setOpenDropdown(null);
                            }}>
                            <Text
                                style={[
                                    styles.dropdownOptionText,
                                    isSelected ? styles.dropdownOptionTextSelected : {},
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {room.name}
                            </Text>
                            {isSelected && (
                                <Image
                                    source={require('../../assets/icons/icon_check.png')}
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderTenantFilter = () => {
        if (uniqueTenants.length === 0) {
            return (
                <View style={styles.dropdownOptionsContainer}>
                    <Text style={styles.noFilterText}>Không tìm thấy người thuê nào</Text>
                </View>
            );
        }

        return (
            <View style={styles.dropdownOptionsContainer}>
                <TouchableOpacity
                    style={[
                        styles.dropdownOption,
                        selectedTenant === undefined ? styles.dropdownOptionSelected : {},
                    ]}
                    onPress={() => {
                        setSelectedTenant(undefined);
                        setOpenDropdown(null);
                    }}>
                    <Text
                        style={[
                            styles.dropdownOptionText,
                            selectedTenant === undefined ? styles.dropdownOptionTextSelected : {},
                        ]}>
                        Tất cả
                    </Text>
                    {selectedTenant === undefined && (
                        <Image
                            source={require('../../assets/icons/icon_check.png')}
                            style={styles.checkIcon}
                        />
                    )}
                </TouchableOpacity>
                {uniqueTenants.map((tenant, index) => {
                    const isSelected = selectedTenant === tenant.id;
                    return (
                        <TouchableOpacity
                            key={`tenant-${index}`}
                            style={[
                                styles.dropdownOption,
                                isSelected ? styles.dropdownOptionSelected : {},
                            ]}
                            onPress={() => {
                                setSelectedTenant(tenant.id);
                                setOpenDropdown(null);
                            }}>
                            <Text
                                style={[
                                    styles.dropdownOptionText,
                                    isSelected ? styles.dropdownOptionTextSelected : {},
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {tenant.name}
                            </Text>
                            {isSelected && (
                                <Image
                                    source={require('../../assets/icons/icon_check.png')}
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
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
            <View style={styles.dropdownOptionsContainer}>
                {sortOptions.map((item, index) => {
                    const isSelected = sortOrder === item.value;
                    return (
                        <TouchableOpacity
                            key={`sort-${index}`}
                            style={[
                                styles.dropdownOption,
                                isSelected ? styles.dropdownOptionSelected : {},
                            ]}
                            onPress={() => {
                                setSortOrder(item.value as SortOrder);
                                setOpenDropdown(null);
                            }}>
                            <Text
                                style={[
                                    styles.dropdownOptionText,
                                    isSelected ? styles.dropdownOptionTextSelected : {},
                                ]}>
                                {item.label}
                            </Text>
                            {isSelected && (
                                <Image
                                    source={require('../../assets/icons/icon_check.png')}
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
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
        // Chỉ tải lại danh sách hóa đơn khi còn mounted và có token
        if (isMounted.current && token) {
            console.log('Reloading invoices after creation success');
            if (isUserCoTenant) {
                dispatch(fetchRoommateInvoices({
                    token,
                    page: 1,
                    limit: 10,
                    status: selectedStatus || undefined,
                }));
            } else {
                dispatch(fetchInvoices({
                    token,
                    page: 1,
                    limit: 10,
                    status: selectedStatus || undefined,
                }));
            }
        }
    };

    // Xử lý khi nhấn nút sửa hóa đơn
    const handleEditInvoice = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        const invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            showError('Không thể chỉnh sửa hóa đơn này');
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
            showError('Không thể xóa hóa đơn này');
            return;
        }

        // Hiển thị hộp thoại xác nhận xóa
        showConfirm(
            'Bạn có chắc chắn muốn xóa hóa đơn này không?',
            () => deleteInvoiceHandler(invoiceId),
            'Xác nhận xóa'
        );
    };

    // deleteInvoiceHandler
    const deleteInvoiceHandler = async (invoiceId: string) => {
        if (!token) {
            showError('Bạn cần đăng nhập để thực hiện chức năng này');
            return;
        }

        try {
            const response = await deleteInvoice(token, invoiceId);

            if (response.success) {
                // Hiển thị thông báo thành công
                showSuccess(response.message || 'Đã xóa hóa đơn thành công');

                // Tải lại danh sách hóa đơn, chỉ gọi API khi còn mounted
                if (isMounted.current) {
                    console.log('Reloading invoices after deletion');
                    if (isUserCoTenant) {
                        dispatch(fetchRoommateInvoices({
                            token,
                            page: 1,
                            limit: 10,
                            status: selectedStatus || undefined,
                        }));
                    } else {
                        dispatch(fetchInvoices({
                            token,
                            page: 1,
                            limit: 10,
                            status: selectedStatus || undefined,
                        }));
                    }
                }
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi xóa hóa đơn');
            }
        } catch (error: any) {
            showError(error.message || 'Có lỗi xảy ra khi xóa hóa đơn');
        }
    };

    // Xử lý quay lại màn hình hồ sơ
    const handleBackToProfile = () => {
        // Sử dụng CommonActions để reset navigation stack và chỉ định màn hình ban đầu là UITab
        // Sau đó sử dụng params của navigation để chỉ định tab cụ thể
        navigation.dispatch(
            CommonActions.navigate({
                name: 'UITab',
                params: {
                    screen: 'Profile',
                },
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
                <Text style={styles.headerText}>
                    {isUserCoTenant ? 'Hóa đơn người ở cùng' : 'Hóa đơn thu chi'}
                </Text>
                {isLandlord ? (
                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={navigateToTemplates}
                    >
                        <Text style={styles.templateButtonText}>Mẫu</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderView} />
                )}
            </View>



            {/* Dropdown bộ lọc */}
            <View style={styles.filterTabsWrapper}>
                {renderFilterTabs()}
            </View>

            {/* Nội dung bộ lọc dựa trên dropdown đang mở */}
            <Animated.View style={[
                styles.dropdownContentWrapper,
                {
                    maxHeight: contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 300],
                    }),
                    opacity: contentAnimation,
                    overflow: 'hidden',
                },
            ]}>
                <View style={styles.activeFilterWrapper}>
                    {renderActiveFilterContent()}
                </View>
            </Animated.View>

            <LoadingOverlay 
                visible={loading && !isRefreshing}
                message="Đang tải danh sách hóa đơn..."
                size="large"
            />

            <FlatList
                data={localInvoices.length > 0 ? localInvoices : invoices}
                keyExtractor={item => {
                    // Tạo key duy nhất cho mỗi item
                    const baseId = item._id?.toString() || item.id?.toString() || item.invoiceNumber;
                    // Thêm hậu tố isRoommate để đảm bảo tính duy nhất
                    return item.isRoommate ? `${baseId}-roommate` : baseId;
                }}
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
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && !isRefreshing ? (
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
    headerContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        width: 36,
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
    // Thêm style cho badge người ở cùng
    coTenantBadge: {
        backgroundColor: '#E6F7FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BAE7FF',
    },
    coTenantText: {
        color: '#0050B3',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Các style khác
    filterTabsWrapper: {
        marginBottom: 2, // Reduced from 4
    },
    activeFilterWrapper: {
        marginBottom: 4, // Reduced from 8
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
        borderRadius: 50,
        marginRight: 8,
        backgroundColor: 'transparent',
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(224, 224, 224, 0.8)',
    },
    activeTabButton: {
        backgroundColor: Colors.black,
        borderRadius: 50,
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    tabText: {
        fontWeight: '600',
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
        borderRadius: 50,
        backgroundColor: 'transparent',
        marginRight: 8,
        minWidth: 60,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(224, 224, 224, 0.8)',
    },
    filterText: {
        color: Colors.dearkOlive,
        fontWeight: '500',
    },
    noFilterText: {
        color: Colors.mediumGray,
        fontStyle: 'italic',
        padding: 16,
        textAlign: 'center',
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
        paddingBottom: 80, // Space for FAB
        paddingTop: 0, // Ensure no extra padding at top
    },
    templateButton: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
    templateButtonText: {
        color: Colors.primaryGreen,
        fontSize: 16,
        fontWeight: '600',
    },
    // Dropdown styles
    dropdownsContainer: {
        paddingVertical: 8,
        backgroundColor: 'transparent',
        marginHorizontal: 0,
        marginTop: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(238, 238, 238, 0.8)',
    },
    dropdownsScrollContainer: {
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdownWrapper: {
        flex: 1,
        paddingHorizontal: 4,
        minWidth: SCREEN.width / 3.5,
    },
    dropdownButton: {
        backgroundColor: 'transparent',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(224, 224, 224, 0.8)',
        minHeight: 34,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 1,
    },
    activeDropdownButton: {
        borderColor: Colors.primaryGreen,
        borderRadius: 50,
        borderWidth: 1.5,
        backgroundColor: 'rgba(139, 195, 74, 0.08)',
        shadowColor: 'rgba(139, 195, 74, 0.25)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        elevation: 3,
    },
    dropdownButtonText: {
        color: Colors.dearkOlive,
        fontWeight: '600',
        fontSize: 13,
        flex: 1,
        marginRight: 4,
    },
    dropdownIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        tintColor: Colors.dearkOlive,
    },
    dropdownIconRotated: {
        transform: [{ rotate: '180deg' }],
        tintColor: Colors.primaryGreen,
    },
    dropdownOptionsContainer: {
        backgroundColor: 'transparent',
        borderRadius: 50,
        marginTop: 4,
        padding: 4,
        borderWidth: 0,
        maxHeight: 230,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.08)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    dropdownOption: {
        paddingVertical: 10, // Reduced from 14
        paddingHorizontal: 18,
        borderRadius: 50,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(242, 242, 242, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownOptionSelected: {
        backgroundColor: 'rgba(139, 195, 74, 0.15)',
        borderRadius: 50,
    },
    dropdownOptionText: {
        fontSize: 14,
        color: Colors.dearkOlive,
        fontWeight: '500',
    },
    dropdownOptionTextSelected: {
        fontWeight: '700',
        color: Colors.primaryGreen,
    },
    checkIcon: {
        width: 18,
        height: 18,
        tintColor: Colors.primaryGreen,
    },
    dropdownContentWrapper: {
        marginHorizontal: 16,
        zIndex: 100,
    },
});

export default BillScreen;
