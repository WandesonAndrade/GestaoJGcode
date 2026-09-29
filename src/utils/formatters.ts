/**
 * Formata CPF ou CNPJ de acordo com a quantidade de caracteres
 */
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }

  // CNPJ: 00.000.000/0000-00
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

/**
 * Remove formatação de CPF/CNPJ
 */
export function cleanCpfCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validação básica de tamanho de CPF (11) ou CNPJ (14)
 */
export function isValidCpfCnpj(value: string): boolean {
  const clean = cleanCpfCnpj(value);
  return clean.length === 11 || clean.length === 14;
}

/**
 * Formata valor em Real Brasileiro (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data no padrão brasileiro
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata data e hora no padrão brasileiro (DD/MM/AAAA às HH:MM)
 */
export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return 'Nunca acessou';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '-';
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${datePart} às ${timePart}`;
}

/**
 * Formata telefone brasileiro com DDD
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}
