"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import { useEffect, useState, useActionState } from "react"
import { useRouter } from "next/navigation"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"

const AddAddress = ({
  region,
  addresses,
  redirectToAddressPage = false,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
  redirectToAddressPage?: boolean
}) => {
  const router = useRouter()
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
  })

  // Redirect to address page if requested
  const handleButtonClick = () => {
    if (redirectToAddressPage) {
      router.push("/account/addresses")
    } else {
      open()
    }
  }

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="border border-ui-border-base hover:border-[#e65100] rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-all duration-200 hover:shadow-md bg-white"
        onClick={handleButtonClick}
        data-testid="add-address-button"
      >
        <span className="text-base-semi font-medium text-gray-800">
          New address
        </span>
        <div className="flex justify-center items-center">
          <div className="p-3 rounded-full bg-[#e65100]/10 flex items-center justify-center">
            <Plus className="text-[#e65100]" />
          </div>
        </div>
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2 text-[#e65100]">Add address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                  className="focus:border-[#e65100]"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                  className="focus:border-[#e65100]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Company"
                  name="company"
                  autoComplete="organization"
                  data-testid="company-input"
                  className="focus:border-[#e65100]"
                />
                <Input
                  label="Phone"
                  name="phone"
                  autoComplete="phone"
                  data-testid="phone-input"
                  className="focus:border-[#e65100]"
                />
              </div>
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
                className="focus:border-[#e65100]"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
                className="focus:border-[#e65100]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                  className="focus:border-[#e65100]"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  autoComplete="locality"
                  data-testid="city-input"
                  className="focus:border-[#e65100]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Province / State"
                  name="province"
                  autoComplete="address-level1"
                  data-testid="state-input"
                  className="focus:border-[#e65100]"
                />
                <CountrySelect
                  name="country_code"
                  region={region}
                  required
                  autoComplete="country"
                  data-testid="country-select"
                  className="focus:border-[#e65100]"
                />
              </div>
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-11 w-full sm:w-auto order-2 sm:order-1"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton
                data-testid="save-button"
                className="bg-[#e65100] hover:bg-[#e65100]/90 w-full sm:w-auto order-1 sm:order-2"
              >
                Save
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
