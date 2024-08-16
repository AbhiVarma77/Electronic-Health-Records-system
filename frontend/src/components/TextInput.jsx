import React, { forwardRef } from 'react';
import styles from './TextInput.module.css';

const TextInput = forwardRef(
  ({ label, error, containerStyles, inputStyles, ...props }, ref) => {
    return (
      <div className={styles.wrp} style={containerStyles}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={styles.input}
          style={inputStyles}
          label={label}
          {...props}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
