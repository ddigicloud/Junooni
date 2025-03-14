import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/order-columns'
import { DataTable } from './components/order-table'

import OrdersProvider from './context/order-context'
import { orders } from './data/orders'

export default function order() {
  return (
    <OrdersProvider>
      <Header fixed>
        <Search />
        <div className="flex items-center ml-auto space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="flex flex-wrap items-center justify-between mb-2 space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your orders!
            </p>
          </div>
       
        </div>
        <div className="flex-1 px-4 py-1 -mx-4 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable data={orders} columns={columns} />
        </div>
      </Main>

    </OrdersProvider>
  )
}
