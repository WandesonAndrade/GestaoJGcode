import { useState, useCallback, useId } from 'react';
import { formatCpfCnpj } from '../utils/formatters';

export type DocType = 'CPF' | 'CNPJ' | null;

export interface UseCpfCnpjReturn {
  value: string;
  rawDigits: string;
  docType: DocType;
  isValid: boolean;
  inputId: string;
  setValue: (val: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate: () => boolean;
}

export function useCpfCnpj(initialValue: string = ''): UseCpfCnpjReturn {
  const [value, setValueState] = useState<string>(formatCpfCnpj(initialValue));
  const inputId = useId();

  const rawDigits = value.replace(/\D/g, '');
  const docType: DocType = rawDigits.length > 11 ? 'CNPJ' : rawDigits.length > 0 ? 'CPF' : null;
  const isValid = rawDigits.length === 11 || rawDigits.length === 14;

  const setValue = useCallback((val: string) => {
    setValueState(formatCpfCnpj(val));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValueState(formatCpfCnpj(e.target.value));
  }, []);

  const validate = useCallback(() => {
    return rawDigits.length >= 11;
  }, [rawDigits]);

  return {
    value,
    rawDigits,
    docType,
    isValid,
    inputId,
    setValue,
    handleChange,
    validate,
  };
}
