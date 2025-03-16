import { ChangeEvent } from 'react';
import styles from './Select.module.css';

type SelectProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[][]
}

const Select = ({value, onChange, options} : SelectProps) => {
  return (
    <select className={styles.select} value={value} onChange={onChange}>
      {options.map(([charCode, name]) => {
        return (
          <option value={charCode} key={charCode}>
            {name}
          </option>
        );
      })}
    </select>
  );
}

export default Select