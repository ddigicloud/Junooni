"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { UserCircle, LogOut, Heart, Package, Settings, User } from "lucide-react"
import { Fragment, useState } from "react"
import { useParams } from "next/navigation"
import { signout } from "@lib/data/customer"

const AccountDropdown = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const { countryCode } = useParams() as { countryCode: string }

  const open = () => setAccountDropdownOpen(true)
  const close = () => setAccountDropdownOpen(false)

  const handleLogout = async () => {
    await signout(countryCode)
    close()
  }

  const isLoggedIn = !!customer?.email

  return (
    <div
      className="z-50 h-full"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="relative flex hover:text-ui-fg-base"
            href="/account"
            data-testid="nav-account-link"
          >
            <UserCircle className="w-5 h-5" />
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={accountDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[300px] text-ui-fg-base"
            data-testid="nav-account-dropdown"
          >
            <div className="flex items-center justify-center p-4">
              <h3 className="text-large-semi">Account</h3>
            </div>
            {isLoggedIn ? (
              <>
                <div className="px-6 pb-4 border-b border-gray-200">
                  <p className="text-small-regular text-gray-700">
                    Signed in as
                  </p>
                  <p className="text-base-regular">
                    {customer.first_name && customer.last_name
                      ? `${customer.first_name} ${customer.last_name}`
                      : customer.email}
                  </p>
                </div>
                <div className="py-4">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <LocalizedClientLink 
                        href="/account" 
                        className="flex items-center px-6 py-2 hover:bg-gray-50"
                        onClick={close}
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span>Account Overview</span>
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink 
                        href="/account/orders" 
                        className="flex items-center px-6 py-2 hover:bg-gray-50"
                        onClick={close}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        <span>Orders</span>
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink 
                        href="/wishlist" 
                        className="flex items-center px-6 py-2 hover:bg-gray-50"
                        onClick={close}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        <span>Wishlist</span>
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink 
                        href="/account/profile" 
                        className="flex items-center px-6 py-2 hover:bg-gray-50"
                        onClick={close}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        <span>Settings</span>
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center p-4 border-t border-gray-200">
                  <Button 
                    variant="secondary"
                    className="flex items-center gap-x-2"
                    type="button"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex flex-col items-center justify-center py-4 px-4">
                  <p className="text-center text-small-regular mb-4">
                    Sign in to view your account details, track orders, and more.
                  </p>
                  <div className="flex flex-col w-full gap-y-2">
                    <LocalizedClientLink 
                      href="/account" 
                      className="w-full" 
                      passHref
                      onClick={close}
                    >
                      <Button 
                        className="w-full" 
                        size="large"
                      >
                        Sign in
                      </Button>
                    </LocalizedClientLink>
                    <LocalizedClientLink 
                      href="/account/register" 
                      className="w-full" 
                      passHref
                      onClick={close}
                    >
                      <Button 
                        variant="secondary"
                        className="w-full" 
                        size="large"
                      >
                        Create account
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default AccountDropdown