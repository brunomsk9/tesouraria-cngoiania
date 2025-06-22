
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const MoneyInput = ({ label, value, onChange, placeholder, className }: MoneyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(value.toFixed(2));
    }
  }, [value]);

  const formatCurrency = (val: string) => {
    // Remove tudo que não é número ou vírgula/ponto
    const numbers = val.replace(/[^\d.,]/g, '');
    
    // Converte para número
    const numericValue = parseFloat(numbers.replace(',', '.')) || 0;
    
    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = formatCurrency(inputValue);
    onChange(numericValue);
  };

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const num = parseFloat(val.replace(',', '.'));
    if (isNaN(num)) return val;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">R$</span>
        </div>
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || "0,00"}
          className="pl-10 text-right font-mono text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        />
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {formatDisplay(displayValue)}
        </p>
      )}
    </div>
  );
};
