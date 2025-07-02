
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface MoneyInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export const MoneyInput = ({
  label,
  value,
  onChange,
  placeholder,
  className,
  id,
  disabled
}: MoneyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
      const val = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(val)) setDisplayValue(formatForDisplay(val));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatForDisplay = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseToNumericString = (val: string): string => {
    // Remove milhar e ajusta separador decimal
    const clean = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? '0' : num.toString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputValue = e.target.value;
    setDisplayValue(inputValue); // Permite digitação livre
  };

  const handleBlur = () => {
    const numericString = parseToNumericString(displayValue);
    const num = parseFloat(numericString);

    if (!isNaN(num) && num !== 0) {
      setDisplayValue(formatForDisplay(num)); // Formata para visualização
    } else {
      setDisplayValue('');
    }

    onChange(numericString); // Envia como número em formato string com ponto decimal
  };

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">R$</span>
        </div>
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => {}}
          placeholder={placeholder || '0,00'}
          disabled={disabled}
          className={`pl-10 text-right font-mono text-lg ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'} border-gray-200 focus:bg-white transition-colors`}
        />
      </div>
      {value && parseFloat(value.toString()) > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Valor: R$ {parseFloat(value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
};
