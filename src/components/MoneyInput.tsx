
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

export const MoneyInput = ({ label, value, onChange, placeholder, className, id, disabled }: MoneyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    if (numericValue === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatForDisplay(numericValue));
    }
  }, [value]);

  const formatForDisplay = (val: number) => {
    return val.toFixed(2).replace('.', ',');
  };

  const parseInputValue = (inputValue: string): string => {
    // Remove tudo que não é número, vírgula ou ponto
    let cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Se estiver vazio, retorna '0'
    if (!cleanValue) return '0';
    
    // Substitui vírgula por ponto para conversão
    cleanValue = cleanValue.replace(',', '.');
    
    // Converte para número e volta para string
    const numericValue = parseFloat(cleanValue) || 0;
    
    return numericValue.toString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const stringValue = parseInputValue(inputValue);
    onChange(stringValue);
  };

  const handleFocus = () => {
    // Quando ganhar foco, mostrar apenas os números para facilitar edição
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    if (numericValue > 0) {
      setDisplayValue(formatForDisplay(numericValue));
    }
  };

  const handleBlur = () => {
    // Quando perder foco, formatar novamente se houver valor
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    if (numericValue > 0) {
      setDisplayValue(formatForDisplay(numericValue));
    } else if (displayValue && parseFloat(parseInputValue(displayValue)) === 0) {
      setDisplayValue('');
    }
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "0,00"}
          disabled={disabled}
          className={`pl-10 text-right font-mono text-lg ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'} border-gray-200 focus:bg-white transition-colors`}
        />
      </div>
      {(typeof value === 'string' ? parseFloat(value) : value) > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Valor: R$ {(typeof value === 'string' ? parseFloat(value) : value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
};
