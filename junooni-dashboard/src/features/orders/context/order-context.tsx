import { createContext, useContext, useState, ReactNode } from 'react'
import { Order, OrderSchema } from '../data/schema'

interface OrdersContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updatedData: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

interface OrdersProviderProps {
  children: ReactNode
}

const OrdersProvider = ({ children }: OrdersProviderProps) => {
  const [orders, setOrders] = useState<Order[]>([])

  const addOrder = (order: Order) => {
    const validatedOrder = OrderSchema.parse(order)
    setOrders((prev) => [...prev, validatedOrder])
  }

  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? OrderSchema.parse({ ...order, ...updatedData }) : order
      )
    )
  }

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider')
  }
  return context
}

export default OrdersProvider
