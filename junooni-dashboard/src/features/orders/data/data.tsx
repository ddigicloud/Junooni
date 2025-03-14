import {
    IconArrowDown,
    IconArrowRight,
    IconArrowUp,
    IconCircleCheck,
    IconCircleX,
    IconExclamationCircle,
    IconStopwatch,
  } from '@tabler/icons-react'
  
  // Order Types (similar to "labels" for tasks)
  export const orderTypes = [
    {
      value: 'standard',
      label: 'Standard',
    },
    {
      value: 'express',
      label: 'Express',
    },
    {
      value: 'international',
      label: 'International',
    },
  ]
  
  // Order Statuses (similar to task statuses)
  export const orderStatuses = [
    {
      value: 'pending',
      label: 'Pending',
      icon: IconExclamationCircle,
    },
    {
      value: 'processing',
      label: 'Processing',
      icon: IconStopwatch,
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: IconCircleCheck,
    },
    {
      value: 'canceled',
      label: 'Canceled',
      icon: IconCircleX,
    },
  ]
  
  // Order Priorities (you can adjust these as needed)
  export const orderPriorities = [
    {
      label: 'Low',
      value: 'low',
      icon: IconArrowDown,
    },
    {
      label: 'Medium',
      value: 'medium',
      icon: IconArrowRight,
    },
    {
      label: 'High',
      value: 'high',
      icon: IconArrowUp,
    },
  ]
  