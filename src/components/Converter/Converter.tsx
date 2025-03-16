import { ChangeEvent, useEffect, useState } from 'react';
import styles from './Converter.module.css';
import Select from '../Select/Select';
import Input from '../Input/input';

type Option = {
  CharCode: string;
  ID: string;
  Name: string;
  Nominal: number;
  Value: number;
};

type ConverterState = {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  result: number;
};

const Converter = (): JSX.Element => {
  const [currencies, setCurrencies] = useState<string[][]>([['', '']]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [state, setState] = useState<ConverterState>({
    amount: 0,
    fromCurrency: 'USD',
    toCurrency: 'RUB',
    result: 0,
  });
  const [inputBase, setInputBase] = useState<string>('amount');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        if (!res.ok) throw new Error('Ошибка при загрузке данных');

        const data = await res.json();
        const fetchedCurrencies: Option[] = Object.values(data.Valute);

        const currencies = fetchedCurrencies.map((el: Option) => [
          el.CharCode,
          el.Name,
        ]);
        setCurrencies([['RUB', 'Российский рубль'], ...currencies]);

        const rates = fetchedCurrencies.map((el: Option) => [
          el.CharCode,
          el.Value / el.Nominal,
        ]);
        rates.unshift(['RUB', 1]);
        setRates(Object.fromEntries(rates));
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>, stateProperty: 'from' | 'to') => {
    setState((prev) => ({
      ...prev,
      [`${stateProperty}Currency`]: e.target.value,
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, stateProperty: 'amount' | 'result') => {
    setState((prev) => ({
      ...prev,
      [stateProperty]: +e.target.value || 0,
    }));
    setInputBase(stateProperty);
  };

  const calculateConversion = () => {
    const value = state.amount * (rates[state.fromCurrency] / rates[state.toCurrency]);
    return value > 0.02 ? +(value.toFixed(2)) : +(value.toFixed(4));
  }

  const calculateConversionInverse = () => {
    const value =
      state.result *
      (1 / (rates[state.fromCurrency] / rates[state.toCurrency]));
    return value > 0.02 ? +value.toFixed(2) : +value.toFixed(4);
  }

  useEffect(() => {
    if (inputBase === 'result') {
      setState((prev) => ({
        ...prev,
        amount: calculateConversionInverse(),
      }));
      return;
    }
  
    setState((prev) => ({
      ...prev,
      result: calculateConversion(),
    }));

  }, [state.amount, state.result, state.fromCurrency, state.toCurrency]);

  return (
    <div className={styles.converter}>
      <div className={styles.inputWrap}>
        <Input
          type='number'
          value={state.amount || ''}
          onChange={(e) => handleInputChange(e, 'amount')}
        />
        <Select
          options={currencies}
          value={state.fromCurrency}
          onChange={(e) => handleSelectChange(e, 'from')}
        />
      </div>
      <div className={styles.inputWrap}>
        <Input
          type='number'
          value={state.result || ''}
          onChange={(e) => handleInputChange(e, 'result')}
        />
        <Select
          options={currencies}
          value={state.toCurrency}
          onChange={(e) => handleSelectChange(e, 'to')}
        />
      </div>
    </div>
  );
};

export default Converter;
