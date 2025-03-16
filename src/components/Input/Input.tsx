import { ChangeEvent } from 'react';
import styles from './Input.module.css'

type InputProps = {
  type: string;
  value: number | '';
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({type, value, onChange} : InputProps) => {
  return (
    <input
      type={type}
      className={styles.input}
      value={value}
      onChange={onChange}
    />
  )
}

export default Input