'use client'

import type { ComponentPropsWithoutRef } from 'react'
import Input from './Input'

type Props = Omit<ComponentPropsWithoutRef<typeof Input>, 'type'> & {
  min?: string
  max?: string
}

export default function DateInput({ InputLabelProps, min, max, ...rest }: Props) {
  return (
    <Input
      type="date"
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      inputProps={{
        min,
        max,
        ...(rest.inputProps || {}),
      }}
      {...rest}
    />
  )
}
