'use client'

import { ReactNode } from 'react'
import Input from '@/app/components/ui/Input'
import Select from '@/app/components/ui/Select'
import Textarea from '@/app/components/ui/Textarea'
import { Info } from 'lucide-react'
import { Tooltip } from '@mui/material'

export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'custom'

export interface FormFieldOption {
    value: string | number
    label: string
}

export interface DetailFormField {
    name: string
    label: string
    type: FormFieldType
    required?: boolean
    placeholder?: string
    helperText?: string
    tooltip?: string
    options?: FormFieldOption[]
    gridCols?: number | { xs?: number; md?: number }
    rows?: number
    value?: string | number | boolean | null
    onChange?: (value: string | number | boolean) => void
    customRender?: () => ReactNode
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    className?: string
}

interface DetailFormProps {
    fields: DetailFormField[][]
    className?: string
}

/**
 * 공통 DetailForm 컴포넌트
 * 다양한 타입의 폼 필드를 동적으로 생성하여 표시
 * 
 * @example
 * <DetailForm
 *   fields={[
 *     [
 *       { name: 'name', label: '이름', type: 'text', required: true, value: form.name, onChange: (v) => setForm({...form, name: v}) },
 *       { name: 'price', label: '가격', type: 'number', required: true, value: form.price, onChange: (v) => setForm({...form, price: v}) }
 *     ]
 *   ]}
 * />
 */
export default function DetailForm({ fields, className = '' }: DetailFormProps) {
    const renderField = (field: DetailFormField, fieldIndex: number) => {
        if (field.customRender) {
            const gridClass = typeof field.gridCols === 'number'
                ? `md:col-span-${field.gridCols}`
                : field.gridCols
                  ? `col-span-${field.gridCols.xs || 12} md:col-span-${field.gridCols.md || field.gridCols.xs || 12}`
                  : ''
            return (
                <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                    {field.customRender()}
                </div>
            )
        }

        const labelElement = (
            <label className="block text-xs font-medium text-neutral-700 mb-0.5">
                {field.label}
                {field.required && <span className="text-rose-600"> *</span>}
                {field.tooltip && (
                    <Tooltip title={field.tooltip} arrow>
                        <Info size={14} className="inline ml-1 text-neutral-400 cursor-help" />
                    </Tooltip>
                )}
            </label>
        )

        const gridClass = typeof field.gridCols === 'number'
            ? `md:col-span-${field.gridCols}`
            : field.gridCols
              ? `col-span-${field.gridCols.xs || 12} md:col-span-${field.gridCols.md || field.gridCols.xs || 12}`
              : ''

        switch (field.type) {
            case 'text':
            case 'date':
                return (
                    <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                        {labelElement}
                        <Input
                            type={field.type as 'text' | 'date'}
                            value={String(field.value || '')}
                            onChange={(e) => field.onChange?.(e.target.value)}
                            {...(field.placeholder ? { placeholder: field.placeholder } : {})}
                            {...(field.disabled !== undefined ? { disabled: field.disabled } : {})}
                            {...(field.className ? { className: field.className } : {})}
                            fullWidth
                        />
                        {field.helperText && (
                            <p className="mt-0.5 text-xs text-neutral-400">{field.helperText}</p>
                        )}
                    </div>
                )

            case 'number':
                return (
                    <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                        {labelElement}
                        <Input
                            type="number"
                            value={String(field.value ?? '')}
                            onChange={(e) => {
                                const val = e.target.value
                                field.onChange?.(val === '' ? 0 : Number(val))
                            }}
                            {...(field.placeholder ? { placeholder: field.placeholder } : {})}
                            {...(field.disabled !== undefined ? { disabled: field.disabled } : {})}
                            {...(field.min !== undefined ? { min: field.min } : {})}
                            {...(field.max !== undefined ? { max: field.max } : {})}
                            {...(field.step !== undefined ? { step: field.step } : {})}
                            className={`text-right ${field.className || ''}`}
                            fullWidth
                        />
                        {field.helperText && (
                            <p className="mt-0.5 text-xs text-neutral-400">{field.helperText}</p>
                        )}
                    </div>
                )

            case 'select':
                return (
                    <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                        {labelElement}
                        <Select
                            value={String(field.value || '')}
                            onChange={(e) => field.onChange?.(e.target.value)}
                            {...(field.disabled !== undefined ? { disabled: field.disabled } : {})}
                            {...(field.className ? { className: field.className } : {})}
                        >
                            <option value="">선택하세요</option>
                            {field.options?.map((option) => (
                                <option key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        {field.helperText && (
                            <p className="mt-0.5 text-xs text-neutral-400">{field.helperText}</p>
                        )}
                    </div>
                )

            case 'textarea':
                return (
                    <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                        <Textarea
                            label={field.label}
                            value={String(field.value || '')}
                            onChange={(e) => field.onChange?.(e.target.value)}
                            {...(field.placeholder ? { placeholder: field.placeholder } : {})}
                            {...(field.rows ? { rows: field.rows } : {})}
                            {...(field.disabled !== undefined ? { disabled: field.disabled } : {})}
                            {...(field.className ? { className: field.className } : {})}
                        />
                        {field.helperText && (
                            <p className="mt-0.5 text-xs text-neutral-400">{field.helperText}</p>
                        )}
                    </div>
                )

            case 'checkbox':
                return (
                    <div key={fieldIndex} className={gridClass || 'col-span-12'}>
                        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                                type="checkbox"
                                checked={field.value === true}
                                onChange={(e) => field.onChange?.(e.target.checked)}
                                disabled={field.disabled}
                                className="rounded border-neutral-300"
                            />
                            <span>{field.label}</span>
                            {field.tooltip && (
                                <Tooltip title={field.tooltip} arrow>
                                    <Info size={14} className="text-neutral-400 cursor-help" />
                                </Tooltip>
                            )}
                        </label>
                        {field.helperText && (
                            <p className="mt-1 text-xs text-neutral-400">{field.helperText}</p>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {fields.map((row, rowIndex) => (
                <div key={rowIndex} className="grid gap-2 md:grid-cols-3">
                    {row.map((field, fieldIndex) => renderField(field, fieldIndex))}
                </div>
            ))}
        </div>
    )
}
