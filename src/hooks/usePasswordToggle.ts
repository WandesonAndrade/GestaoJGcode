import { useState, useCallback, useId } from 'react';

export interface UsePasswordToggleReturn {
  password: string;
  showPassword: boolean;
  inputType: 'text' | 'password';
  inputId: string;
  setPassword: (val: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleShowPassword: () => void;
}

export function usePasswordToggle(initialValue: string = ''): UsePasswordToggleReturn {
  const [password, setPassword] = useState(initialValue);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  return {
    password,
    showPassword,
    inputType: showPassword ? 'text' : 'password',
    inputId,
    setPassword,
    handleChange,
    toggleShowPassword,
  };
}
