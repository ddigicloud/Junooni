// 'use client'
// import { Header } from '@/payload-types'
// import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

// export const RowLabel: React.FC<RowLabelProps> = () => {
//   const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

//   const label = data?.data?.link?.label
//     ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
//     : 'Row'

//   return <div>{label}</div>
// }

'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const label = data?.data?.link?.label
  const childrenCount = data?.data?.children?.length || 0
  
  let displayLabel = 'Nav Item'
  
  if (data.rowNumber !== undefined) {
    displayLabel = `Nav item ${data.rowNumber + 1}`
  }
  
  if (label) {
    displayLabel += `: ${label}`
  }
  
  if (childrenCount > 0) {
    displayLabel += ` (${childrenCount} children)`
  }

  return <div>{displayLabel}</div>
}

export const ChildRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<any>()

  const label = data?.data?.link?.label
  const subChildrenCount = data?.data?.subChildren?.length || 0
  
  let displayLabel = 'Child Item'
  
  if (data.rowNumber !== undefined) {
    displayLabel = `Child ${data.rowNumber + 1}`
  }
  
  if (label) {
    displayLabel += `: ${label}`
  }
  
  if (subChildrenCount > 0) {
    displayLabel += ` (${subChildrenCount} sub-items)`
  }

  return <div>{displayLabel}</div>
}

export const SubChildRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<any>()

  const label = data?.data?.link?.label
  
  let displayLabel = 'Sub Item'
  
  if (data.rowNumber !== undefined) {
    displayLabel = `Sub ${data.rowNumber + 1}`
  }
  
  if (label) {
    displayLabel += `: ${label}`
  }

  return <div>{displayLabel}</div>
}