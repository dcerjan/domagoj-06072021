import React from 'react'
import classnames from 'classnames'

import styles from './IconButton.module.css'

type IconButtonProps = {
  icon: string
  onClick: () => void
  label: string

  color?: 'regular' | 'danger'
  tooltip?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  label,

  color = 'regular',
  tooltip = '',
}) => {
  return (
    <button
      type='button'
      className={
        classnames(
          styles.IconButton,
          {
            [styles.Regular]: color === 'regular',
            [styles.Danger]: color === 'danger',
          }
        )
      }
      onClick={onClick}
      title={tooltip}
    >
      <i className={`fas ${icon}`} />
      { label }
    </button>
  )
}
