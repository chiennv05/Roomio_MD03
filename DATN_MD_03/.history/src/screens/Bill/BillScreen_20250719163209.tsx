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
    Alert,
    Platform,
    Animated,
    Easing,
} from 'react-native';
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
    
    // Ref để theo dõi component mounted
    const isMounted = useRef(true);

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
        if (invoices.length > 0) {
            // Tạo bản sao của mảng invoices để không ảnh hưởng đến dữ liệu gốc
            let filteredInvoices = [...invoices];

            // Xác định các hóa đơn cần hiển thị dựa vào vai trò và trạng thái người ở cùng
            if (user?.role === 'nguoiThue' && isUserCoTenant) {
                // Nếu là người ở cùng, chỉ hiển thị hóa đơn của người ở cùng
                filteredInvoices = filteredInvoices.filter(invoice => invoice.isRoommate === true);
                console.log('Filtering to show only roommate invoices. Count:', filteredInvoices.length);
            }
            
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
    }, [invoices, selectedStatus, selectedRoom, selectedTenant, sortOrder, isLandlord, user?.role, isUserCoTenant]);

    useEffect(() => {
        // Log danh sách hóa đơn khi có thay đổi
        if (localInvoices.length > 0) {
            // Chỉ hiển thị số lượng hóa đơn, không in chi tiết để tránh log quá nhiều
            console.log('Tổng số hóa đơn:', localInvoices.length);
            console.log('Số hóa đơn người ở cùng:', localInvoices.filter(inv => inv.isRoommate).length);
            console.log('Số hóa đơn thường:', localInvoices.filter(inv => !inv.isRoommate).length);
        }
    }, [localInvoices]);

    // State để theo dõi xem người dùng có phải là người ở cùng không
    const [isUserCoTenant, setIsUserCoTenant] = useState(false);

    // Hàm để tải dữ liệu hóa đơn
    const loadInvoices = useCallback((page = 1, shouldRefresh = false) => {
        if (token) {
            // Nếu người dùng là người thuê và là người ở cùng, CHỈ lấy hóa đơn người ở cùng
            if (user?.role === 'nguoiThue' && isUserCoTenant) {
                console.log('User is co-tenant. Only fetching roommate invoices for tenant user:', user?._id);
                
                // Đảm bảo user._id tồn tại trước khi gọi API
                if (user?._id) {
                    dispatch(fetchRoommateInvoices({
                        token,
                        page, // Sử dụng page được truyền vào để hỗ trợ phân trang
                        limit: 10,
                        status: selectedStatus,
                        userId: user._id, // Truyền ID người dùng hiện tại
                    }));
                }
            } else {
                // Đối với chủ trọ hoặc người thuê không phải người ở cùng, lấy hóa đơn thông thường
                dispatch(fetchInvoices({
                    token,
                    page,
                    limit: 10,
                    status: selectedStatus,
                }));
                
                // Nếu là người thuê thường (không phải người ở cùng), không cần lấy hóa đơn người ở cùng
                // Nếu là chủ trọ, vẫn lấy hóa đơn thông thường
            }
        } else {
            // Hiển thị thông báo lỗi nếu không có token
            Alert.alert('Lỗi', 'Bạn cần đăng nhập để xem hóa đơn');
        }
    }, [dispatch, token, selectedStatus, user?.role, user?._id, isUserCoTenant]);

    // Kiểm tra xem người dùng có trong danh sách coTenants không
    const checkUserInCoTenants = useCallback(async () => {
        // Chỉ áp dụng cho người thuê, không phải chủ trọ
        if (!token || isLandlord || !user?._id) {
            setIsUserCoTenant(false);
            return;
        }

        try {
            // Gọi hàm kiểm tra từ billService
            const result = await checkUserIsCoTenant(token);
            
            if (result.success) {
                console.log('User coTenant check result:', result.isCoTenant);
                
                // Cập nhật state
                setIsUserCoTenant(result.isCoTenant);
                
                // Nếu người dùng không phải là người ở cùng trong bất kỳ hợp đồng nào
                if (!result.isCoTenant) {
                    // Hiển thị thông báo
                    Alert.alert(
                        'Thông báo',
                        'Bạn không phải là người ở cùng trong bất kỳ hợp đồng nào. Bạn sẽ chỉ thấy hóa đơn của chính mình.',
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                    );
                }
            }
        } catch (error) {
            console.error('Error checking coTenant status:', error);
            setIsUserCoTenant(false);
        }
    }, [token, isLandlord, user?._id]);

    // Sử dụng useFocusEffect để kiểm tra khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            isMounted.current = true;
            
            // Kiểm tra trạng thái coTenant khi màn hình được focus
            checkUserInCoTenants();
            
            // Tải dữ liệu hóa đơn
            if (token) {
                loadInvoices(1, false);
            }
            
            // Reset room and tenant filters if user is tenant or co-tenant
            if (user?.role === 'nguoiThue' || isUserCoTenant) {
                setSelectedRoom(undefined);
                setSelectedTenant(undefined);
            }
            
            return () => {
                isMounted.current = false;
            };
        }, [token, loadInvoices, checkUserInCoTenants, user?.role, isUserCoTenant])
    );

    // Thêm lại useEffect cho các thay đổi về bộ lọc
    useEffect(() => {
        if (token) {
            loadInvoices(1, false);
        }
    }, [dispatch, token, selectedStatus]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

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
        let invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            Alert.alert('Lỗi', 'Không thể mở chi tiết hóa đơn này');
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
            useNativeDriver: false
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
                useNativeDriver: true
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
                            <Text style={styles.dropdownButtonText}>
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
                                                outputRange: ['0deg', '180deg']
                                            })
                                        }]
                                    }
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
            return <View style={{height: 0}} />;
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
                return <View style={{height: 0}} />;
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
        // Sử dụng CommonActions để reset navigation stack và chỉ định màn hình ban đầu là UITab
        // Sau đó sử dụng params của navigation để chỉ định tab cụ thể
        navigation.dispatch(
            CommonActions.navigate({
                name: 'UITab',
                params: {
                    screen: 'Profile'
                }
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
                        outputRange: [0, 300]
                    }),
                    opacity: contentAnimation,
                    overflow: 'hidden'
                }
            ]}>
            <View style={styles.activeFilterWrapper}>
                {renderActiveFilterContent()}
            </View>
            </Animated.View>

            {loading && !refreshing && (
                <ActivityIndicator
                    size="large"
                    color={Colors.primaryGreen}
                    style={styles.initialLoader}
                />
            )}

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
        paddingTop: 15, // Reduced from 20
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10, // Reduced from 12
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
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
    },
    // Dropdown styles
    dropdownsContainer: {
        paddingVertical: 8,
    },
    dropdownsScrollContainer: {
        paddingHorizontal: 16,
    },
    dropdownWrapper: {
        marginRight: 10,
        minWidth: 140,
        maxWidth: 200,
    },
    dropdownButton: {
        backgroundColor: Colors.white,
        paddingVertical: 8, // Reduced from 12
        paddingHorizontal: 14,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 40, // Reduced from 48
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    activeDropdownButton: {
        borderColor: Colors.primaryGreen,
        borderWidth: 2,
        backgroundColor: 'rgba(139, 195, 74, 0.05)',
    },
    dropdownButtonText: {
        color: Colors.dearkOlive,
        fontWeight: '500',
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    dropdownIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: Colors.dearkOlive,
    },
    dropdownIconRotated: {
        transform: [{ rotate: '180deg' }],
        tintColor: Colors.primaryGreen,
    },
    dropdownOptionsContainer: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        marginTop: 4,
        padding: 4,
        borderWidth: 0,
        maxHeight: 230,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.2)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    dropdownOption: {
        paddingVertical: 10, // Reduced from 14
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownOptionSelected: {
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
        borderRadius: 8,
    },
    dropdownOptionText: {
        fontSize: 14,
        color: Colors.dearkOlive,
    },
    dropdownOptionTextSelected: {
        fontWeight: 'bold',
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