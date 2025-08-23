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
    Alert,
    TextInput,
    Modal,
    BackHandler,
    FlatList,
    Dimensions,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import {
    fetchInvoiceDetails,
    updateInvoice,
    resetUpdateInvoiceState,
    addCustomInvoiceItem,
    resetAddItemState,
    updateInvoiceItems,
    resetUpdateItemsState,
    deleteInvoiceItem,
    resetDeleteItemState,
    updateInvoiceInStore,
    completeInvoice,
    saveInvoiceAsTemplate,
    resetSaveTemplateState,
    resetCompleteInvoiceState,
} from '../../store/slices/billSlice';
import { RootStackParamList } from '../../types/route';
import { SCREEN, scale, verticalScale, responsiveSpacing } from '../../utils/responsive';
import { Invoice, InvoiceItem } from '../../types/Bill';
import { Icons } from '../../assets/icons';
import SaveTemplateModal from './components/SaveTemplateModal';
import { AddCustomItemModal } from './components';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';
import LoadingAnimationWrapper from '../../components/LoadingAnimationWrapper';
import { getPreviousInvoice } from '../../store/services/billService';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';

type EditInvoiceRouteProps = RouteProp<RootStackParamList, 'EditInvoice'>;

const EditInvoiceScreen = () => {
    const route = useRoute<EditInvoiceRouteProps>();
    const { invoiceId } = route.params;
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { token, user } = useAppSelector(state => state.auth);
    
    // Sử dụng CustomAlertModal hook
    const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
    
    const {
        selectedInvoice,
        loading,
        error,
        updateInvoiceLoading,
        updateInvoiceSuccess,
        updateInvoiceError,
        addItemLoading,
        addItemSuccess,
        addItemError,
        updateItemsLoading,
        updateItemsSuccess,
        updateItemsError,
        deleteItemLoading,
        deleteItemSuccess,
        deleteItemError,
        saveTemplateLoading,
        saveTemplateSuccess,
        saveTemplateError,
    } = useAppSelector(state => state.bill);

    // Local state for editable fields
    const [note, setNote] = useState(selectedInvoice?.note || '');
    const [dueDate, setDueDate] = useState('');
    const [dueDateObj, setDueDateObj] = useState<Date | undefined>(
        selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate) : undefined
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // State cho modal lưu mẫu
    const [saveTemplateModalVisible, setSaveTemplateModalVisible] = useState(false);

    // String state for input fields to prevent resetting to 0
    const [itemInputs, setItemInputs] = useState<{
        [itemId: string]: {
            name?: string;
            description?: string;
            previousReading?: string;
            currentReading?: string;
            quantity?: string;
            unitPrice?: string;
        }
    }>({});

    // State để theo dõi lỗi của các input
    const [inputErrors, setInputErrors] = useState<{
        [itemId: string]: {
            name?: string;
            description?: string;
            previousReading?: string;
            currentReading?: string;
            quantity?: string;
            unitPrice?: string;
        }
    }>({});

    // Custom item modal state (moved to separate component)
    const [customItemModalVisible, setCustomItemModalVisible] = useState(false);
    const [customItemLoading, setCustomItemLoading] = useState(false);

    // State để theo dõi xem hóa đơn đã được lưu thành mẫu hay chưa
    const [hasBeenSavedAsTemplate, setHasBeenSavedAsTemplate] = useState(false);

    // State để lưu trữ dữ liệu ban đầu của hóa đơn
    const [initialInvoiceData, setInitialInvoiceData] = useState({
        dueDate: '',
        note: '',
        items: [] as InvoiceItem[],
    });

    // State để lưu trữ dữ liệu hóa đơn kỳ trước
    const [previousInvoiceData, setPreviousInvoiceData] = useState<{
        invoice: Invoice | null;
        meterReadings: { [itemName: string]: { previousReading: number; currentReading: number } };
        period: { month: number; year: number } | null;
    }>({
        invoice: null,
        meterReadings: {},
        period: null,
    });

    // State để theo dõi việc đã áp dụng chỉ số từ kỳ trước chưa
    const [hasAppliedPreviousReadings, setHasAppliedPreviousReadings] = useState(false);

    // State để loading việc lấy dữ liệu kỳ trước
    const [loadingPreviousInvoice, setLoadingPreviousInvoice] = useState(false);

    // Load invoice details
    useEffect(() => {
        if (token && invoiceId) {
            dispatch(fetchInvoiceDetails({ token, invoiceId }));
        }

        // Reset states when component unmounts
        return () => {
            dispatch(resetUpdateInvoiceState());
            dispatch(resetAddItemState());
            dispatch(resetUpdateItemsState());
            dispatch(resetDeleteItemState());
        };
    }, [dispatch, token, invoiceId]);

    // Initialize form with invoice data when available
    useEffect(() => {
        if (selectedInvoice) {
            setNote(selectedInvoice.note || '');

            // Set due date string and date object
            if (selectedInvoice.dueDate) {
                const dueDateDate = new Date(selectedInvoice.dueDate);
                // Kiểm tra nếu đã quá ngày hết hạn (so sánh theo ngày, bỏ qua thời gian)
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const dueDayOnly = new Date(
                    dueDateDate.getFullYear(),
                    dueDateDate.getMonth(),
                    dueDateDate.getDate()
                );

                if (dueDayOnly < today) {
                    // Nếu quá hạn: tự động đặt lại = hôm nay + 5 ngày
                    const newDue = new Date(today);
                    newDue.setDate(newDue.getDate() + 5);
                    setDueDateObj(newDue);
                    setDueDate(formatDate(newDue.toISOString()));
                } else {
                    // Chưa quá hạn: giữ nguyên
                    setDueDateObj(dueDateDate);
                    setDueDate(formatDate(selectedInvoice.dueDate));
                }
            }

            if (selectedInvoice.items && selectedInvoice.items.length > 0) {
                setInvoiceItems([...selectedInvoice.items]);

                // Initialize string inputs for meter readings, quantities, and unit prices
                const newItemInputs: {
                    [itemId: string]: {
                        name?: string;
                        description?: string;
                        previousReading?: string;
                        currentReading?: string;
                        quantity?: string;
                        unitPrice?: string;
                    }
                } = {};

                selectedInvoice.items.forEach((item, index) => {
                    const itemKey = item._id || `item-${index}`;

                    // Initialize meter readings
                    newItemInputs[itemKey] = {
                        name: item.name,
                        description: item.description,
                        previousReading: item.previousReading?.toString() || '0',
                        currentReading: item.currentReading?.toString() || '0',
                        quantity: item.quantity?.toString() || '0',
                        unitPrice: item.unitPrice?.toString() || '0',
                    };
                });

                setItemInputs(newItemInputs);
            }

            setTotalAmount(selectedInvoice.totalAmount);

            // Lưu trữ dữ liệu ban đầu để so sánh sau này
            setInitialInvoiceData({
                dueDate: selectedInvoice.dueDate || '',
                note: selectedInvoice.note || '',
                items: JSON.parse(JSON.stringify(selectedInvoice.items || [])),
            });
        }
    }, [selectedInvoice]);

    // Handle hardware back button
    useEffect(() => {
        const backHandler = () => {
            handleBackPress();
            return true; // Prevent default behavior
        };

        // Add event listener for hardware back button on Android
        const backHandlerSubscription = Platform.OS === 'android'
            ? BackHandler.addEventListener('hardwareBackPress', backHandler)
            : { remove: () => { } };

        // Clean up
        return () => {
            backHandlerSubscription.remove();
        };
    }, [navigation, token, selectedInvoice]);

    // Handle update success
    useEffect(() => {
        if (updateInvoiceSuccess) {

        }

        if (updateInvoiceError) {

            showError(`Không thể cập nhật hóa đơn: ${updateInvoiceError}`);
            dispatch(resetUpdateInvoiceState());

        }
    }, [updateInvoiceSuccess, updateInvoiceError, dispatch, navigation]);

    // Handle add custom item success/error
    useEffect(() => {
        if (addItemSuccess) {


            // Reset form and close modal
            resetCustomItemForm();
            setCustomItemModalVisible(false);

            // Refresh invoice details to get updated data
            if (token && invoiceId) {
                dispatch(fetchInvoiceDetails({ token, invoiceId }));
            }
        }

        if (addItemError) {

            showError(`Không thể thêm khoản mục tùy chỉnh: ${addItemError}`);
            dispatch(resetAddItemState());

        }
    }, [addItemSuccess, addItemError, dispatch, token, invoiceId]);

    // Handle update items success/error
    useEffect(() => {
        if (updateItemsSuccess) {


            // Refresh invoice details to get updated data
            if (token && invoiceId) {
                dispatch(fetchInvoiceDetails({ token, invoiceId }));
            }
        }

        if (updateItemsError) {

            showError(`Không thể cập nhật khoản mục hóa đơn: ${updateItemsError}`);
            dispatch(resetUpdateItemsState());

        }
    }, [updateItemsSuccess, updateItemsError, dispatch, token, invoiceId]);

    // Handle delete item success/error
    useEffect(() => {
        if (deleteItemSuccess) {

            showSuccess("Đã xóa khoản mục hóa đơn thành công!");
            dispatch(resetDeleteItemState());


            // Refresh invoice details to get updated data
            if (token && invoiceId) {
                dispatch(fetchInvoiceDetails({ token, invoiceId }));
            }
        }

        if (deleteItemError) {

            showError(`Không thể xóa khoản mục hóa đơn: ${deleteItemError}`);
            dispatch(resetDeleteItemState());

        }
    }, [deleteItemSuccess, deleteItemError, dispatch, token, invoiceId]);

    // Handle save template success/error
    useEffect(() => {
        if (saveTemplateSuccess) {
            setHasBeenSavedAsTemplate(true);

            showSuccess("Đã lưu mẫu hóa đơn thành công!");
            dispatch(resetSaveTemplateState());

            setSaveTemplateModalVisible(false);
        }

        if (saveTemplateError) {
            showError(`Không thể lưu mẫu hóa đơn: ${saveTemplateError}`);
            dispatch(resetSaveTemplateState());

        }
    }, [saveTemplateSuccess, saveTemplateError, dispatch]);

    // Helper function to safely access nested properties
    const getNestedValue = (obj: any, path: string, defaultValue: any = undefined) => {
        if (!obj) {return defaultValue;}

        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result === null || result === undefined || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }

        return result !== undefined ? result : defaultValue;
    };

    // Helper function to check if invoice can be edited
    const canEditInvoice = () => {
        return selectedInvoice && (selectedInvoice.status === 'draft' || selectedInvoice.status === 'overdue');
    };

    // Format date function
    const formatDate = (dateString?: string) => {
        if (!dateString) {return '';}
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Show date picker
    const showDueDatePicker = () => {
        setShowDatePicker(true);
    };

    // Handle date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDueDateObj(selectedDate);
            setDueDate(formatDate(selectedDate.toISOString()));
        }
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

    // Get category text
    const getCategoryText = (category: string) => {
        switch (category) {
            case 'rent':
                return 'Tiền thuê';
            case 'utility':
                return 'Thiết yếu';
            case 'service':
                return 'Dịch vụ';
            case 'maintenance':
                return 'Bảo trì';
            default:
                return 'Khác';
        }
    };

    // Update meter readings for variable items
    const updateMeterReading = (itemId: string, field: 'previousReading' | 'currentReading', value: string) => {
        const newItems = [...invoiceItems];
        const itemIndex = newItems.findIndex(item => item._id === itemId);
        if (itemIndex === -1) {return;}

        const item = newItems[itemIndex];

        // Update string input state
        setItemInputs(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            },
        }));

        // ✅ DEBUG: Log meter reading update
        console.log(`🔢 Updating meter reading for item ${itemId}:`, {
            field,
            value,
            itemName: item.name
        });

        // Validate input
        let errorMessage = '';

        // Kiểm tra rỗng
        if (value.trim() === '') {
            errorMessage = 'Không được để trống';
        }
        // Kiểm tra không phải số
        else if (!/^\d+$/.test(value)) {
            errorMessage = 'Chỉ được nhập số';
        }
        // Kiểm tra số âm
        else if (parseInt(value) < 0) {
            errorMessage = 'Không được nhập số âm';
        }
        // Kiểm tra chỉ số mới không thấp hơn chỉ số cũ
        else if (field === 'currentReading') {
            const prevReading = item.previousReading || 0;
            const inputPrevReading = itemInputs[itemId]?.previousReading;

            // Lấy chỉ số cũ từ input nếu có, nếu không thì lấy từ item
            const actualPrevReading = inputPrevReading !== undefined ?
                (inputPrevReading === '' ? 0 : parseInt(inputPrevReading)) :
                prevReading;

            if (parseInt(value) < actualPrevReading) {
                errorMessage = 'Chỉ số mới không thể thấp hơn chỉ số cũ';
            }
        }

        // Cập nhật trạng thái lỗi
        setInputErrors(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: errorMessage,
            },
        }));

        // Only update numeric value if there's no error
        if (!errorMessage) {
            const reading = parseInt(value);
            newItems[itemIndex][field] = reading;

            // Nếu đang cập nhật chỉ số cũ, tự động cập nhật chỉ số mới = chỉ số cũ + 1
            if (field === 'previousReading') {
                // Không tự động cập nhật chỉ số mới
            }

            // Recalculate amount for variable items
            if (newItems[itemIndex].type === 'variable') {
                // Lấy giá trị chỉ số từ input hoặc từ item
                const currentReading = field === 'currentReading' ? reading :
                    (itemInputs[itemId]?.currentReading !== undefined && itemInputs[itemId]?.currentReading !== '' ?
                        parseInt(itemInputs[itemId]?.currentReading || '0') :
                        (item.currentReading || 0));

                const previousReading = field === 'previousReading' ? reading :
                    (itemInputs[itemId]?.previousReading !== undefined && itemInputs[itemId]?.previousReading !== '' ?
                        parseInt(itemInputs[itemId]?.previousReading || '0') :
                        (item.previousReading || 0));

                const usage = currentReading - previousReading;
                newItems[itemIndex].quantity = usage > 0 ? usage : 0;
                
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(item);
                if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
                    newItems[itemIndex].amount = newItems[itemIndex].quantity * newItems[itemIndex].unitPrice * item.personCount;
                } else {
                    newItems[itemIndex].amount = newItems[itemIndex].quantity * newItems[itemIndex].unitPrice;
                }
            }

            setInvoiceItems(newItems);
            recalculateTotalAmount(newItems);
        }
    };

    // Update item quantity and recalculate amount
    const updateItemQuantity = (itemId: string, value: string) => {
        const newItems = [...invoiceItems];
        const itemIndex = newItems.findIndex(item => item._id === itemId);
        if (itemIndex === -1) {return;}

        const item = newItems[itemIndex];

        // Update string input state
        setItemInputs(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: value,
            },
        }));

        // Validate input
        let errorMessage = '';

        // Kiểm tra rỗng
        if (value.trim() === '') {
            errorMessage = 'Không được để trống';
        }
        // Kiểm tra không phải số
        else if (!/^\d+$/.test(value)) {
            errorMessage = 'Chỉ được nhập số';
        }
        // Kiểm tra số âm
        else if (parseInt(value) < 0) {
            errorMessage = 'Không được nhập số âm';
        }

        // Cập nhật trạng thái lỗi
        setInputErrors(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: errorMessage,
            },
        }));

        // Only update numeric value if there's no error
        if (!errorMessage) {
            const quantity = parseInt(value);
            newItems[itemIndex].quantity = quantity;

            // Recalculate amount based on quantity and unit price
            if (newItems[itemIndex].type === 'fixed') {
                // Lấy đơn giá từ input hoặc từ item
                const unitPrice = itemInputs[itemId]?.unitPrice !== undefined && itemInputs[itemId]?.unitPrice !== '' ?
                    parseInt(itemInputs[itemId]?.unitPrice || '0') :
                    item.unitPrice;

                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(item);
                if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
                    newItems[itemIndex].amount = quantity * unitPrice * item.personCount;
                } else {
                    newItems[itemIndex].amount = quantity * unitPrice;
                }
            }

            setInvoiceItems(newItems);
            recalculateTotalAmount(newItems);
        }
    };

    // Update item unit price and recalculate amount
    const updateItemUnitPrice = (itemId: string, value: string) => {
        const newItems = [...invoiceItems];
        const itemIndex = newItems.findIndex(item => item._id === itemId);
        if (itemIndex === -1) {return;}

        const item = newItems[itemIndex];

        // Update string input state
        setItemInputs(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                unitPrice: value,
            },
        }));

        // Validate input
        let errorMessage = '';

        // Kiểm tra rỗng
        if (value.trim() === '') {
            errorMessage = 'Không được để trống';
        }
        // Kiểm tra không phải số
        else if (!/^\d+$/.test(value)) {
            errorMessage = 'Chỉ được nhập số';
        }
        // Kiểm tra số âm
        else if (parseInt(value) < 0) {
            errorMessage = 'Không được nhập số âm';
        }

        // Cập nhật trạng thái lỗi
        setInputErrors(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                unitPrice: errorMessage,
            },
        }));

        // Only update numeric value if there's no error
        if (!errorMessage) {
            const unitPrice = parseInt(value);
            newItems[itemIndex].unitPrice = unitPrice;

            // Recalculate amount based on quantity and unit price
            if (newItems[itemIndex].type === 'fixed') {
                // Lấy số lượng từ input hoặc từ item
                const quantity = itemInputs[itemId]?.quantity !== undefined && itemInputs[itemId]?.quantity !== '' ?
                    parseInt(itemInputs[itemId]?.quantity || '0') :
                    item.quantity;

                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(item);
                if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
                    newItems[itemIndex].amount = quantity * unitPrice * item.personCount;
                } else {
                    newItems[itemIndex].amount = quantity * unitPrice;
                }
            } else if (newItems[itemIndex].type === 'variable') {
                // Lấy giá trị chỉ số từ input hoặc từ item
                const currentReading = itemInputs[itemId]?.currentReading !== undefined && itemInputs[itemId]?.currentReading !== '' ?
                    parseInt(itemInputs[itemId]?.currentReading || '0') :
                    (item.currentReading || 0);

                const previousReading = itemInputs[itemId]?.previousReading !== undefined && itemInputs[itemId]?.previousReading !== '' ?
                    parseInt(itemInputs[itemId]?.previousReading || '0') :
                    (item.previousReading || 0);

                const usage = currentReading - previousReading;
                newItems[itemIndex].quantity = usage > 0 ? usage : 0;
                
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(item);
                if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
                    newItems[itemIndex].amount = newItems[itemIndex].quantity * unitPrice * item.personCount;
                } else {
                    newItems[itemIndex].amount = newItems[itemIndex].quantity * unitPrice;
                }
            }

            setInvoiceItems(newItems);
            recalculateTotalAmount(newItems);
        }
    };

    // Recalculate total amount
    const recalculateTotalAmount = (items: InvoiceItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(subtotal);
    };

    // Reset custom item form
    const resetCustomItemForm = () => {
        // No-op after extracting modal; form state lives inside modal component
    };

    // Handle add custom item
    // replaced by new onSave from AddCustomItemModal

    // Handle back button press - chỉ quay về màn hình trước
    const handleBackPress = () => {
            navigation.goBack();
    };

    // Handle save draft
    const handleSaveDraft = () => {
        if (!token || !selectedInvoice) {
            showError("Không thể lưu nháp. Thiếu thông tin cần thiết.");
            return;
        }

        // Kiểm tra lỗi trước khi lưu nháp
        if (hasFormErrors()) {
            showError("Vui lòng nhập hợp lệ tất cả các trường trước khi lưu nháp.");
            return;
        }

        // Hiển thị loading
        setIsLoading(true);

        // Lưu thông tin quan trọng
        const originalRoomId = selectedInvoice.roomId;
        const originalTenantId = selectedInvoice.tenantId;
        const originalContractId = selectedInvoice.contractId;

        // Cập nhật invoiceItems với dữ liệu mới nhất từ itemInputs
        const updatedItems = invoiceItems.map(item => {
            const itemId = item._id || '';
            const inputData = itemInputs[itemId];

            if (!inputData) return item;

            const updatedItem = { ...item };

            // Cập nhật các trường từ itemInputs
            if (inputData.name !== undefined) {
                updatedItem.name = inputData.name;
            }

            if (inputData.description !== undefined) {
                updatedItem.description = inputData.description;
            }

            if (inputData.previousReading !== undefined) {
                updatedItem.previousReading = inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading);
            }

            if (inputData.currentReading !== undefined) {
                updatedItem.currentReading = inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading);
            }

            // Tính toán lại amount
            if (updatedItem.type === 'fixed') {
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            } else if (updatedItem.type === 'variable') {
                const usage = (updatedItem.currentReading || 0) - (updatedItem.previousReading || 0);
                updatedItem.quantity = usage > 0 ? usage : 0;
                
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            }

            return updatedItem;
        });

        // Cập nhật state với dữ liệu mới
        setInvoiceItems(updatedItems);

        // Tính lại tổng tiền
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(newTotalAmount);

        // Chuẩn bị dữ liệu cập nhật
        const dueDateISO = dueDateObj ? dueDateObj.toISOString() : undefined;
        const basicUpdateData = { dueDate: dueDateISO, note };
        const editableItems = getEditableItemsData(updatedItems);

        // Cập nhật store trước để UI hiển thị ngay
        const updatedInvoice = {
            ...selectedInvoice,
            dueDate: dueDateISO || selectedInvoice.dueDate,
            note: note || selectedInvoice.note,
            roomId: originalRoomId,
            tenantId: originalTenantId,
            contractId: originalContractId,
            items: updatedItems,
            totalAmount: newTotalAmount
        };

        // Thực hiện lưu theo thứ tự: khoản mục trước, sau đó là thông tin cơ bản
        const saveItems = () => {
            // ✅ DEBUG: Log trước khi gửi API
            console.log('Sending editableItems to API:', editableItems);
            
            if (editableItems.length > 0) {
                return dispatch(updateInvoiceItems({
                    token,
                    invoiceId,
                    items: editableItems
                })).unwrap();
            }
            return Promise.resolve();
        };

        // Lưu khoản mục trước
        saveItems()
            .then(() => {
                // Sau khi lưu khoản mục, lưu thông tin cơ bản
                return dispatch(updateInvoice({
                    token,
                    invoiceId,
                    updateData: basicUpdateData,
                    updateType: 'basic'
                })).unwrap();
            })
            .then(() => {
                // Cập nhật store sau khi lưu thành công
                dispatch(updateInvoiceInStore(updatedInvoice));

                // ✅ Cập nhật initialInvoiceData để reset trạng thái "đã thay đổi"
                setInitialInvoiceData({
                    dueDate: dueDateISO || selectedInvoice.dueDate,
                    note: note || selectedInvoice.note,
                    items: JSON.parse(JSON.stringify(updatedItems)),
                });

                // Hiển thị thông báo thành công
                showSuccess("Đã lưu nháp hóa đơn thành công!");

                // Đặt lại trạng thái loading
                setIsLoading(false);

                // ✅ Không navigate - để user tiếp tục chỉnh sửa
                console.log('✅ Lưu nháp thành công - vẫn ở màn hình chỉnh sửa');
            })
            .catch((error) => {
                setIsLoading(false);
                showError("Không thể lưu nháp hóa đơn. Vui lòng thử lại.");
            });
    };

    // Kiểm tra xem có lỗi nào trong form không
    const hasFormErrors = () => {
        // Kiểm tra tất cả các lỗi trong inputErrors
        for (const itemId in inputErrors) {
            const errors = inputErrors[itemId];
            if (errors) {
                for (const field in errors) {
                    if (errors[field as keyof typeof errors]) {
                        return true;
                    }
                }
            }
        }

        // Kiểm tra các trường bắt buộc có giá trị hợp lệ không
        for (const itemId in itemInputs) {
            const inputs = itemInputs[itemId];
            if (inputs) {
                // Kiểm tra chỉ số đồng hồ: chỉ áp dụng khi được phép sửa (perUsage)
                const item = invoiceItems.find(item => item._id === itemId);
                const priceType = item ? getItemPriceType(item) : null;
                if (priceType === 'perUsage' && inputs.previousReading !== undefined && inputs.previousReading.trim() === '') {
                    setInputErrors(prev => ({
                        ...prev,
                        [itemId]: {
                            ...prev[itemId],
                            previousReading: 'Không được để trống',
                        },
                    }));
                    return true;
                }

                if (priceType === 'perUsage' && inputs.currentReading !== undefined && inputs.currentReading.trim() === '') {
                    setInputErrors(prev => ({
                        ...prev,
                        [itemId]: {
                            ...prev[itemId],
                            currentReading: 'Không được để trống',
                        },
                    }));
                    return true;
                }

                // Kiểm tra chỉ số đồng hồ bằng 0
                if (priceType === 'perUsage' && item && item.type === 'variable') {
                    const prevReading = inputs.previousReading !== undefined ?
                        parseInt(inputs.previousReading || '0') :
                        (item.previousReading || 0);

                    const currReading = inputs.currentReading !== undefined ?
                        parseInt(inputs.currentReading || '0') :
                        (item.currentReading || 0);

                    // Kiểm tra chỉ số cũ bằng 0
                    if (prevReading === 0) {
                        setInputErrors(prev => ({
                            ...prev,
                            [itemId]: {
                                ...prev[itemId],
                                previousReading: 'Chỉ số không được bằng 0',
                            },
                        }));
                        return true;
                    }

                    // Kiểm tra chỉ số mới bằng 0
                    if (currReading === 0) {
                        setInputErrors(prev => ({
                            ...prev,
                            [itemId]: {
                                ...prev[itemId],
                                currentReading: 'Chỉ số không được bằng 0',
                            },
                        }));
                        return true;
                    }
                }

                // Không kiểm tra số lượng vì không cho phép chỉnh sửa

                // Không yêu cầu đơn giá (đơn giá không thể chỉnh sửa)
            }
        }

        // Kiểm tra các khoản mục có chỉ số bằng 0 nhưng không có trong itemInputs
        for (const item of invoiceItems) {
            const priceType = getItemPriceType(item);
            if (priceType === 'perUsage' && item.type === 'variable' && item._id) {
                const itemId = item._id;

                // Nếu không có trong itemInputs, kiểm tra giá trị trực tiếp từ item
                if (!itemInputs[itemId] ||
                    (itemInputs[itemId].previousReading === undefined &&
                        itemInputs[itemId].currentReading === undefined)) {

                    if (item.previousReading === 0) {
                        setInputErrors(prev => ({
                            ...prev,
                            [itemId]: {
                                ...prev[itemId],
                                previousReading: 'Chỉ số không được bằng 0',
                            },
                        }));
                        return true;
                    }

                    if (item.currentReading === 0) {
                        setInputErrors(prev => ({
                            ...prev,
                            [itemId]: {
                                ...prev[itemId],
                                currentReading: 'Chỉ số không được bằng 0',
                            },
                        }));
                        return true;
                    }
                }
            }
        }

        return false;
    };

    // Kiểm tra xem hóa đơn có thay đổi so với dữ liệu ban đầu hay không
    const hasInvoiceChanged = () => {
        // So sánh ngày đến hạn
        const currentDueDate = dueDateObj ? dueDateObj.toISOString() : '';
        if (currentDueDate !== initialInvoiceData.dueDate) {
            return true;
        }

        // So sánh ghi chú
        if (note !== initialInvoiceData.note) {
            return true;
        }

        // So sánh các khoản mục
        if (invoiceItems.length !== initialInvoiceData.items.length) {
            return true;
        }

        // Kiểm tra chi tiết từng khoản mục
        for (let i = 0; i < invoiceItems.length; i++) {
            const currentItem = invoiceItems[i];
            const initialItem = initialInvoiceData.items.find(item => item._id === currentItem._id);

            if (!initialItem) {
                return true; // Khoản mục mới được thêm vào
            }

            // So sánh các trường quan trọng
            if (
                currentItem.name !== initialItem.name ||
                currentItem.description !== initialItem.description ||
                currentItem.quantity !== initialItem.quantity ||
                currentItem.unitPrice !== initialItem.unitPrice ||
                currentItem.previousReading !== initialItem.previousReading ||
                currentItem.currentReading !== initialItem.currentReading ||
                currentItem.amount !== initialItem.amount
            ) {
                return true;
            }

            // Kiểm tra các giá trị trong ô input
            const itemId = currentItem._id || '';
            const inputData = itemInputs[itemId];

            if (inputData) {
                // Kiểm tra tên
                if (inputData.name !== undefined && inputData.name !== initialItem.name) {
                    return true;
                }

                // Kiểm tra mô tả
                if (inputData.description !== undefined && inputData.description !== initialItem.description) {
                    return true;
                }

                // Kiểm tra chỉ số đồng hồ trước
                if (inputData.previousReading !== undefined) {
                    const prevReading = inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading);
                    if (prevReading !== initialItem.previousReading) {
                        return true;
                    }
                }

                // Kiểm tra chỉ số đồng hồ hiện tại
                if (inputData.currentReading !== undefined) {
                    const currReading = inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading);
                    if (currReading !== initialItem.currentReading) {
                        return true;
                    }
                }

                // Kiểm tra số lượng
                if (inputData.quantity !== undefined) {
                    const qty = inputData.quantity === '' ? 0 : parseInt(inputData.quantity);
                    if (qty !== initialItem.quantity) {
                        return true;
                    }
                }

                // Kiểm tra đơn giá
                if (inputData.unitPrice !== undefined) {
                    const price = inputData.unitPrice === '' ? 0 : parseInt(inputData.unitPrice);
                    if (price !== initialItem.unitPrice) {
                        return true;
                    }
                }
            }
        }

        return false; // Không có thay đổi
    };

    // Tối ưu hóa handleSaveAndGoBack
    const handleSaveAndGoBack = () => {
        // Nếu đã lưu mẫu, chỉ quay lại màn hình trước đó
        if (hasBeenSavedAsTemplate) {
            navigation.navigate('Bill');
            return;
        }

        // Nếu không có thay đổi, chỉ quay lại màn hình trước đó
        if (!hasInvoiceChanged()) {
            navigation.navigate('Bill');
            return;
        }

        // Xử lý lưu và quay lại như bình thường nếu có thay đổi
        if (!token || !selectedInvoice) {
            navigation.navigate('Bill');
            return;
        }

        // Kiểm tra lỗi trước khi lưu
        if (hasFormErrors()) {

            showError("Vui lòng nhập hợp lệ tất cả các trường trước khi lưu.");

            return;
        }

        // Hiển thị loading
        setIsLoading(true);

        // Lưu thông tin quan trọng
        const originalRoomId = selectedInvoice.roomId;
        const originalTenantId = selectedInvoice.tenantId;
        const originalContractId = selectedInvoice.contractId;

        // Cập nhật invoiceItems với dữ liệu mới nhất từ itemInputs
        const updatedItems = invoiceItems.map(item => {
            const itemId = item._id || '';
            const inputData = itemInputs[itemId];

            if (!inputData) {return item;}

            const updatedItem = { ...item };

            // Cập nhật các trường từ itemInputs
            if (inputData.name !== undefined) {
                updatedItem.name = inputData.name;
            }

            if (inputData.description !== undefined) {
                updatedItem.description = inputData.description;
            }

            if (inputData.previousReading !== undefined) {
                updatedItem.previousReading = inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading);
            }

            if (inputData.currentReading !== undefined) {
                updatedItem.currentReading = inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading);
            }

            // Không cập nhật số lượng từ input

            // Không cập nhật đơn giá từ input

            // Tính toán lại amount
            if (updatedItem.type === 'fixed') {
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            } else if (updatedItem.type === 'variable') {
                const usage = (updatedItem.currentReading || 0) - (updatedItem.previousReading || 0);
                updatedItem.quantity = usage > 0 ? usage : 0;
                
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            }

            return updatedItem;
        });

        // Cập nhật state với dữ liệu mới
        setInvoiceItems(updatedItems);

        // Tính lại tổng tiền
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(newTotalAmount);

        // Chuẩn bị dữ liệu cập nhật
        const dueDateISO = dueDateObj ? dueDateObj.toISOString() : undefined;
        const basicUpdateData = { dueDate: dueDateISO, note };
        const editableItems = getEditableItemsData(updatedItems);

        // Cập nhật store trước để UI hiển thị ngay
        const updatedInvoice = {
            ...selectedInvoice,
            dueDate: dueDateISO || selectedInvoice.dueDate,
            note: note || selectedInvoice.note,
            roomId: originalRoomId,
            tenantId: originalTenantId,
            contractId: originalContractId,
            items: updatedItems,
            totalAmount: newTotalAmount,
        };

        // Thực hiện lưu theo thứ tự: khoản mục trước, sau đó là thông tin cơ bản
        const saveItems = () => {
            if (editableItems.length > 0) {
                return dispatch(updateInvoiceItems({
                    token,
                    invoiceId,
                    items: editableItems,
                })).unwrap();
            }
            return Promise.resolve();
        };

        // Lưu khoản mục trước
        saveItems()
            .then(() => {
                // Sau khi lưu khoản mục, lưu thông tin cơ bản
                return dispatch(updateInvoice({
                    token,
                    invoiceId,
                    updateData: basicUpdateData,
                    updateType: 'basic',
                })).unwrap();
            })
            .then(() => {
                // Cập nhật store sau khi lưu thành công
                dispatch(updateInvoiceInStore(updatedInvoice));

                // Điều hướng sau khi lưu thành công
                navigation.navigate('Bill');

                // Đặt lại trạng thái loading
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);

                // Vẫn điều hướng để tránh người dùng bị kẹt
                navigation.navigate('Bill');
            });
    };

    // Get editable items data for API - tối ưu hóa
    const getEditableItemsData = (items = invoiceItems) => {
        return items
            .filter(item => {
                // Sử dụng hàm getItemEditability để kiểm tra item có thể chỉnh sửa
                const editability = getItemEditability(item);
                // ✅ FIX: Chỉ filter items có ít nhất một trường có thể chỉnh sửa
                return item._id && (editability.isEditable || editability.canEditMeterReadings || editability.canEditDescription);
            })
            .map(item => {
                const itemId = item._id as string;
                const inputData = itemInputs[itemId];
                const editability = getItemEditability(item);
                const isUtility = item.category === 'utility';
                const priceType = getItemPriceType(item);
                const itemData: any = { itemId };

                // ✅ FIX: Luôn thêm description nếu có thể chỉnh sửa
                if (editability.canEditDescription) {
                    itemData.description = inputData?.description !== undefined ? inputData.description : item.description;
                }

                // ✅ FIX: Thêm chỉ số đồng hồ nếu có thể chỉnh sửa
                if (editability.canEditMeterReadings) {
                    itemData.previousReading = inputData?.previousReading !== undefined ?
                        (inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading)) :
                        item.previousReading;

                    itemData.currentReading = inputData?.currentReading !== undefined ?
                        (inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading)) :
                        item.currentReading;
                }

                // ✅ FIX: Thêm tên nếu có thể chỉnh sửa (cho custom items)
                if (editability.canEditName) {
                    itemData.name = inputData?.name || item.name;
                }

                // Thêm các trường cần thiết dựa trên loại item (legacy logic)
                if (isUtility) {
                    // Chỉ cập nhật chỉ số đồng hồ nếu priceType là perUsage
                    if (priceType === 'perUsage' && !editability.canEditMeterReadings) {
                        // Fallback cho trường hợp cũ
                        itemData.previousReading = inputData?.previousReading !== undefined ?
                            (inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading)) :
                            item.previousReading;

                        itemData.currentReading = inputData?.currentReading !== undefined ?
                            (inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading)) :
                            item.currentReading;
                    }
                } else if (!editability.canEditDescription && !editability.canEditMeterReadings) {
                    // Với các item khác, cập nhật các trường cơ bản (legacy)
                    itemData.name = inputData?.name || item.name;
                    itemData.description = inputData?.description !== undefined ? inputData.description : item.description;
                    // Không cho phép cập nhật đơn giá cho bất kỳ item nào
                }

                return itemData;
            });
    };

    // Tối ưu hóa handleIssueInvoice
    const handleIssueInvoice = () => {
        if (!token || !selectedInvoice) {return;}

        // Chặn phát hành nếu kỳ hóa đơn ở tương lai (chưa đến tháng đó)
        try {
            const now = new Date();
            let periodMonth: number | undefined;
            let periodYear: number | undefined;
            const p: any = selectedInvoice.period;
            if (typeof p === 'string') {
                const d = new Date(p);
                if (!isNaN(d.getTime())) {
                    periodMonth = d.getMonth() + 1;
                    periodYear = d.getFullYear();
                }
            } else if (p && typeof p === 'object' && 'month' in p && 'year' in p) {
                periodMonth = p.month;
                periodYear = p.year;
            }
            if (periodMonth && periodYear) {
                const nowMonth = now.getMonth() + 1;
                const nowYear = now.getFullYear();
                if (periodYear > nowYear || (periodYear === nowYear && periodMonth > nowMonth)) {
                    const mm = periodMonth.toString().padStart(2, '0');
                    showError(`Chưa đến kỳ hóa đơn ${mm}/${periodYear} nên không thể phát hành.`);
                    return;
                }
            }
        } catch (e) {
            // Nếu parse kỳ thất bại, bỏ qua kiểm tra để tránh chặn nhầm
        }

        // Kiểm tra lỗi trước khi phát hành
        if (hasFormErrors()) {

            showError("Vui lòng nhập hợp lệ tất cả các trường trước khi phát hành hóa đơn.");

            return;
        }

        // Hiển thị xác nhận phát hành
        const confirmMessage = selectedInvoice.status === 'overdue' 
            ? "Bạn có chắc chắn muốn cập nhật và phát hành lại hóa đơn quá hạn này không? Sau khi phát hành, hóa đơn sẽ được gửi đến người thuê và không thể chỉnh sửa."
            : "Bạn có chắc chắn muốn phát hành hóa đơn này không? Sau khi phát hành, hóa đơn sẽ được gửi đến người thuê và không thể chỉnh sửa.";

        showConfirm(
            confirmMessage,
            () => {
                        // Hiển thị loading
                        setIsLoading(true);


                        // Lưu thông tin quan trọng
                        const originalRoomId = selectedInvoice.roomId;
                        const originalTenantId = selectedInvoice.tenantId;
                        const originalContractId = selectedInvoice.contractId;

                        // Cập nhật invoiceItems với dữ liệu mới nhất từ itemInputs
                        const updatedItems = invoiceItems.map(item => {
                            const itemId = item._id || '';
                            const inputData = itemInputs[itemId];


                            if (!inputData) return item;


                            const updatedItem = { ...item };


                            // Cập nhật các trường từ itemInputs
                            if (inputData.name !== undefined) {
                                updatedItem.name = inputData.name;
                            }

                            if (inputData.description !== undefined) {
                                updatedItem.description = inputData.description;
                            }

                            if (inputData.previousReading !== undefined) {
                                updatedItem.previousReading = inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading);
                            }

                            if (inputData.currentReading !== undefined) {
                                updatedItem.currentReading = inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading);
                            }

                            if (inputData.quantity !== undefined) {
                                updatedItem.quantity = inputData.quantity === '' ? 0 : parseInt(inputData.quantity);
                            }

                            // Không cập nhật đơn giá từ input

                            // Tính toán lại amount
                            if (updatedItem.type === 'fixed') {
                                // Tính toán amount dựa trên priceType
                                const priceType = getItemPriceType(updatedItem);
                                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                                } else {
                                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                                }
                            } else if (updatedItem.type === 'variable') {
                                const usage = (updatedItem.currentReading || 0) - (updatedItem.previousReading || 0);
                                updatedItem.quantity = usage > 0 ? usage : 0;
                                
                                // Tính toán amount dựa trên priceType
                                const priceType = getItemPriceType(updatedItem);
                                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                                } else {
                                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                                }
                            }

                            return updatedItem;
                        });

                        // Cập nhật state với dữ liệu mới
                        setInvoiceItems(updatedItems);

                        // Tính lại tổng tiền
                        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
                        setTotalAmount(newTotalAmount);

                        // Chuẩn bị dữ liệu cập nhật
                        const dueDateISO = dueDateObj ? dueDateObj.toISOString() : undefined;
                        const basicUpdateData = { dueDate: dueDateISO, note };
                        const editableItems = getEditableItemsData(updatedItems);

                        // Cập nhật store trước để UI hiển thị ngay
                        const updatedInvoice = {
                            ...selectedInvoice,
                            dueDate: dueDateISO || selectedInvoice.dueDate,
                            note: note || selectedInvoice.note,
                            roomId: originalRoomId,
                            tenantId: originalTenantId,
                            contractId: originalContractId,
                            items: updatedItems,
                            totalAmount: newTotalAmount
                        };

                        // Thực hiện lưu theo thứ tự: khoản mục trước, sau đó là thông tin cơ bản, cuối cùng là phát hành
                        const saveItems = () => {
                            if (editableItems.length > 0) {
                                return dispatch(updateInvoiceItems({
                                    token,
                                    invoiceId,
                                    items: editableItems
                                })).unwrap();
                            }
                            return Promise.resolve();
                        };

                        // Lưu khoản mục trước
                        saveItems()
                            .then(() => {
                                // Sau khi lưu khoản mục, lưu thông tin cơ bản
                                return dispatch(updateInvoice({
                                    token,
                                    invoiceId,
                                    updateData: basicUpdateData,
                                    updateType: 'basic'
                                })).unwrap();
                            })
                            .then(() => {
                                // Cập nhật store sau khi lưu thành công
                                dispatch(updateInvoiceInStore(updatedInvoice));

                                // Cuối cùng, phát hành hóa đơn
                                return dispatch(completeInvoice({ token, invoiceId })).unwrap();
                            })
                            .then(() => {
                                // Điều hướng sau khi phát hành thành công
                                setIsLoading(false);

                                // Đặt lại trạng thái completeInvoiceSuccess
                                dispatch(resetCompleteInvoiceState());

                                // Hiển thị thông báo thành công
                        showSuccess("Hóa đơn đã được phát hành thành công!");
                        navigation.navigate('Bill');
                            })
                            .catch((error) => {
                                setIsLoading(false);
                        showError("Không thể phát hành hóa đơn. Vui lòng thử lại.");
                    });
            }

        );
    };

    // Check if an item is a standard contract item
    const isStandardContractItem = (item: InvoiceItem): boolean => {
        // Kiểm tra nếu item có templateId (được lấy từ mẫu) thì không phải từ hợp đồng
        if (item.templateId) {
            return false;
        }

        // Check for specific standard services by name
        const name = item.name.toLowerCase();
        return name.includes('internet') ||
            name.includes('máy giặt') ||
            name.includes('laundry') ||
            name.includes('wifi') ||
            name.includes('điện') ||
            name.includes('nước') ||
            name.includes('electricity') ||
            name.includes('water') ||
            (item.category === 'rent'); // Rent is always a contract item
    };

    // Get price type from contract for a specific item
    const getItemPriceType = (item: InvoiceItem): 'perRoom' | 'perUsage' | 'perPerson' | null => {
        if (!selectedInvoice?.contractId?.contractInfo?.serviceFeeConfig) {
            return null;
        }

        const serviceFeeConfig = selectedInvoice.contractId.contractInfo.serviceFeeConfig;
        
        // Kiểm tra các dịch vụ tiện ích cơ bản
        if (item.name.toLowerCase().includes('điện') || item.name.toLowerCase().includes('electricity')) {
            return serviceFeeConfig.electricity || null;
        }
        
        if (item.name.toLowerCase().includes('nước') || item.name.toLowerCase().includes('water')) {
            return serviceFeeConfig.water || null;
        }

        // Kiểm tra custom services
        if (selectedInvoice.contractId.contractInfo.customServices) {
            const customService = selectedInvoice.contractId.contractInfo.customServices.find(
                (service: any) => service.name === item.name
            );
            if (customService) {
                return customService.priceType || null;
            }
        }

        return null;
    };

    // Check if an item is editable and what fields can be edited
    const getItemEditability = (item: InvoiceItem): {
        isEditable: boolean;
        canEditName: boolean;
        canEditDescription: boolean;
        canEditQuantity: boolean;
        canEditUnitPrice: boolean;
        canEditMeterReadings: boolean;
    } => {
        // Default: nothing is editable
        const result = {
            isEditable: false,
            canEditName: false,
            canEditDescription: false,
            canEditQuantity: false,
            canEditUnitPrice: false,
            canEditMeterReadings: false,
        };

        // Lấy price type từ hợp đồng
        const priceType = getItemPriceType(item);

        // Kiểm tra nếu là khoản mục từ hợp đồng
        if (isStandardContractItem(item)) {
            result.isEditable = true;
            result.canEditDescription = true; // Luôn cho phép chỉnh sửa description
            
            // Xử lý theo priceType
            if (priceType === 'perRoom') {
                // perRoom: Chỉ cho phép chỉnh sửa description
                result.isEditable = true; // ✅ FIX: Đặt isEditable = true để item không bị filter
                result.canEditDescription = true;
                result.canEditMeterReadings = false;
                result.canEditUnitPrice = false;
            } else if (priceType === 'perUsage') {
                // perUsage: Có thể chỉnh sửa chỉ số đồng hồ - hiển thị input fields cho meter readings
                result.isEditable = true;
                result.canEditMeterReadings = true;
                // Đơn giá vẫn không được chỉnh sửa cho các item từ hợp đồng
                result.canEditUnitPrice = false;
            } else if (priceType === 'perPerson') {
                // perPerson: Chỉ cho phép chỉnh sửa description
                result.isEditable = true; // ✅ FIX: Đặt isEditable = true để item không bị filter
                result.canEditDescription = true;
                result.canEditMeterReadings = false;
                result.canEditUnitPrice = false;
            }
            
            return result;
        }

        // Các khoản mục tiện ích (utility) không từ hợp đồng
        if (item.category === 'utility') {
            result.isEditable = true;
            result.canEditDescription = true;
            // Không cho phép chỉnh sửa đơn giá cho tất cả item
            result.canEditUnitPrice = false;
            // Kiểm tra nếu có priceType là perUsage thì cho phép chỉnh sửa meter readings
            if (priceType === 'perUsage') {
                result.canEditMeterReadings = true;
            }
            return result;
        }

        // Allow editing for custom items (service, maintenance, other)
        if (item.category === 'service' || item.category === 'maintenance' || item.category === 'other') {
            result.isEditable = true;
            result.canEditName = false;
            result.canEditDescription = true;
            // Không cho phép chỉnh sửa số lượng
            result.canEditQuantity = false;
            // Không cho phép chỉnh sửa đơn giá cho tất cả item
            result.canEditUnitPrice = false;
            // Kiểm tra nếu có priceType là perUsage thì cho phép chỉnh sửa meter readings
            if (priceType === 'perUsage') {
                result.canEditMeterReadings = true;
            }
            return result;
        }

        return result;
    };

    // Update item name
    const updateItemName = (itemId: string, value: string) => {
        const newItems = [...invoiceItems];
        const itemIndex = newItems.findIndex(item => item._id === itemId);
        if (itemIndex === -1) {return;}

        // Update string input state
        setItemInputs(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                name: value,
            },
        }));

        // Update the actual item
        newItems[itemIndex].name = value;
        setInvoiceItems(newItems);
    };

    // Update item description
    const updateItemDescription = (itemId: string, value: string) => {
        const newItems = [...invoiceItems];
        const itemIndex = newItems.findIndex(item => item._id === itemId);
        if (itemIndex === -1) {return;}

        // Update string input state
        setItemInputs(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                description: value,
            },
        }));

        // Update the actual item
        newItems[itemIndex].description = value;
        setInvoiceItems(newItems);
    };

    // Handle item deletion
    const handleDeleteItem = (item: InvoiceItem) => {
        if (!token || !selectedInvoice || !item._id) {

            showError("Không thể xóa khoản mục này. Thiếu thông tin cần thiết.");

            return;
        }

        // Không cho phép xóa khoản mục có category là rent
        if (item.category === 'rent') {
            showError('Khoản mục tiền thuê không thể bị xóa.');
            return;
        }

        // Confirm deletion

        showConfirm(
            `Bạn có chắc chắn muốn xóa khoản mục "${item.name}" không?`,
            () => {
                        // Call API to delete the item
                        dispatch(deleteInvoiceItem({
                            token,
                            invoiceId,
                            itemId: item._id as string
                        }))
                            .unwrap()
                            .then(() => {
                                // Success will be handled by the useEffect
                            })
                            .catch((error) => {
                                // Error will be handled by the useEffect
                                // Show error alert in case the useEffect doesn't catch it
                        showError(`Không thể xóa khoản mục: ${error}`);
                    });
            }

        );
    };

    // Tính toán lượng sử dụng dựa trên dữ liệu từ input hoặc từ item
    const calculateUsage = (item: InvoiceItem, inputData?: any) => {
        if (!item) {return 0;}

        // Lấy giá trị chỉ số từ input hoặc từ item
        const currentReading = inputData?.currentReading !== undefined ?
            (inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading)) :
            (item.currentReading || 0);

        const previousReading = inputData?.previousReading !== undefined ?
            (inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading)) :
            (item.previousReading || 0);

        const usage = currentReading - previousReading;
        return usage > 0 ? usage : 0;
    };

    // Tính toán số tiền của item dựa trên dữ liệu từ input hoặc từ item
    const calculateItemAmount = (item: InvoiceItem, inputData?: any) => {
        if (!item) {return 0;}

        if (item.type === 'fixed') {
            // Lấy số lượng và đơn giá từ input hoặc từ item
            const quantity = inputData?.quantity !== undefined ?
                (inputData.quantity === '' ? 0 : parseInt(inputData.quantity)) :
                (item.quantity || 0);

            const unitPrice = inputData?.unitPrice !== undefined ?
                (inputData.unitPrice === '' ? 0 : parseInt(inputData.unitPrice)) :
                (item.unitPrice || 0);

            // Tính toán amount dựa trên priceType
            const priceType = getItemPriceType(item);
            if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
               return quantity * unitPrice;
            } else {
                return quantity * unitPrice;
            }
        } else if (item.type === 'variable') {
            const usage = calculateUsage(item, inputData);

            const unitPrice = inputData?.unitPrice !== undefined ?
                (inputData.unitPrice === '' ? 0 : parseInt(inputData.unitPrice)) :
                (item.unitPrice || 0);

            // Tính toán amount dựa trên priceType
            const priceType = getItemPriceType(item);
            if (priceType === 'perPerson' && item.isPerPerson && item.personCount) {
                return usage * unitPrice ;
            } else {
                return usage * unitPrice;
            }
        }

        return item.amount || 0;
    };

    // Xử lý lưu mẫu hóa đơn
    const handleSaveAsTemplate = (templateName: string) => {
        if (!token || !selectedInvoice) {

            showError("Không thể lưu mẫu hóa đơn. Thiếu thông tin cần thiết.");

            return;
        }

        // Kiểm tra lỗi trước khi lưu mẫu
        if (hasFormErrors()) {

            showError("Vui lòng nhập hợp lệ tất cả các trường trước khi lưu mẫu hóa đơn.");

            return;
        }

        // Hiển thị loading
        setIsLoading(true);

        // Lưu thông tin quan trọng
        const originalRoomId = selectedInvoice.roomId;
        const originalTenantId = selectedInvoice.tenantId;
        const originalContractId = selectedInvoice.contractId;

        // Cập nhật invoiceItems với dữ liệu mới nhất từ itemInputs
        const updatedItems = invoiceItems.map(item => {
            const itemId = item._id || '';
            const inputData = itemInputs[itemId];

            if (!inputData) {return item;}

            const updatedItem = { ...item };

            // Cập nhật các trường từ itemInputs
            if (inputData.name !== undefined) {
                updatedItem.name = inputData.name;
            }

            if (inputData.description !== undefined) {
                updatedItem.description = inputData.description;
            }

            if (inputData.previousReading !== undefined) {
                updatedItem.previousReading = inputData.previousReading === '' ? 0 : parseInt(inputData.previousReading);
            }

            if (inputData.currentReading !== undefined) {
                updatedItem.currentReading = inputData.currentReading === '' ? 0 : parseInt(inputData.currentReading);
            }

            // Không cập nhật số lượng từ input

            // Không cập nhật đơn giá từ input

            // Tính toán lại amount
            if (updatedItem.type === 'fixed') {
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            } else if (updatedItem.type === 'variable') {
                const usage = (updatedItem.currentReading || 0) - (updatedItem.previousReading || 0);
                updatedItem.quantity = usage > 0 ? usage : 0;
                
                // Tính toán amount dựa trên priceType
                const priceType = getItemPriceType(updatedItem);
                if (priceType === 'perPerson' && updatedItem.isPerPerson && updatedItem.personCount) {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice * updatedItem.personCount;
                } else {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
            }

            return updatedItem;
        });

        // Cập nhật state với dữ liệu mới
        setInvoiceItems(updatedItems);

        // Tính lại tổng tiền
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(newTotalAmount);

        // Chuẩn bị dữ liệu cập nhật
        const dueDateISO = dueDateObj ? dueDateObj.toISOString() : undefined;
        const basicUpdateData = { dueDate: dueDateISO, note };
        const editableItems = getEditableItemsData(updatedItems);

        // Cập nhật store trước để UI hiển thị ngay
        const updatedInvoice = {
            ...selectedInvoice,
            dueDate: dueDateISO || selectedInvoice.dueDate,
            note: note || selectedInvoice.note,
            roomId: originalRoomId,
            tenantId: originalTenantId,
            contractId: originalContractId,
            items: updatedItems,
            totalAmount: newTotalAmount,
        };

        // Thực hiện lưu theo thứ tự: khoản mục trước, sau đó là thông tin cơ bản, cuối cùng là lưu mẫu
        const saveItems = () => {
            if (editableItems.length > 0) {
                return dispatch(updateInvoiceItems({
                    token,
                    invoiceId,
                    items: editableItems,
                })).unwrap();
            }
            return Promise.resolve();
        };

        // Lưu khoản mục trước
        saveItems()
            .then(() => {
                // Sau khi lưu khoản mục, lưu thông tin cơ bản
                return dispatch(updateInvoice({
                    token,
                    invoiceId,
                    updateData: basicUpdateData,
                    updateType: 'basic',
                })).unwrap();
            })
            .then(() => {
                // Cập nhật store sau khi lưu thành công
                dispatch(updateInvoiceInStore(updatedInvoice));

                // Sau khi lưu hóa đơn thành công, lưu mẫu
                return dispatch(saveInvoiceAsTemplate({
                    token,
                    invoiceId,
                    templateName,
                })).unwrap();
            })
            .then(() => {
                // Đặt lại trạng thái loading
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);

                // Hiển thị thông báo lỗi

                showError(`Không thể lưu hóa đơn hoặc lưu mẫu: ${error}`);

            });
    };

    const renderHeader = () => {
        const title = selectedInvoice ? `Chỉnh sửa hóa đơn ${formatPeriod(selectedInvoice.period)}` : 'Chỉnh sửa hóa đơn';
        const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
        return (
            <View style={{ paddingTop: statusBarHeight, alignItems: 'center', marginBottom: 30 }}>
                <UIHeader
                    title={title}
                    iconLeft={'back'}
                    onPressLeft={handleBackPress}
                    iconRight={
                        <TouchableOpacity onPress={() => setSaveTemplateModalVisible(true)}>
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Image
                                    source={require('../../assets/icons/icon_save_template.png')}
                                    style={styles.headerIcon}
                                />
                            </View>
                        </TouchableOpacity>
                    }
                />
            </View>
        );
    };

    const renderInvoiceInfo = () => {
        if (!selectedInvoice) {return null;}

        const roomInfo = selectedInvoice.contractId?.contractInfo || {};
        const tenant = selectedInvoice.tenantId;

        //

        // Helper function to get tenant name
        const getTenantName = () => {
            // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
            const contractTenantName = getNestedValue(selectedInvoice, 'contractId.contractInfo.tenantName');
            if (contractTenantName) {
                
                return contractTenantName;
            }

            // Nếu tenantId là object có chứa fullName
            if (selectedInvoice.tenantId && typeof selectedInvoice.tenantId === 'object') {
                const fullName = getNestedValue(selectedInvoice.tenantId, 'fullName');
                if (fullName) {
                    
                    return fullName;
                }

                // Các trường thông tin khác của tenantId
                const name = getNestedValue(selectedInvoice.tenantId, 'name');
                if (name) {return name;}

                const displayName = getNestedValue(selectedInvoice.tenantId, 'displayName');
                if (displayName) {return displayName;}

                const username = getNestedValue(selectedInvoice.tenantId, 'username');
                if (username) {return username;}
            }

            // Fallback: Nếu tenantId là string, hiển thị "Người thuê"
            return typeof selectedInvoice.tenantId === 'string' ? 'Người thuê' : 'Người thuê';
        };

        // Helper function to get room info
        const getRoomInfo = () => {
            // Ưu tiên lấy từ contractId.contractInfo (nguồn dữ liệu đáng tin cậy nhất)
            const contractRoomNumber = getNestedValue(selectedInvoice, 'contractId.contractInfo.roomNumber');
            if (contractRoomNumber) {return contractRoomNumber;}

            // Nếu roomId là object
            if (selectedInvoice.roomId && typeof selectedInvoice.roomId === 'object') {
                // Thử lấy roomNumber
                const roomNumber = getNestedValue(selectedInvoice.roomId, 'roomNumber');
                if (roomNumber) {return roomNumber;}

                // Thử lấy name
                const name = getNestedValue(selectedInvoice.roomId, 'name');
                if (name) {return name;}

                // Thử lấy title
                const title = getNestedValue(selectedInvoice.roomId, 'title');
                if (title) {return title;}
            }

            // Fallback: Nếu roomId là string, hiển thị "Phòng {roomId}"
            return typeof selectedInvoice.roomId === 'string'
                ? `Phòng ${selectedInvoice.roomId}`
                : 'Phòng cho thuê';
        };

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin hóa đơn</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã hóa đơn:</Text>
                    <Text style={styles.infoValue}>{selectedInvoice.invoiceNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kỳ hóa đơn:</Text>
                    <Text style={styles.infoValue}>{formatPeriod(selectedInvoice.period)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phòng:</Text>
                    <Text style={styles.infoValue}>
                        {getRoomInfo()}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Người thuê:</Text>
                    <Text style={styles.infoValue}>
                        {getTenantName()}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hạn thanh toán:</Text>
                    <TouchableOpacity
                        style={[styles.infoValue, styles.datePickerButton]}
                        onPress={showDueDatePicker}
                    >
                        <Text style={styles.dateText}>{dueDate || 'Chọn ngày'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Date picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={dueDateObj || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}
                <View style={styles.infoRow}>
                    <TextInput
                        style={[styles.infoValue, styles.input]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Thêm ghi chú"
                        multiline
                    />
                </View>
            </View>
        );
    };

    const renderInvoiceItems = () => {
        if (!invoiceItems || invoiceItems.length === 0) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
                    <Text style={styles.emptyMessage}>Không có thông tin chi tiết hóa đơn</Text>
                </View>
            );
        }

        return (
            <View style={styles.itemsSection}>
                                      <View style={styles.sectionTitleRow}>
                         
                                                      {canEditInvoice() && (
                                <TouchableOpacity
                                    style={styles.addItemButton}
                                    onPress={() => setCustomItemModalVisible(true)}
                                >
                                    <Text style={styles.addItemButtonText}>Thêm khoản mục</Text>
                                    <Image
                                        source={require('../../assets/icons/icon_add.png')}
                                        style={styles.addItemIcon}
                                    />
                                </TouchableOpacity>
                            )}
                      </View>
                {canEditInvoice() && (
                    <View style={styles.customItemNote}>
                        <Text style={styles.customItemNoteText}>
                            Bạn có thể thêm các khoản mục tùy chỉnh như điện nước, dịch vụ, bảo trì hoặc các khoản khác.
                        </Text>

                    </View>
                )}

                {/* Nút áp dụng chỉ số từ kỳ trước */}
                {canEditInvoice() && 
                 previousInvoiceData.meterReadings && 
                 Object.keys(previousInvoiceData.meterReadings).length > 0 && 
                 !hasAppliedPreviousReadings && (
                    <View style={styles.previousReadingsContainer}>
                        <View style={styles.previousReadingsInfo}>
                            <Text style={styles.previousReadingsTitle}>
                                📊 Chỉ số từ kỳ trước
                            </Text>
                            <Text style={styles.previousReadingsSubtitle}>
                                Tìm thấy dữ liệu chỉ số từ hóa đơn kỳ {previousInvoiceData.period?.month}/{previousInvoiceData.period?.year}
                            </Text>
                        </View>
                        <View style={styles.previousReadingsActions}>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={fetchPreviousInvoiceData}
                                disabled={loadingPreviousInvoice}
                            >
                                <Text style={styles.refreshButtonText}>🔄 Làm mới</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyPreviousReadingsButton}
                                onPress={showApplyPreviousReadingsModal}
                                disabled={loadingPreviousInvoice}
                            >
                                {loadingPreviousInvoice ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Text style={styles.applyPreviousReadingsButtonText}>
                                        Áp dụng chỉ số
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Hiển thị thông báo đã áp dụng chỉ số */}
                {hasAppliedPreviousReadings && (
                    <View style={styles.appliedReadingsContainer}>
                        <Text style={styles.appliedReadingsText}>
                            ✅ Đã áp dụng chỉ số từ kỳ trước
                        </Text>
                    </View>
                )}

                {/* Hiển thị thông báo khi không tìm thấy dữ liệu kỳ trước */}
                {canEditInvoice() && 
                 !loadingPreviousInvoice && 
                 !previousInvoiceData.meterReadings && 
                 !hasAppliedPreviousReadings && (
                    <View style={styles.noPreviousReadingsContainer}>
                        <Text style={styles.noPreviousReadingsTitle}>
                            📊 Không tìm thấy dữ liệu kỳ trước
                        </Text>
                        <Text style={styles.noPreviousReadingsSubtitle}>
                            Không có hóa đơn kỳ trước hoặc hóa đơn chưa được thanh toán
                        </Text>
                        <TouchableOpacity
                            style={styles.retryPreviousReadingsButton}
                            onPress={fetchPreviousInvoiceData}
                            disabled={loadingPreviousInvoice}
                        >
                            <Text style={styles.retryPreviousReadingsButtonText}>🔄 Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {invoiceItems.map((item, index) => {
                    const editability = getItemEditability(item);
                    const itemId = item._id || `item-${index}`;

                    return (
                        <View key={item._id || index} style={styles.itemContainer}>
                            <View style={styles.itemHeader}>
                                {editability.canEditName ? (
                                    <TextInput
                                        style={styles.itemNameInput}
                                        value={itemInputs[itemId]?.name || item.name}
                                        onChangeText={(value) => updateItemName(itemId, value)}
                                        placeholder="Tên khoản mục"
                                    />
                                ) : (
                                    <Text style={styles.itemName}>
                                        {itemInputs[itemId]?.name || item.name}
                                    </Text>
                                )}
                                <View style={styles.categoryContainer}>
                                    <Text style={styles.itemCategory}>{getCategoryText(item.category)}</Text>
                                    
                                    {/* Delete button for all items except rent */}
                                    {item.category !== 'rent' && canEditInvoice() && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteItem(item)}
                                            disabled={deleteItemLoading}
                                        >
                                            <Text style={styles.deleteButtonText}>Xóa</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Show custom item badge for editable items */}
                            

                            

                            {/* Description field - luôn hiển thị, có thể chỉnh sửa hoặc chỉ xem */}
                            {editability.canEditDescription ? (
                                <TextInput
                                    style={styles.descriptionInput}
                                    value={itemInputs[itemId]?.description || item.description}
                                    onChangeText={(value) => updateItemDescription(itemId, value)}
                                    placeholder="Mô tả (tùy chọn)"
                                    multiline
                                />
                            ) : (itemInputs[itemId]?.description || item.description) ? (
                                <Text style={styles.itemDesc}>
                                    {itemInputs[itemId]?.description || item.description}
                                </Text>
                            ) : null}

                            {/* Hiển thị meter readings cho bất kỳ khoản mục nào có priceType là perUsage */}
                            {editability.canEditMeterReadings ? (
                                <View style={styles.meterReadingContainer}>
                                    <View style={styles.meterReadingRow}>
                                        <Text style={styles.meterLabel}>Chỉ số cũ:</Text>
                                        <View style={styles.inputFieldContainer}>
                                            <TextInput
                                                style={[
                                                    styles.meterInput,
                                                    inputErrors[itemId]?.previousReading ? styles.inputError : {},
                                                ]}
                                                value={itemInputs[itemId]?.previousReading}
                                                onChangeText={(value) => updateMeterReading(itemId, 'previousReading', value)}
                                                keyboardType="numeric"
                                                editable={editability.canEditMeterReadings}
                                            />
                                        </View>
                                    </View>
                                    {inputErrors[itemId]?.previousReading && (
                                        <View style={styles.errorMessageContainer}>
                                            <Text style={styles.validationErrorText}>
                                                {inputErrors[itemId]?.previousReading}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.meterReadingRow}>
                                        <Text style={styles.meterLabel}>Chỉ số mới:</Text>
                                        <View style={styles.inputFieldContainer}>
                                            <TextInput
                                                style={[
                                                    styles.meterInput,
                                                    inputErrors[itemId]?.currentReading ? styles.inputError : {},
                                                ]}
                                                value={itemInputs[itemId]?.currentReading}
                                                onChangeText={(value) => updateMeterReading(itemId, 'currentReading', value)}
                                                keyboardType="numeric"
                                                editable={editability.canEditMeterReadings}
                                            />
                                        </View>
                                    </View>
                                    {inputErrors[itemId]?.currentReading && (
                                        <View style={styles.errorMessageContainer}>
                                            <Text style={styles.validationErrorText}>
                                                {inputErrors[itemId]?.currentReading}
                                            </Text>
                                        </View>
                                    )}
                                    <Text style={styles.usageText}>
                                        Sử dụng: {calculateUsage(item, itemInputs[itemId])}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Hiển thị số lượng dạng chỉ đọc */}
                            <View style={[
                                styles.quantityContainer,
                                ((item.type === 'variable' ? calculateUsage(item, itemInputs[itemId]) : item.quantity) > 0 ? {} : { display: 'none' })
                            ]}>
                                 <Text style={styles.quantityLabel}>Số lượng:</Text>
                                 <Text style={styles.quantityText}>
                                     {item.type === 'variable' ? calculateUsage(item, itemInputs[itemId]) : item.quantity}
                                 </Text>
                             </View>

                            {/* Luôn hiển thị item details với đơn giá và tổng tiền */}
                            <View style={styles.itemDetails}>
                                <View style={styles.itemPriceRow}>
                                    {/* Đơn giá chỉ hiển thị dạng chỉ đọc */}
                                    <View style={styles.readOnlyPriceContainer}>
                                        <Text style={styles.unitPriceLabel}>Đơn giá:</Text>
                                        <Text style={styles.itemDetail}>
                                            {Number(item.unitPrice).toLocaleString('vi-VN')} đ
                                            {item.isPerPerson && ` × ${item.personCount} người`}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemAmount}>
                                        {calculateItemAmount(item, itemInputs[itemId]).toLocaleString('vi-VN')} đ
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderSummary = () => {
        // Tính tổng tiền dựa trên dữ liệu từ input
        const calculatedTotal = invoiceItems.reduce((sum, item) => {
            const itemId = item._id || '';
            return sum + calculateItemAmount(item, itemInputs[itemId]);
        }, 0);

        return (
            <View style={styles.summarySection}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Tổng tiền</Text>
                    <Text style={styles.summaryAmount}>
                        {calculatedTotal.toLocaleString('vi-VN')}VND
                    </Text>
                </View>
            </View>
        );
    };

    const renderCustomItemModal = () => {
        return (
            <AddCustomItemModal
                visible={customItemModalVisible}
                loading={customItemLoading || addItemLoading}
                onClose={() => setCustomItemModalVisible(false)}
                onSave={(data) => {
                    if (!token || !invoiceId) {return;}
                    setCustomItemLoading(true);
                    dispatch(addCustomInvoiceItem({ token, invoiceId, itemData: { ...data } }))
                        .finally(() => setCustomItemLoading(false));
                    // đóng modal sau khi dispatch
                    setCustomItemModalVisible(false);
                }}
            />
        );
    };

    // Lấy dữ liệu hóa đơn kỳ trước
    const fetchPreviousInvoiceData = useCallback(async () => {
        if (!token || !selectedInvoice || !selectedInvoice.contractId || !selectedInvoice.period) {
            return;
        }

        setLoadingPreviousInvoice(true);
        try {
            // Lấy contractId
            const contractId = typeof selectedInvoice.contractId === 'string' 
                ? selectedInvoice.contractId 
                : selectedInvoice.contractId._id || '';

            if (!contractId) {return;}

            // Lấy thông tin kỳ hiện tại
            let currentMonth: number;
            let currentYear: number;

            if (typeof selectedInvoice.period === 'string') {
                const periodDate = new Date(selectedInvoice.period);
                currentMonth = periodDate.getMonth() + 1;
                currentYear = periodDate.getFullYear();
            } else if (selectedInvoice.period.month && selectedInvoice.period.year) {
                currentMonth = selectedInvoice.period.month;
                currentYear = selectedInvoice.period.year;
            } else {
                return;
            }

            const response = await getPreviousInvoice(token, contractId, { month: currentMonth, year: currentYear });
            if (response.success && response.data) { setPreviousInvoiceData(response.data); }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu hóa đơn kỳ trước:', error);
        } finally {
            setLoadingPreviousInvoice(false);
        }
    }, [token, selectedInvoice]);

    // Tự động áp dụng chỉ số từ hóa đơn kỳ trước
    const applyPreviousMeterReadings = useCallback(() => {
        if (!previousInvoiceData.meterReadings || Object.keys(previousInvoiceData.meterReadings).length === 0) {
            showError('Không có dữ liệu chỉ số từ kỳ trước để áp dụng');
            return;
        }

        const newItems = [...invoiceItems];
        let hasChanges = false;

        newItems.forEach((item, index) => {
            if (item.category === 'utility' && item.name && previousInvoiceData.meterReadings[item.name]) {
                const previousData = previousInvoiceData.meterReadings[item.name];
                
                // Cập nhật chỉ số cũ = chỉ số mới của kỳ trước
                const newPreviousReading = previousData.currentReading;
                
                // Cập nhật chỉ số mới = chỉ số cũ + 1 (gợi ý)
                const newCurrentReading = newPreviousReading + 1;

                // Cập nhật item
                newItems[index].previousReading = newPreviousReading;
                newItems[index].currentReading = newCurrentReading;

                // Cập nhật itemInputs
                const itemId = item._id || `item-${index}`;
                setItemInputs(prev => ({
                    ...prev,
                    [itemId]: {
                        ...prev[itemId],
                        previousReading: newPreviousReading.toString(),
                        currentReading: newCurrentReading.toString(),
                    },
                }));

                // Tính toán lại amount
                const usage = newCurrentReading - newPreviousReading;
                newItems[index].quantity = usage > 0 ? usage : 0;
                // newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;

                hasChanges = true;
            }
        });

        if (hasChanges) {
            setInvoiceItems(newItems);
            recalculateTotalAmount(newItems);
            setHasAppliedPreviousReadings(true);
            
            showSuccess(`Đã áp dụng chỉ số từ hóa đơn kỳ ${previousInvoiceData.period?.month}/${previousInvoiceData.period?.year}`);
        }
    }, [previousInvoiceData, invoiceItems, showAlert, showSuccess]);

    // Hiển thị modal xác nhận áp dụng chỉ số từ kỳ trước
    const showApplyPreviousReadingsModal = useCallback(() => {
        if (!previousInvoiceData.meterReadings || Object.keys(previousInvoiceData.meterReadings).length === 0) {
            showError('Không có dữ liệu chỉ số từ kỳ trước để áp dụng');
            return;
        }

        const periodText = previousInvoiceData.period 
            ? `kỳ ${previousInvoiceData.period.month}/${previousInvoiceData.period.year}`
            : 'kỳ trước';

        const message = `Bạn có muốn áp dụng chỉ số đồng hồ từ hóa đơn ${periodText} không?\n\n` +
            'Chỉ số cũ sẽ được cập nhật bằng chỉ số mới của kỳ trước.\n' +
            'Chỉ số mới sẽ được gợi ý bằng chỉ số cũ + 1.';

        showConfirm(
            message,
            () => applyPreviousMeterReadings()
        );
    }, [previousInvoiceData, showAlert, showConfirm, applyPreviousMeterReadings]);

    // Tự động lấy dữ liệu hóa đơn kỳ trước khi có selectedInvoice và có khoản mục utility
    useEffect(() => {
        if (selectedInvoice && selectedInvoice.items) {
            const hasUtilityItems = selectedInvoice.items.some(item => item.category === 'utility');
            if (hasUtilityItems) {
                fetchPreviousInvoiceData();
            }
        }
    }, [selectedInvoice, fetchPreviousInvoiceData]);

    if (loading) {
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
        <SafeAreaView style={[styles.container, { flex: 1 }]}>
            {/* Header */}
            {renderHeader()}

            {/* Loading overlay */}
            <LoadingAnimationWrapper 
                visible={isLoading}
                message="Đang xử lý..."
                size="large"
            />

            <ScrollView style={styles.scrollView}>
                {/* Invoice info section */}
                {renderInvoiceInfo()}
                {renderInvoiceItems()}
                {renderSummary()}

                {canEditInvoice() && (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={styles.saveDraftButton}
                            onPress={handleSaveDraft}
                            disabled={isLoading || !selectedInvoice}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.black} />
                            ) : (
                                <Text style={styles.saveDraftText}>Lưu nháp</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: Colors.limeGreen }]}
                            onPress={handleIssueInvoice}
                            disabled={updateInvoiceLoading}>
                            {updateInvoiceLoading ? (
                                <ActivityIndicator size="small" color={Colors.black} />
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    {selectedInvoice?.status === 'overdue' ? 'Cập nhật hóa đơn' : 'Phát hành hóa đơn'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Modal container */}
            <View style={styles.modalContainer}>
                {renderCustomItemModal()}

                {/* Modal lưu mẫu hóa đơn */}
                <SaveTemplateModal
                    visible={saveTemplateModalVisible}
                    onClose={() => setSaveTemplateModalVisible(false)}
                    onSave={handleSaveAsTemplate}
                    loading={saveTemplateLoading}
                />

                {/* Custom Alert Modal */}
                <CustomAlertModal
                    visible={visible}
                    title={alertConfig?.title || 'Thông báo'}
                    message={alertConfig?.message || ''}
                    onClose={hideAlert}
                    type={alertConfig?.type}
                    buttons={alertConfig?.buttons}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
        position: 'relative',
    },
                  scrollContainer: {
                  paddingBottom: verticalScale(30),
              },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 10,
    },
    headerContainer: {
        marginTop: 10,
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
        paddingHorizontal: responsiveSpacing(20),
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
    itemsSection: {
        backgroundColor: Colors.lightGray,
        marginTop: 10,
        paddingHorizontal: 15,
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
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        paddingBottom: 8,
    },
    addItemButton: {
        backgroundColor: Colors.limeGreen,
        paddingHorizontal: responsiveSpacing(20),
        paddingVertical: 12,
        borderRadius: 50,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    addItemButtonText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    addItemIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.black,
        resizeMode: 'contain',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.black,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '500',
        flex: 1.5,
        textAlign: 'right',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'left',
        height: 80,
        textAlignVertical: 'top',
        marginTop: 10,
    },
    emptyMessage: {
        textAlign: 'center',
        color: Colors.mediumGray,
        fontStyle: 'italic',
        marginVertical: 10,
    },
    itemContainer: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
        backgroundColor: Colors.white,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    meterReadingContainer: {
        marginTop: 8,
        backgroundColor: Colors.lightGray,
        padding: 10,
        borderRadius: 6,
    },
    meterReadingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    meterLabel: {
        fontSize: 13,
        color: Colors.dearkOlive,
    },
    meterInput: {
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        width: 100,
        backgroundColor: Colors.white,
        textAlign: 'right',
    },
    meterValue: {
        fontSize: 13,
        color: Colors.dearkOlive,
        fontWeight: '500',
        textAlign: 'right',
        width: 100,
        paddingVertical: 2,
    },
    usageText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    quantityLabel: {
        fontSize: 13,
        color: Colors.dearkOlive,
        marginRight: 10,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        width: 80,
        backgroundColor: Colors.white,
        textAlign: 'right',
    },
    itemDetails: {
        marginTop: 8,
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
        color: Colors.dearkOlive,
    },
    summarySection: {
        backgroundColor: 'transparent',
        marginTop: 10,
        paddingVertical: 15,
        marginHorizontal: 15,
    },
    summaryContainer: {
        backgroundColor: '#BAFD00', // Màu xanh lá tươi như trong ảnh
        borderRadius: 10,
        padding: 20,
        alignItems: 'flex-start', // Căn trái thay vì căn giữa
        justifyContent: 'center',
        minHeight: 80,
        width: '100%', // Chiếm toàn bộ chiều rộng có sẵn
        marginHorizontal: 0, // Bỏ margin ngang
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.black,
        marginBottom: 8,
        textAlign: 'left', // Căn trái như trong ảnh
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'left', // Căn trái như trong ảnh
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: Colors.primaryGreen,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        height: 48,
        justifyContent: 'center',
    },
    saveButtonText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.white,
        width: '100%',
        borderRadius: 10,
        padding: 20,
        maxHeight: '90%',
        maxWidth: 500,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.primaryGreen,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 5,
        color: Colors.dearkOlive,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryButton: {
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 10,
        width: '48%',
        alignItems: 'center',
    },
    categoryButtonActive: {
        backgroundColor: Colors.primaryGreen,
    },
    categoryButtonText: {
        color: Colors.dearkOlive,
        fontSize: 14,
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 10,
        height: 48,
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: Colors.dearkOlive,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    customItemNote: {
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primaryGreen,
    },
    customItemNoteText: {
        color: Colors.dearkOlive,
        fontSize: 14,
        lineHeight: 20,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readOnlyBadge: {
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.mediumGray,
    },
    quantityText: {
        fontSize: 13,
        color: Colors.dearkOlive,
    },
    itemNameInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 10,
        backgroundColor: Colors.white,
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: Colors.white,
        fontSize: 13,
        color: Colors.mediumGray,
        textAlignVertical: 'top',
        minHeight: 40,
    },
    unitPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unitPriceLabel: {
        fontSize: 13,
        color: Colors.dearkOlive,
        marginRight: 5,
    },
    unitPriceInput: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        width: 100,
        backgroundColor: Colors.white,
        textAlign: 'right',
        fontSize: 14,
    },
    unitPriceCurrency: {
        fontSize: 13,
        color: Colors.dearkOlive,
        marginLeft: 5,
    },
    deleteButton: {
        backgroundColor: Colors.red,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    customItemBadge: {
        backgroundColor: '#F0F8FF', // Light blue background
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primaryGreen, // Green text color
        alignSelf: 'flex-start', // Align to the left
    },
    customItemBadgeContainer: {
        marginTop: 4,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalInfoNote: {
        backgroundColor: Colors.lightGray,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primaryGreen,
    },
    modalInfoNoteText: {
        color: Colors.dearkOlive,
        fontSize: 14,
        lineHeight: 20,
    },
    utilityReadingsContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: Colors.lightGray,
        borderRadius: 6,
    },
    utilityReadingsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.dearkOlive,
    },
    meterReadingLabel: {
        fontSize: 13,
        color: Colors.dearkOlive,
    },
    meterReadingInput: {
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        width: 100,
        backgroundColor: Colors.white,
        textAlign: 'right',
    },
    meterReadingUsage: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginTop: 4,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    dateText: {
        fontSize: 14,
        color: Colors.dearkOlive,
        // marginRight: 5,
    },
    calendarIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    scrollView: {
        paddingBottom: verticalScale(30),
    },
    inputFieldContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    inputError: {
        borderColor: Colors.red,
        borderWidth: 1,
    },
    validationErrorText: {
        color: Colors.red,
        fontSize: 12,
        marginTop: 2,
    },
    errorMessageContainer: {
        alignItems: 'flex-end',
        paddingRight: 10,
        marginTop: -5,
        marginBottom: 5,
    },
    inputFieldNormal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unitPriceWrapper: {
        flexDirection: 'column',
        marginRight: 10,
    },
    errorNormalContainer: {
        marginTop: 2,
    },
    templateButton: {
        color: Colors.primaryGreen,
        fontSize: 16,
        fontWeight: 'bold',
        padding: 5,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    saveDraftButton: {
        flex: 1,
        backgroundColor: Colors.darkGray,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveDraftText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    saveTemplateButton: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primaryGreen,
    },
    saveTemplateText: {
        color: Colors.primaryGreen,
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#BAFD00',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
    },
    readOnlyPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readOnlyNote: {
        fontSize: 11,
        color: Colors.mediumGray,
        fontStyle: 'italic',
        marginTop: 2,
    },
         previousReadingsContainer: {
         backgroundColor: Colors.lightGray,
         padding: 15,
         borderRadius: 8,
         marginBottom: 15,
         borderLeftWidth: 3,
         borderLeftColor: Colors.primaryGreen,
     },
     previousReadingsInfo: {
         marginBottom: 10,
     },
    previousReadingsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    previousReadingsSubtitle: {
        fontSize: 12,
        color: Colors.mediumGray,
    },
         applyPreviousReadingsButton: {
         backgroundColor: Colors.primaryGreen,
         padding: 10,
         borderRadius: 5,
         alignItems: 'center',
         height: 48,
         justifyContent: 'center',
         flex: 2,
     },
    applyPreviousReadingsButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
         appliedReadingsContainer: {
         backgroundColor: '#E8F5E8',
         padding: 15,
         borderRadius: 8,
         marginBottom: 15,
         borderLeftWidth: 3,
         borderLeftColor: Colors.primaryGreen,
     },
     appliedReadingsText: {
         fontSize: 14,
         fontWeight: 'bold',
         color: Colors.primaryGreen,
         textAlign: 'center',
     },
         refreshButton: {
         backgroundColor: Colors.white,
         padding: 10,
         borderRadius: 5,
         alignItems: 'center',
         height: 48,
         justifyContent: 'center',
         marginRight: 10,
         borderWidth: 1,
         borderColor: Colors.primaryGreen,
         flex: 1,
     },
         refreshButtonText: {
         color: Colors.primaryGreen,
         fontWeight: 'bold',
         fontSize: 16,
     },
    previousReadingsActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noPreviousReadingsContainer: {
        backgroundColor: Colors.lightGray,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primaryGreen,
        alignItems: 'center',
    },
    noPreviousReadingsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    noPreviousReadingsSubtitle: {
        fontSize: 12,
        color: Colors.mediumGray,
    },
         retryPreviousReadingsButton: {
         backgroundColor: Colors.primaryGreen,
         paddingHorizontal: 30,
         paddingVertical: 10,
         borderRadius: 5,
         marginTop: 10,
     },
     retryPreviousReadingsButtonText: {
         color: Colors.white,
         fontWeight: 'bold',
     },
    downloadButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 18,
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
    headerIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.dearkOlive,
        resizeMode: 'contain',
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    },
});

export default EditInvoiceScreen; 