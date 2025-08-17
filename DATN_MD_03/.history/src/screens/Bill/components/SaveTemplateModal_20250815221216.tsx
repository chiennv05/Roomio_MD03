import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Colors } from '../../../theme/color';

interface SaveTemplateModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (templateName: string) => void;
    loading: boolean;
    existingTemplateNames?: string[]; // Thêm mảng tên mẫu đã tồn tại
    saveError?: string; // Thêm lỗi từ server khi lưu
    maxLength?: number; // Độ dài tối đa cho tên mẫu
}

const SaveTemplateModal = ({
    visible,
    onClose,
    onSave,
    loading,
    existingTemplateNames = [],
    saveError,
    maxLength = 50,
}: SaveTemplateModalProps) => {
    const [templateName, setTemplateName] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!templateName.trim()) {
            setError('Vui lòng nhập tên mẫu hóa đơn');
            return;
        }

        // Kiểm tra độ dài tên mẫu
        if (templateName.trim().length > maxLength) {
            setError(`Tên mẫu không được quá ${maxLength} ký tự`);
            return;
        }

        // Kiểm tra tên mẫu đã tồn tại chưa
        if (existingTemplateNames.includes(templateName.trim())) {
            setError('Tên mẫu đã tồn tại, vui lòng chọn tên khác');
            return;
        }

        onSave(templateName.trim());
    };

    const handleClose = () => {
        setTemplateName('');
        setError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Lưu mẫu hóa đơn</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tên mẫu hóa đơn</Text>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            value={templateName}
                            onChangeText={(text) => {
                                setTemplateName(text);
                                setError('');
                            }}
                            placeholder="Nhập tên mẫu hóa đơn"
                            maxLength={maxLength}
                            autoFocus
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
                        <Text style={styles.charCounter}>
                            {templateName.length}/{maxLength}
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu mẫu</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        minHeight: 200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dearkOlive,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: Colors.mediumGray,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    inputError: {
        borderColor: Colors.red,
    },
    errorText: {
        color: Colors.red,
        fontSize: 12,
        marginTop: 5,
    },
    charCounter: {
        fontSize: 12,
        color: Colors.mediumGray,
        textAlign: 'right',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: 50,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        color: Colors.dearkOlive,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        backgroundColor: Colors.limeGreen,
        borderRadius: 50,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.black,
        fontWeight: 'bold',
    },
});

export default SaveTemplateModal;
