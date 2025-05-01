import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { CheckCircle, AlertCircle } from "lucide-react"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div
      className="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
      data-testid={dataTestid}
    >
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              {label}
            </h3>
            <div className="text-gray-700">
              {typeof currentInfo === "string" ? (
                <span data-testid="current-info">{currentInfo}</span>
              ) : (
                currentInfo
              )}
            </div>
          </div>
          <div>
            <Button
              variant="secondary"
              className={clx(
                "min-h-[40px] px-5 py-2 text-sm font-medium transition-colors duration-200",
                state
                  ? "bg-gray-100 text-gray-700 border border-gray-300"
                  : "bg-[#fff2e5] text-[#e65100] border border-[#e65100]"
              )}
              onClick={handleToggle}
              type={state ? "reset" : "button"}
              data-testid="edit-button"
              data-active={state}
            >
              {state ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Success message */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-all duration-300 ease-in-out overflow-hidden px-6",
            {
              "max-h-[60px] opacity-100 py-4": isSuccess,
              "max-h-0 opacity-0 py-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <div className="flex items-center p-3 text-green-700 rounded-md gap-x-2 bg-green-50">
            <CheckCircle size={16} className="shrink-0" />
            <span className="text-sm">{label} updated successfully</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error message */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-all duration-300 ease-in-out overflow-hidden px-6",
            {
              "max-h-[60px] opacity-100 py-4": isError,
              "max-h-0 opacity-0 py-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <div className="flex items-center p-3 text-red-700 rounded-md gap-x-2 bg-red-50">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Edit form */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-all duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="p-6">
            <div className="space-y-4">{children}</div>

            <div className="flex items-center justify-end mt-6">
              <Button
                isLoading={pending}
                className="px-6 py-2.5 bg-[#e65100] hover:bg-[#c04500] text-white border-none transition-colors duration-200"
                type="submit"
                data-testid="save-button"
              >
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
