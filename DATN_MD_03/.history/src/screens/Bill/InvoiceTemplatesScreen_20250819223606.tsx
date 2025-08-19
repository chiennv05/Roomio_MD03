import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Image,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { scale, responsiveSpacing, responsiveFont } from '../../utils/responsive';
import {
    fetchInvoiceTemplates,
    resetTemplatesState,
    deleteInvoiceTemplate,
    resetDeleteTemplateState,
} from '../../store/slices/billSlice';
import ContractSelectionModal from './components/ContractSelectionModal';
import ApplyTemplateModal from './components/ApplyTemplateModal';
import { Contract } from '../../types/Contract';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';
import LoadingAnimationWrapper from '../../components/LoadingAnimationWrapper';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';

const InvoiceTemplatesScreen = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
    const { token } = useAppSelector(state => state.auth);
    const {
        templates,
        templatesLoading,
        templatesError,
        deleteTemplateLoading,
        deleteTemplateSuccess,
        deleteTemplateError,
    } = useAppSelector(state => state.bill);
    const [refreshing, setRefreshing] = useState(false);

    // State cho modal chọn hợp đồng và áp dụng mẫu
    const [contractModalVisible, setContractModalVisible] = useState(false);
    const [applyTemplateModalVisible, setApplyTemplateModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    useEffect(() => {
        loadTemplates();

        return () => {
            dispatch(resetTemplatesState());
            dispatch(resetDeleteTemplateState());
        };
    }, []);

    // Xử lý khi xóa mẫu thành công
    useEffect(() => {
        if (deleteTemplateSuccess) {
            showSuccess('Đã xóa mẫu hóa đơn thành công');
            dispatch(resetDeleteTemplateState());
        }
    }, [deleteTemplateSuccess]);

    // Xử lý khi xóa mẫu thất bại
    useEffect(() => {
        if (deleteTemplateError) {
            showError(`Không thể xóa mẫu hóa đơn: ${deleteTemplateError}`);
            dispatch(resetDeleteTemplateState());
        }
    }, [deleteTemplateError]);

    const loadTemplates = () => {
        if (token) {
            dispatch(fetchInvoiceTemplates({ token }));
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadTemplates();
        setRefreshing(false);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleSelectTemplate = (template: any) => {
        setSelectedTemplate(template);
        setContractModalVisible(true);
    };

    const handleSelectContract = (contract: Contract) => {
        setSelectedContract(contract);
        setContractModalVisible(false);
        setApplyTemplateModalVisible(true);
    };

    const handleApplyTemplateSuccess = () => {
        // Reload templates after successful application
        loadTemplates();
    };

    // Xử lý xóa mẫu hóa đơn
    const handleDeleteTemplate = (template: any) => {
        if (!token || !template._id) {return;}

        showConfirm(
            `Bạn có chắc chắn muốn xóa mẫu hóa đơn "${getTemplateName(template)}" không?`,

            () => {
                dispatch(deleteInvoiceTemplate({ token, templateId: template._id }));
            },
            'Xác nhận xóa'

        );
    };

    const formatPeriod = (period: any) => {
        if (!period) {return 'N/A';}
        if (typeof period === 'string') {
            return period;
        }
        if (period.month && period.year) {
            return `${period.month.toString().padStart(2, '0')}/${period.year}`;
        }
        return 'N/A';
    };

    const getTemplateName = (item: any) => {
        // Nếu note có chứa TEMPLATE, lấy phần trước TEMPLATE làm tên mẫu
        if (item.note && item.note.includes('TEMPLATE')) {
            return item.note.split('TEMPLATE')[0].trim();
        }

        // Nếu không, sử dụng kỳ hóa đơn làm tên mẫu
        return `Mẫu hóa đơn ${formatPeriod(item.period)}`;
    };

    const renderItem = ({ item }: { item: any }) => {
        const roomNumber = item.roomId?.roomNumber ||
            (item.contractId?.contractInfo?.roomNumber || 'Không xác định');

        const tenantName = item.tenantId?.fullName ||
            (item.contractId?.contractInfo?.tenantName || 'Không xác định');

        const templateName = getTemplateName(item);

        return (
            <View style={styles.templateItem}>
                <TouchableOpacity
                    style={styles.templateContent}
                    onPress={() => handleSelectTemplate(item)}
                >
                    <View style={styles.templateHeader}>
                        <Text style={styles.templateName}>{templateName}</Text>
                        <Text style={styles.templateAmount}>
                            {item.totalAmount?.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                    <View style={styles.templateDetails}>
                        <Text style={styles.templateDetail}>
                            <Text style={styles.detailLabel}>Phòng: </Text>
                            {roomNumber}
                        </Text>
                        <Text style={styles.templateDetail}>
                            <Text style={styles.detailLabel}>Người thuê: </Text>
                            {tenantName}
                        </Text>
                        <Text style={styles.templateDetail}>
                            <Text style={styles.detailLabel}>Số khoản mục: </Text>
                            {item.itemCount || (item.items?.length || 0)}
                        </Text>
                    </View>
                    <View style={styles.templateFooter}>
                        <Text style={styles.templatePeriod}>
                            Kỳ hóa đơn: {formatPeriod(item.period)}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTemplate(item)}
                    disabled={deleteTemplateLoading}
                >
                    <Image
                        source={require('../../assets/icons/icon_remove.png')}
                        style={styles.deleteIcon}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyList = () => {
        if (templatesLoading) {
            return (
                <LoadingAnimationWrapper 
                    visible={true}
                    message="Đang tải mẫu hóa đơn..."
                    size="large"
                />
            );
        }

        if (templatesError) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>
                        Đã xảy ra lỗi khi tải mẫu hóa đơn: {templatesError}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadTemplates}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    Bạn chưa có mẫu hóa đơn nào.
                </Text>
                <Text style={styles.emptySubText}>
                    Hãy lưu hóa đơn như mẫu để sử dụng lại sau này.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
            <View style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0, alignItems: 'center' }}>
                <UIHeader
                    title={'Mẫu hóa đơn'}
                    iconLeft={'back'}
                    onPressLeft={handleGoBack}
                />
            </View>

            <FlatList
                data={templates}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            {/* Modal chọn hợp đồng */}
            <ContractSelectionModal
                visible={contractModalVisible}
                onClose={() => setContractModalVisible(false)}
                onSelectContract={handleSelectContract}
            />

            {/* Modal áp dụng mẫu hóa đơn */}
            <ApplyTemplateModal
                visible={applyTemplateModalVisible}
                onClose={() => setApplyTemplateModalVisible(false)}
                contract={selectedContract}
                templateId={selectedTemplate?._id || ''}
                templateName={selectedTemplate ? getTemplateName(selectedTemplate) : ''}
                onSuccess={handleApplyTemplateSuccess}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
        marginTop: 10,
    },
    header: {
        marginTop: responsiveSpacing(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: responsiveSpacing(16),
        paddingVertical: responsiveSpacing(12),
        backgroundColor: Colors.backgroud,
        position: 'relative',
    },
    backButton: {
        width: scale(36),
        height: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: scale(18),
        position: 'absolute',
        left: responsiveSpacing(16),
        zIndex: 1,
    },
    backIcon: {
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: responsiveFont(18),
        fontWeight: '700',
        color: Colors.black,
        textAlign: 'center',
    },
    listContent: {
        padding: responsiveSpacing(16),
        paddingBottom: responsiveSpacing(40),
    },
    templateItem: {
        backgroundColor: Colors.white,
        borderRadius: scale(8),
        marginBottom: responsiveSpacing(12),
        flexDirection: 'row',
    },
    templateContent: {
        flex: 1,
        padding: responsiveSpacing(16),
    },
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveSpacing(8),
    },
    templateName: {
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        flex: 1,
    },
    templateAmount: {
        fontSize: responsiveFont(16),
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    templateDetails: {
        marginBottom: responsiveSpacing(12),
    },
    templateDetail: {
        fontSize: responsiveFont(14),
        color: Colors.black,
        marginBottom: responsiveSpacing(4),
    },
    detailLabel: {
        color: Colors.mediumGray,
    },
    templateFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        paddingTop: responsiveSpacing(8),
    },
    templatePeriod: {
        fontSize: responsiveFont(13),
        color: Colors.mediumGray,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: responsiveSpacing(20),
        height: scale(300),
    },
    emptyText: {
        fontSize: responsiveFont(16),
        color: Colors.dearkOlive,
        textAlign: 'center',
        marginTop: responsiveSpacing(10),
    },
    emptySubText: {
        fontSize: responsiveFont(14),
        color: Colors.mediumGray,
        textAlign: 'center',
        marginTop: responsiveSpacing(8),
    },
    errorText: {
        fontSize: 16,
        color: Colors.red,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primaryGreen,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    deleteButton: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightRed,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    deleteIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.white,
    },
});

export default InvoiceTemplatesScreen;
