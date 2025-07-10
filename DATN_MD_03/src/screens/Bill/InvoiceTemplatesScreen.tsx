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
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Colors } from '../../theme/color';
import { fetchInvoiceTemplates, resetTemplatesState } from '../../store/slices/billSlice';

const InvoiceTemplatesScreen = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { token } = useAppSelector(state => state.auth);
    const { templates, templatesLoading, templatesError } = useAppSelector(state => state.bill);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadTemplates();

        return () => {
            dispatch(resetTemplatesState());
        };
    }, []);

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
        // TODO: Implement template selection logic
        Alert.alert(
            'Thông báo',
            'Tính năng sử dụng mẫu hóa đơn đang được phát triển',
            [{ text: 'OK' }]
        );
    };

    const formatPeriod = (period: any) => {
        if (!period) return 'N/A';
        if (typeof period === 'string') {
            return period;
        }
        if (period.month && period.year) {
            return `${period.month.toString().padStart(2, '0')}/${period.year}`;
        }
        return 'N/A';
    };

    const renderItem = ({ item }: { item: any }) => {
        const roomNumber = item.roomId?.roomNumber ||
            (item.contractId?.contractInfo?.roomNumber || 'Không xác định');

        const tenantName = item.tenantId?.fullName ||
            (item.contractId?.contractInfo?.tenantName || 'Không xác định');

        const templateName = item.note?.includes('TEMPLATE')
            ? item.note.split('TEMPLATE')[0].trim()
            : formatPeriod(item.period);

        return (
            <TouchableOpacity
                style={styles.templateItem}
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
        );
    };

    const renderEmptyList = () => {
        if (templatesLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryGreen} />
                    <Text style={styles.emptyText}>Đang tải mẫu hóa đơn...</Text>
                </View>
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
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Image
                        source={require('../../assets/icons/icon_arrow_back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mẫu hóa đơn</Text>
                <View style={{ width: 24 }} />
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroud,
    },
    header: {
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    templateItem: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
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
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    templateName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        flex: 1,
    },
    templateAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primaryGreen,
    },
    templateDetails: {
        marginBottom: 12,
    },
    templateDetail: {
        fontSize: 14,
        color: Colors.black,
        marginBottom: 4,
    },
    detailLabel: {
        color: Colors.mediumGray,
    },
    templateFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        paddingTop: 8,
    },
    templatePeriod: {
        fontSize: 13,
        color: Colors.mediumGray,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        height: 300,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.dearkOlive,
        textAlign: 'center',
        marginTop: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.mediumGray,
        textAlign: 'center',
        marginTop: 8,
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
});

export default InvoiceTemplatesScreen; 