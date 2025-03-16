import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styles from './Converter.module.css';
import Select from '../Select/Select';

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
  const leftInput = useRef<HTMLInputElement | null>(null);
  const rightInput = useRef<HTMLInputElement | null>(null);

  const [currencies, setCurrencies] = useState<string[][]>([['', '']]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [state, setState] = useState<ConverterState>({
    amount: 0,
    fromCurrency: 'RUB',
    toCurrency: 'USD',
    result: 0,
  });
  const [inputBase, setInputBase] = useState<HTMLInputElement | null>(null);

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
        setInputBase(leftInput.current)
        console.log(rates)
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  const handleFromSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      fromCurrency: e.target.value,
    });
  };

  const handleToSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      toCurrency: e.target.value,
    });
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      amount: +e.target.value || 0,
    });
    setInputBase(leftInput.current);
  };

  const handleResultChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      result: +e.target.value || 0,
    });

    setInputBase(rightInput.current)
  };

  useEffect(() => {
    if (inputBase === rightInput.current) {
      setState((prev) => ({
        ...prev,
        amount: +(
          (state.result * ( 1 / (rates[state.fromCurrency] /
          rates[state.toCurrency])))
        ).toFixed(6),
      }));
      return;
    }
  
      setState((prev) => ({
        ...prev,
        result: +(state.amount * (rates[state.fromCurrency] / rates[state.toCurrency])).toFixed(6),
      }));



    console.log(state.result);
  }, [state.amount, state.result, state.fromCurrency, state.toCurrency]);

  return (
    <>
      <div className={styles.converter}>
        <div className={styles.inputWrap}>
          <input
            type='number'
            className={styles.input}
            value={state.amount || ''}
            onChange={(e) => handleAmountChange(e)}
            ref={leftInput}
          />
          <Select
            options={currencies}
            value={state.fromCurrency}
            onChange={handleFromSelect}
          />
        </div>
        <div className={styles.inputWrap}>
          <input
            type='number'
            className={styles.input}
            value={state.result || ''}
            onChange={handleResultChange}
            ref={rightInput}
          />
          <Select
            options={currencies}
            value={state.toCurrency}
            onChange={handleToSelect}
          />
        </div>
      </div>
    </>
  );
};

export default Converter;
