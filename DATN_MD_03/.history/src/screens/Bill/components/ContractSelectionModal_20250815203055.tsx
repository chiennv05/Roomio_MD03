import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    SafeAreaView,
    Platform,
    Dimensions,
    TextInput,
} from 'react-native';
import LoadingAnimationWrapper from '../../../components/LoadingAnimationWrapper';
import { Colors } from '../../../theme/color';
import { Contract } from '../../../types/Contract';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { getMyContracts } from '../../../store/services/billService';
import { formatDate } from '../../../utils/formatDate';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ContractSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectContract: (contract: Contract) => void;
}

const ContractSelectionModal: React.FC<ContractSelectionModalProps> = ({
    visible,
    onClose,
    onSelectContract,
}) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const { token } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (visible && token) {
            loadContracts();
        }
    }, [visible, token]);

    // Lọc hợp đồng đang có hiệu lực và theo tên phòng
    useEffect(() => {
        let activeContracts = contracts.filter(contract => contract.status === 'active');
        
        // Lọc theo tên phòng nếu có searchText
        if (searchText.trim()) {
            activeContracts = activeContracts.filter(contract => {
                const roomNumber = typeof contract.roomId === 'object' ? 
                    contract.roomId.roomNumber : 
                    contract.contractInfo.roomAddress;
                
                return roomNumber?.toLowerCase().includes(searchText.toLowerCase().trim());
            });
        }
        
        setFilteredContracts(activeContracts);
    }, [contracts, searchText]);

    const loadContracts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMyContracts(token || '');
            if (response.success && response.data.contracts) {
                setContracts(response.data.contracts);
            } else {
                setError(response.message || 'Không thể tải danh sách hợp đồng');
            }
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContract = (contract: Contract) => {
        onSelectContract(contract);
        onClose();
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
    };

    const clearSearch = () => {
        setSearchText('');
    };

    const renderContractItem = ({ item }: { item: Contract }) => {
        // Lấy thông tin phòng từ hợp đồng
        const roomNumber = typeof item.roomId === 'object' ? item.roomId.roomNumber : 'Không xác định';
        const roomAddress = typeof item.roomId === 'object' && item.roomId.location ?
            item.roomId.location.addressText : item.contractInfo.roomAddress;

        // Lấy thông tin người thuê
        const tenantName = typeof item.tenantId === 'object' ?
            item.tenantId.fullName : item.contractInfo.tenantName;

        return (
            <TouchableOpacity
                style={styles.contractItem}
                onPress={() => handleSelectContract(item)}
            >
                <View style={styles.contractHeader}>
                    <Text style={styles.roomNumber}>{roomNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.statusText}>Đang hiệu lực</Text>
                    </View>
                </View>

                <Text style={styles.address}>{roomAddress}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Người thuê:</Text>
                    <Text style={styles.infoValue}>{tenantName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tiền thuê:</Text>
                    <Text style={styles.infoValue}>
                        {item.contractInfo.monthlyRent.toLocaleString('vi-VN')} đ/tháng
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thời hạn:</Text>
                    <Text style={styles.infoValue}>
                        {formatDate(item.contractInfo.startDate)} - {formatDate(item.contractInfo.endDate)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn hợp đồng</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm theo tên phòng..."
                                placeholderTextColor={Colors.mediumGray}
                                value={searchText}
                                onChangeText={handleSearch}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <LoadingAnimationWrapper 
                            visible={true}
                            message="Đang tải danh sách hợp đồng..."
                            size="medium"
                        />
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={loadContracts}>
                                <Text style={styles.retryButtonText}>Thử lại</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredContracts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchText.trim() 
                                    ? `Không tìm thấy phòng nào có tên "${searchText}"`
                                    : 'Không tìm thấy hợp đồng đang có hiệu lực'
                                }
                            </Text>
                            {searchText.trim() && (
                                <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
                                    <Text style={styles.clearSearchButtonText}>Xóa tìm kiếm</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <FlatList
                            data={filteredContracts}
                            renderItem={renderContractItem}
                            keyExtractor={(item) => item._id || ''}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                    <SafeAreaView style={styles.bottomSafeArea} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        // margin: 0,
        borderColor: Colors.lightGray,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 18,
        color: Colors.mediumGray,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 8,
        backgroundColor: Colors.mediumGray,
        borderRadius: 12,
        marginLeft: 8,
    },
    clearButtonText: {
        fontSize: 14,
        color: Colors.white,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    },
    contractItem: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    contractHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '500',
    },
    address: {
        fontSize: 14,
        color: Colors.mediumGray,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.mediumGray,
        width: 100,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.black,
        flex: 1,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: Colors.mediumGray,
        fontSize: 14,
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        color: Colors.red,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primaryGreen,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    retryButtonText: {
        color: Colors.white,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.mediumGray,
        textAlign: 'center',
    },
    clearSearchButton: {
        marginTop: 10,
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 4,
    },
    clearSearchButtonText: {
        color: Colors.mediumGray,
        fontSize: 14,
    },
    bottomSafeArea: {
        height: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: Colors.white,
    },
});

export default ContractSelectionModal;
