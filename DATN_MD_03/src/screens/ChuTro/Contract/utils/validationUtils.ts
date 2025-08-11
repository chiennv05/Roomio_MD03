/**
 * Validate contract form data
 */
export interface ContractFormData {
  contractTerm: number;
  startDate: string;
  rules: string;
  additionalTerms: string;
  coTenants: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate contract form
 * @param formData - Contract form data
 * @returns Validation result
 */
export const validateContractForm = (formData: ContractFormData): ValidationResult => {
  const errors: string[] = [];

  // Validate contract term
  if (!formData.contractTerm || formData.contractTerm < 1) {
    errors.push('Thời hạn hợp đồng phải ít nhất 1 tháng');
  }

  if (formData.contractTerm > 60) {
    errors.push('Thời hạn hợp đồng không được quá 60 tháng');
  }

  // Validate start date
  if (!formData.startDate || formData.startDate.trim() === '') {
    errors.push('Vui lòng chọn ngày bắt đầu hợp đồng');
  }

  // Validate rules
  if (!formData.rules || formData.rules.trim() === '') {
    errors.push('Vui lòng nhập quy định của hợp đồng');
  }

  // Optional fields validation
  if (formData.rules && formData.rules.length > 1000) {
    errors.push('Quy định không được quá 1000 ký tự');
  }

  if (formData.additionalTerms && formData.additionalTerms.length > 1000) {
    errors.push('Điều khoản bổ sung không được quá 1000 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
