import React from 'react';

import styles from './Select.module.css'

type SelectProps = {
  value: string | null
  onSelect: (value: string) => void
  options: { label: string, value: string }[]
}

export const Select: React.FC<SelectProps> = ({ options, value, onSelect }) => {

  const innerOnChange = React.useCallback((event: React.SyntheticEvent<HTMLSelectElement>) => {
    onSelect(event.currentTarget.value)
  }, [onSelect])

  return (
    <select className={styles.Select} value={value ?? undefined} onChange={innerOnChange}>
      { options.map(({ label, value }) =>
        <option key={value} value={value}>{label}</option> )}
    </select>
  )
}
