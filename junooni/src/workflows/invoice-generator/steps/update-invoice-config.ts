import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { INVOICE_MODULE } from "../../../modules/invoice-generator"

type StepInput = {
  id?: string
  company_name?: string
  company_address?: string
  company_phone?: string
  company_email?: string
  company_logo?: string
  notes?: string
}

export const updateInvoiceConfigStep = createStep(
  "update-invoice-config",
  async (input: StepInput | undefined | null, { container }) => {
    // Handle case where input is undefined, null, or empty
    if (!input || (typeof input === 'object' && Object.keys(input).length === 0)) {
      input = {}
    }

    // Safe destructuring with fallback
    const {
      id = undefined,
      company_name = undefined,
      company_address = undefined,
      company_phone = undefined,
      company_email = undefined,
      company_logo = undefined,
      notes = undefined
    } = input as StepInput

    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)

    // Get existing config for rollback purposes only
    let prevData = null
    try {
      const existingConfigs = await invoiceGeneratorService.listInvoiceConfigs()
      if (id) {
        // If ID provided, try to find that specific config for rollback
        prevData = existingConfigs.find(config => config.id === id) || null
      } else {
        // No ID provided, use first config for rollback
        prevData = existingConfigs?.[0] || null  
      }
    } catch (error) {
      prevData = null
    }

    // Use the custom method to avoid conflicts with base class
    const updatedData = await invoiceGeneratorService.updateInvoiceConfigData({
      id,
      company_name,
      company_address,
      company_phone,
      company_email,
      company_logo,
      notes
    })

    return new StepResponse(updatedData, prevData)
  },
  async (prevInvoiceConfig, { container }) => {
    if (!prevInvoiceConfig) {
      return
    }

    const invoiceGeneratorService = container.resolve(INVOICE_MODULE)

    await invoiceGeneratorService.updateInvoiceConfigData({
      id: prevInvoiceConfig.id,
      company_name: prevInvoiceConfig.company_name,
      company_address: prevInvoiceConfig.company_address,
      company_phone: prevInvoiceConfig.company_phone,
      company_email: prevInvoiceConfig.company_email,
      company_logo: prevInvoiceConfig.company_logo,
      notes: prevInvoiceConfig.notes
    })
  }
)