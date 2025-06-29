
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface MoneyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export const MoneyInput = ({ label, value, onChange, placeholder, className, id, disabled }: MoneyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      // Mostrar o valor formatado apenas quando não está em foco
      setDisplayValue(formatForDisplay(value));
    }
  }, [value]);

  const formatForDisplay = (val: number) => {
    return val.toFixed(2).replace('.', ',');
  };

  const parseInputValue = (inputValue: string): number => {
    // Remove tudo que não é número, vírgula ou ponto
    let cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Se estiver vazio, retorna 0
    if (!cleanValue) return 0;
    
    // Substitui vírgula por ponto para conversão
    cleanValue = cleanValue.replace(',', '.');
    
    // Converte para número
    const numericValue = parseFloat(cleanValue) || 0;
    
    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseInputValue(inputValue);
    onChange(numericValue);
  };

  const handleFocus = () => {
    // Quando ganhar foco, mostrar apenas os números para facilitar edição
    if (value > 0) {
      setDisplayValue(formatForDisplay(value));
    }
  };

  const handleBlur = () => {
    // Quando perder foco, formatar novamente se houver valor
    if (value > 0) {
      setDisplayValue(formatForDisplay(value));
    } else if (displayValue && parseInputValue(displayValue) === 0) {
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
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Valor: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
};
