export interface ContractFormDataNoNotification {
  contractTerm: number;
  startDate: string;
  rules: string;
  additionalTerms: string;
  coTenants: string;
  maxOccupancy: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateContractFormNoNotification(
  form: ContractFormDataNoNotification,
): ValidationResult {
  const errors: string[] = [];

  if (!form.startDate || form.startDate.trim() === '') {
    errors.push('Vui lòng chọn ngày bắt đầu.');
  }

  if (!form.contractTerm || form.contractTerm <= 0) {
    errors.push('Thời hạn hợp đồng phải lớn hơn 0.');
  }

  if (!form.rules || form.rules.trim() === '') {
    errors.push('Vui lòng nhập điều khoản nội quy.');
  }

  if (!form.additionalTerms || form.additionalTerms.trim() === '') {
    errors.push('Vui lòng nhập điều khoản bổ sung.');
  }

  if (form.maxOccupancy === 0) {
    errors.push('Vui lòng chọn phòng trước khi tạo hợp đồng.');
  } else {
    // Chỉ validate số người khi đã có maxOccupancy
    const coTenantCount = form.coTenants
      ? form.coTenants
          .split(',')
          .map(s => s.trim())
          .filter(Boolean).length
      : 0;

    const totalPeople = 1 + coTenantCount;

    if (totalPeople > form.maxOccupancy) {
      errors.push(
        `Phòng chỉ cho phép tối đa ${form.maxOccupancy} người, nhưng hiện có ${totalPeople} người.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
