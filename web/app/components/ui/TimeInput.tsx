'use client'

import type { ComponentPropsWithoutRef } from 'react'
import Input from './Input'

type Props = Omit<ComponentPropsWithoutRef<typeof Input>, 'type'> & {
  step?: number
}

export default function TimeInput({ InputLabelProps, step = 300, ...rest }: Props) {
  return (
    <Input
      type="time"
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      inputProps={{
        step,
        ...(rest.inputProps || {}),
      }}
      {...rest}
    />
  )
}
