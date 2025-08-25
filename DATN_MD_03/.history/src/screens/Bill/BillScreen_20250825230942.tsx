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
    TextInput,
    StatusBar,
} from 'react-native';
import LoadingAnimationWrapper from '../../components/LoadingAnimationWrapper';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoices, fetchRoommateInvoices } from '../../store/slices/billSlice';
import { Invoice } from '../../types/Bill';
import { Colors } from '../../theme/color';
import { useNavigation, CommonActions, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SCREEN, scale, verticalScale, responsiveSpacing } from '../../utils/responsive';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { Icons } from '../../assets/icons';
import { InvoiceCard, ContractSelectionModal, InvoiceCreationModal } from './components';
import { Contract } from '../../types/Contract';
import { deleteInvoice, checkUserIsCoTenant } from '../../store/services/billService';
import { api } from '../../api/api';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';
import type { RootState } from '../../store';
import DatePicker from 'react-native-date-picker';

// Kiểu dữ liệu cho các bộ lọc
type FilterType = 'status' | 'room' | 'tenant' | 'date' | 'sort';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

type BillScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;

const BillScreen = () => {
    //

    const dispatch = useAppDispatch();
    const navigation = useNavigation<BillScreenNavigationProp>();
    const isFocused = useIsFocused();
    const { user, token } = useAppSelector((state: RootState) => state.auth);
    const { invoices, loading, error, pagination } = useAppSelector(
        (state: RootState) => state.bill,
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

    // State cho bộ lọc theo khoảng thời gian
    const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
    const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
    const [openStartPicker, setOpenStartPicker] = useState(false);
    const [openEndPicker, setOpenEndPicker] = useState(false);

    // State cho modal chọn hợp đồng
    const [contractModalVisible, setContractModalVisible] = useState(false);

    // State cho modal tạo hóa đơn
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // State cho thanh tìm kiếm
    const [searchText, setSearchText] = useState('');

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

        

        // Kiểm tra từng hóa đơn xem có phải người ở cùng không
        let roommateInvoices = allInvoices.filter(invoice => invoice.isRoommate === true);
        let regularInvoices = allInvoices.filter(invoice => invoice.isRoommate !== true);

        console.log('📊 Invoice statistics before filtering:', {
            totalInvoices: allInvoices.length,
            roommateInvoices: roommateInvoices.length,
            regularInvoices: regularInvoices.length,
            isUserCoTenant,
            userRole: user?.role
        });

        // THAY ĐỔI: Hiển thị cả 2 loại hóa đơn cho tất cả người dùng
        // Không lọc bỏ bất kỳ loại hóa đơn nào dựa trên vai trò
        // allInvoices sẽ chứa cả hóa đơn thường và hóa đơn roommate

        // Lọc theo khoảng thời gian theo ngày hết hạn (dueDate). Fallback: createdAt, period
        if (startDateFilter || endDateFilter) {
            const startOfDay = (d: Date) => {
                const x = new Date(d);
                x.setHours(0, 0, 0, 0);
                return x;
            };
            const endOfDay = (d: Date) => {
                const x = new Date(d);
                x.setHours(23, 59, 59, 999);
                return x;
            };

            const s = startDateFilter ? startOfDay(startDateFilter) : null;
            const e = endDateFilter ? endOfDay(endDateFilter) : null;

            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(inv => {
                let dateVal: Date | null = null;
                // Ưu tiên ngày hết hạn
                if (inv.dueDate) {
                    const d = new Date(inv.dueDate as any);
                    if (!isNaN(d.getTime())) dateVal = d;
                }
                // Fallback sang ngày tạo
                if (!dateVal && inv.createdAt) {
                    const d = new Date(inv.createdAt as any);
                    if (!isNaN(d.getTime())) dateVal = d;
                }
                // Fallback cuối: period
                if (!dateVal && inv.period) {
                    if (typeof inv.period === 'string') {
                        const d = new Date(inv.period as any);
                        if (!isNaN(d.getTime())) dateVal = d;
                    } else if (typeof inv.period === 'object' && 'month' in inv.period && 'year' in inv.period) {
                        const d = new Date((inv.period as any).year, (inv.period as any).month - 1, 1);
                        dateVal = d;
                    }
                }
                
                // Nếu không có ngày nào để so sánh, loại bỏ hóa đơn
                if (!dateVal) {
                    return false;
                }
                
                // Kiểm tra ngày bắt đầu
                if (s && dateVal < s) {
                    return false;
                }
                
                // Kiểm tra ngày kết thúc
                if (e && dateVal > e) {
                    return false;
                }
                
                return true;
            });
            
        }

        // Ẩn hóa đơn có trạng thái nháp nếu không phải là chủ trọ
        if (!isLandlord) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(invoice => invoice.status !== 'draft');
            
        }

        // Lọc theo trạng thái
        if (selectedStatus) {
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(
                invoice => invoice.status === selectedStatus
            );
            
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
            
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            const countBefore = allInvoices.length;
            allInvoices = allInvoices.filter(invoice => {
                // Tìm kiếm theo mã hóa đơn
                if (invoice.invoiceNumber?.toLowerCase().includes(searchLower)) {
                    return true;
                }
                // Tìm kiếm theo mã phòng
                if (invoice.contractId && typeof invoice.contractId === 'object' &&
                    invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomNumber) {
                    if (invoice.contractId.contractInfo.roomNumber.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                }
                // Tìm kiếm theo địa chỉ phòng
                if (invoice.contractId && typeof invoice.contractId === 'object' &&
                    invoice.contractId.contractInfo && invoice.contractId.contractInfo.roomAddress) {
                    if (invoice.contractId.contractInfo.roomAddress.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                }
                // Tìm kiếm theo tên người thuê
                if (invoice.contractId && typeof invoice.contractId === 'object' &&
                    invoice.contractId.contractInfo && invoice.contractId.contractInfo.tenantName) {
                    if (invoice.contractId.contractInfo.tenantName.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                }
                // Tìm kiếm theo tenantId object
                if (invoice.tenantId && typeof invoice.tenantId === 'object') {
                    const tenant = invoice.tenantId;
                    if (tenant.fullName?.toLowerCase().includes(searchLower) ||
                        tenant.name?.toLowerCase().includes(searchLower) ||
                        tenant.email?.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                }
                // Tìm kiếm theo hóa đơn tháng
                if (invoice.period) {
                    let periodText = '';
                    if (typeof invoice.period === 'string') {
                        // Nếu period là string, parse ngày tháng
                        try {
                            const date = new Date(invoice.period);
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const year = date.getFullYear().toString();
                            periodText = `hóa đơn tháng ${month}/${year}`;
                        } catch (error) {
                            // Nếu không parse được, sử dụng trực tiếp
                            periodText = invoice.period.toLowerCase();
                        }
                    } else if (typeof invoice.period === 'object' && 'month' in invoice.period && 'year' in invoice.period) {
                        // Nếu period là object với month và year
                        const month = invoice.period.month.toString().padStart(2, '0');
                        const year = invoice.period.year.toString();
                        periodText = `hóa đơn tháng ${month}/${year}`;
                    }
                    
                    if (periodText.toLowerCase().includes(searchLower)) {
                        return true;
                    }
                    
                    // Tìm kiếm theo tháng/năm riêng lẻ
                    if (searchLower.includes('tháng') || searchLower.includes('month')) {
                        if (typeof invoice.period === 'string') {
                            try {
                                const date = new Date(invoice.period);
                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                const year = date.getFullYear().toString();
                                if (month.includes(searchLower.replace(/\D/g, '')) || 
                                    year.includes(searchLower.replace(/\D/g, ''))) {
                                    return true;
                                }
                            } catch (error) {
                                // Bỏ qua nếu không parse được
                            }
                        } else if (typeof invoice.period === 'object' && 'month' in invoice.period && 'year' in invoice.period) {
                            const month = invoice.period.month.toString().padStart(2, '0');
                            const year = invoice.period.year.toString();
                            if (month.includes(searchLower.replace(/\D/g, '')) || 
                                year.includes(searchLower.replace(/\D/g, ''))) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            });
            
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
        

        // Cập nhật danh sách hóa đơn
        setLocalInvoices(allInvoices);
        
        console.log('📋 Final invoice list:', {
            totalDisplayed: allInvoices.length,
            regularInvoices: allInvoices.filter(inv => inv.isRoommate !== true).length,
            roommateInvoices: allInvoices.filter(inv => inv.isRoommate === true).length,
            statusFilter: selectedStatus,
            roomFilter: selectedRoom,
            tenantFilter: selectedTenant,
            searchFilter: searchText
        });

        // Kiểm tra lại trạng thái của các hóa đơn cuối cùng
        roommateInvoices = allInvoices.filter(invoice => invoice.isRoommate === true);
        regularInvoices = allInvoices.filter(invoice => invoice.isRoommate !== true);

        console.log('✅ Mixed invoice display enabled:', {
            regularCount: regularInvoices.length,
            roommateCount: roommateInvoices.length,
            displayBoth: true
        });

    }, [invoices, selectedStatus, selectedRoom, selectedTenant, sortOrder, searchText, isLandlord, user?.role, isUserCoTenant, startDateFilter, endDateFilter]);

    useEffect(() => {
        // Log danh sách hóa đơn khi có thay đổi
        if (localInvoices.length > 0) {
            // Chi tiết hơn về các hóa đơn (bỏ log)
        }
    }, [localInvoices]);

    // Sử dụng useFocusEffect để kiểm tra khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            // Tạo một biến để theo dõi component đã unmount chưa
            let isMounted = true;
            

            // Nếu không có token hoặc đang logout, không gọi API
            if (!token) {
                
                return;
            }

            // Kiểm tra role trước khi quyết định gọi API
            if (isLandlord) {
                
                dispatch(fetchInvoices({
                    token,
                    page: 1,
                    limit: 10,
                    status: selectedStatus || undefined
                }));
                return;
            }

            // Chỉ gọi API check người ở cùng nếu là người thuê và có token
            if (user?.role === 'nguoiThue') {
                

                const checkAndLoadData = async () => {
                    try {
                        if (!isMounted) return;

                        
                        const result = await checkUserIsCoTenant(token);

                        // Nếu component unmounted trong quá trình gọi API, dừng lại
                        if (!isMounted) return;

                        
                        const isCoTenant = result.success && result.isCoTenant;
                        setIsUserCoTenant(isCoTenant);

                        

                        if (isCoTenant) {
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

                    } catch (error) {
                        console.error('Error in checkAndLoadData:', error);

                        // Nếu có lỗi, vẫn đảm bảo gọi API lấy hóa đơn thông thường
                        if (isMounted) {
                            setIsUserCoTenant(false);
                            dispatch(fetchInvoices({
                                token,
                                page: 1,
                                limit: 10,
                                status: selectedStatus || undefined
                            }));
                        }
                    }
                };

                // Gọi hàm check ngay lập tức
                checkAndLoadData();
            } else {
                // Người dùng không phải landlord và không phải tenant
                
            }

            // Cleanup function
            return () => {
                isMounted = false;
                
            };
        }, [dispatch, token, isLandlord, user?.role, selectedStatus])
    );

    // Thêm lại useEffect cho các thay đổi về bộ lọc
    useEffect(() => {
        // CHỈ gọi API khi đã xác định được trạng thái isUserCoTenant và có token
        if (token && isUserCoTenant !== undefined) {
            
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
    }, [dispatch, token, selectedStatus]); // Bỏ isUserCoTenant khỏi dependency để tránh gọi API trùng lặp

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []); // ✅ Empty dependency array is correct for cleanup

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
            // Kiểm tra loại hóa đơn để gọi đúng API
            if (isUserCoTenant) {
                dispatch(
                    fetchRoommateInvoices({
                        token,
                        page: pagination.page + 1,
                        limit: pagination.limit,
                        status: selectedStatus || undefined,
                    }),
                );
            } else {
                dispatch(
                    fetchInvoices({
                        token,
                        page: pagination.page + 1,
                        limit: pagination.limit,
                        status: selectedStatus || undefined,
                    }),
                );
            }
        }
    };

    const handleInvoicePress = (invoice: Invoice) => {
        // Kiểm tra xem invoice có ID hay không
        let invoiceId = invoice._id || invoice.id;
        if (!invoiceId) {
            showError('Không thể mở chi tiết hóa đơn này');
            return;
        }

        // Đảm bảo invoiceId là string
        invoiceId = invoiceId.toString();

        // Kiểm tra nếu đây là hóa đơn của người ở cùng
        if (invoice.isRoommate === true) {
            // Điều hướng đến màn hình chi tiết hóa đơn người ở cùng
            navigation.navigate('RoommateInvoiceDetails', { invoiceId });
        } else {
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
    const dateAnimRef = useRef(new Animated.Value(0)).current;
    const sortAnimRef = useRef(new Animated.Value(0)).current;

    // Get animation reference for a specific dropdown
    const getAnimationForDropdown = (dropdownType: FilterType | null): Animated.Value => {
        switch (dropdownType) {
            case 'status': return statusAnimRef;
            case 'room': return roomAnimRef;
            case 'tenant': return tenantAnimRef;
            case 'date': return dateAnimRef;
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
        const allDropdowns: FilterType[] = ['status', 'room', 'tenant', 'date', 'sort'];

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
            { id: 'date', label: 'Thời gian' },
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
                                            selectedStatus === 'pending_confirmation' ? 'Chờ xác nhận' :
                                            selectedStatus === 'paid' ? 'Đã thanh toán' :
                                                selectedStatus === 'overdue' ? 'Quá hạn' : ''}`

                                }
                                {tab.id === 'room' && selectedRoom &&
                                    `: ${uniqueRooms.find(r => r.id === selectedRoom)?.name || ''}`
                                }
                                {tab.id === 'tenant' && selectedTenant &&
                                    `: ${uniqueTenants.find(t => t.id === selectedTenant)?.name || ''}`
                                }
                                {tab.id === 'date' && (
                                    (() => {
                                        const fmt = (d?: Date | null) => {
                                            if (!d) {return '';}
                                            const dd = d.getDate().toString().padStart(2, '0');
                                            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
                                            const yy = d.getFullYear();
                                            return `${dd}/${mm}/${yy}`;
                                        };
                                        const label = startDateFilter || endDateFilter
                                            ? `: ${fmt(startDateFilter)}${startDateFilter || endDateFilter ? ' - ' : ''}${fmt(endDateFilter)}`
                                            : '';
                                        return label;
                                    })()
                                )}
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
            case 'date':
                return renderDateFilter();
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

    const renderDateFilter = () => {
        const fmt = (d?: Date | null) => {
            if (!d) {return 'Chọn ngày';}
            const dd = d.getDate().toString().padStart(2, '0');
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const yy = d.getFullYear();
            return `${dd}/${mm}/${yy}`;
        };

        const clearDates = () => {
            setStartDateFilter(null);
            setEndDateFilter(null);
        };

        return (
            <View style={styles.dropdownOptionsContainer}>
                <View style={styles.dateRow}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setOpenStartPicker(true)}>
                        <Text style={styles.dateButtonText}>Từ: {fmt(startDateFilter)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setOpenEndPicker(true)}>
                        <Text style={styles.dateButtonText}>Đến: {fmt(endDateFilter)}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.dateActionsRow}>
                    <TouchableOpacity style={styles.clearDateBtn} onPress={clearDates}>
                        <Text style={styles.clearDateBtnText}>Xóa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyDateBtn} onPress={() => setOpenDropdown(null)}>
                        <Text style={styles.applyDateBtnText}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>

                <DatePicker
                    modal
                    open={openStartPicker}
                    date={startDateFilter || new Date()}
                    mode="date"
                    locale="vi"
                    title="Chọn ngày bắt đầu"
                    confirmText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={(date) => {
                        setOpenStartPicker(false);
                        setStartDateFilter(date);
                        
                        // Tự động set endDateFilter thành 1 tháng sau startDateFilter
                        const endDate = new Date(date);
                        endDate.setMonth(endDate.getMonth() + 1);
                        setEndDateFilter(endDate);
                    }}
                    onCancel={() => setOpenStartPicker(false)}
                />

                <DatePicker
                    modal
                    open={openEndPicker}
                    date={endDateFilter || new Date()}
                    mode="date"
                    locale="vi"
                    title="Chọn ngày kết thúc"
                    confirmText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={(date) => {
                        if (startDateFilter && date < startDateFilter) {
                            showError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
                            return setOpenEndPicker(false);
                        }
                        setEndDateFilter(date);
                        setOpenEndPicker(false);
                    }}
                    onCancel={() => setOpenEndPicker(false)}
                />
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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa hóa đơn';
            showError(errorMessage);
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

    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
            <View style={{ paddingTop: statusBarHeight, alignItems: 'center', marginBottom: 30 }}>
                <UIHeader
                    title="Tất cả hóa đơn"
                    iconLeft={'back'}
                    onPressLeft={handleBackToProfile}
                />
            </View>

            {/* Badge thông báo hiển thị cả 2 loại hóa đơn */}
            <View style={styles.mixedInvoiceBadge}>
                <Text style={styles.mixedInvoiceText}>
                    📋 Hiển thị cả hóa đơn thường và hóa đơn người ở cùng
                </Text>
            </View>



            {/* Thanh tìm kiếm */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm hóa đơn, phòng, người thuê..."
                        placeholderTextColor={Colors.mediumGray}
                        value={searchText}
                        onChangeText={setSearchText}
                        clearButtonMode="while-editing"
                    />
                    <Image
                        source={require('../../assets/icons/icon_search.png')}
                        style={styles.searchIcon}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setSearchText('')}
                        >
                            <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
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



            <LoadingAnimationWrapper 
                visible={isFocused && loading && !isRefreshing}
                message="Đang tải danh sách hóa đơn..."
                size="large"
            />

            <FlatList
                data={localInvoices.length > 0 ? localInvoices : invoices}
                keyExtractor={(item, index) => {
                    // Tạo key duy nhất cho mỗi item
                    const baseId = item._id?.toString() || item.id?.toString() || item.invoiceNumber;
                    // Fallback ổn định theo index nếu thiếu ID/mã hóa đơn
                    const stableKey = baseId || `invoice-idx-${index}`;
                    // Thêm hậu tố isRoommate để đảm bảo tính duy nhất giữa 2 loại
                    return item.isRoommate ? `${stableKey}-roommate` : stableKey;
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



            {/* Floating Action Buttons cho chủ trọ */}
            {isLandlord && (
                <View style={styles.fabBackgroundContainer}>
                    <View style={styles.fabContainer}>
                        <TouchableOpacity
                            style={styles.fabTemplate}
                            activeOpacity={0.8}
                            onPress={navigateToTemplates}
                        >
                            <Text style={styles.fabTemplateText}>Mẫu hóa đơn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.fabCreate}
                            activeOpacity={0.8}
                            onPress={handleCreateNewInvoice}
                        >
                            <Text style={styles.fabCreateText}>Tạo hóa đơn</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    // Badge thông báo hiển thị hỗn hợp hóa đơn
    mixedInvoiceBadge: {
        backgroundColor: '#F0F9FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    mixedInvoiceText: {
        color: '#0369A1',
        fontSize: 14,
        fontWeight: '600',
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(224, 224, 224, 0.8)',
    },
    activeTabButton: {
        backgroundColor: Colors.black,
        borderRadius: 50,
        borderWidth: 0,
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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

    flatListContent: {
        paddingBottom: 120, // Space for bottom FAB background container
        paddingTop: 0, // Ensure no extra padding at top
    },
    fabBackgroundContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: Colors.black,
        borderRadius: 50,
        padding: 12,
        zIndex: 999,
    },
    fabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    fabTemplate: {
        backgroundColor: Colors.darkGray,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 8,
    },
    fabCreate: {
        backgroundColor: '#BAFD00',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginLeft: 8,
    },
    fabTemplateText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    fabCreateText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    // Dropdown styles
    dropdownsContainer: {
        paddingVertical: 8,
        backgroundColor: 'transparent',
        marginHorizontal: 0,
        marginTop: 2,
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
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        minHeight: 40,
    },
    activeDropdownButton: {
        borderColor: Colors.darkGreen,
        borderRadius: 50,
        borderWidth: 2,
        backgroundColor: Colors.brandPrimarySoft,
    },
    dropdownButtonText: {
        color: Colors.dearkOlive,
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
        marginRight: 6,
    },
    dropdownIcon: {
        width: 10,
        height: 10,
        resizeMode: 'contain',
        tintColor: Colors.dearkOlive,
    },
    dropdownIconRotated: {
        transform: [{ rotate: '180deg' }],
        tintColor: Colors.darkGreen,
    },
    dropdownOptionsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 20,
        marginTop: 6,
        padding: 6,
        borderWidth: 0,
        maxHeight: 300,
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: responsiveSpacing(20),
        borderRadius: 50,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(242, 242, 242, 0.4)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        marginBottom: 2,
    },
    dropdownOptionSelected: {
        backgroundColor: Colors.brandPrimarySoft,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Colors.darkGreen,
    },
    dropdownOptionText: {
        fontSize: 15,
        color: Colors.dearkOlive,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    dropdownOptionTextSelected: {
        fontWeight: '700',
        color: Colors.darkGreen,
        letterSpacing: 0.3,
    },
    checkIcon: {
        width: 18,
        height: 18,
        tintColor: Colors.darkGreen,
    },
    dropdownContentWrapper: {
        marginHorizontal: 16,
        zIndex: 100,
    },
    // Styles cho thanh tìm kiếm
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: Colors.backgroud,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: Colors.mediumGray,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        paddingVertical: 0,
    },
    clearButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: Colors.lightGray || '#F0F0F0',
        marginLeft: 8,
    },
    clearButtonText: {
        color: Colors.mediumGray,
        fontSize: 14,
        fontWeight: '600',
    },
    // Date filter styles
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    dateButton: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    dateButtonText: {
        color: Colors.dearkOlive,
        fontWeight: '600',
    },
    dateActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 6,
        gap: 8,
    },
    clearDateBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
    },
    clearDateBtnText: {
        color: Colors.dearkOlive,
        fontWeight: '600',
    },
    applyDateBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.primaryGreen,
        marginLeft: 6,
    },
    applyDateBtnText: {
        color: Colors.black,
        fontWeight: '700',
    },
});

export default BillScreen;