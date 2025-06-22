
import { useState, useCallback } from 'react';

export const useCurrencyFormat = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = useState(
    formatToCurrency(initialValue)
  );
  const [numericValue, setNumericValue] = useState(initialValue);

  const handleChange = useCallback((value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    if (numbers === '') {
      setDisplayValue('');
      setNumericValue(0);
      return;
    }

    // Converte para número (centavos)
    const numeric = parseInt(numbers) / 100;
    
    setNumericValue(numeric);
    setDisplayValue(formatToCurrency(numeric));
  }, []);

  return {
    displayValue,
    numericValue,
    handleChange,
    setNumericValue: (value: number) => {
      setNumericValue(value);
      setDisplayValue(formatToCurrency(value));
    }
  };
};

export const formatToCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrencyToNumber = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return numbers === '' ? 0 : parseInt(numbers) / 100;
};
