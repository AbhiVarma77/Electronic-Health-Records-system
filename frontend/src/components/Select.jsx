import { forwardRef } from 'react';
import styles from './Select.module.css';

const Select = forwardRef(({ options, title, ...props }, ref) => {
  return (
    <div className={styles.wrp}>
      <span className={styles.title}>{title}</span>
      <select className={styles.select} ref={ref} {...props}>
        {options.map((option) => (
          <option
            key={option.value}
            type="radio"
            className={styles.input}
            name={title}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

Select.displayName = 'select';

export default Select;
