import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

// ─── Step: Add COD fee line item ───────────────────────────────────────────
const addCodFeeLineItemStep = createStep(
  "add-cod-fee-line-item-step",
  async (input: { cart_id: string }, { container }) => {
    const cartService = container.resolve(Modules.CART)

    const cart = await cartService.retrieveCart(input.cart_id, {
      relations: ["items"],
    })

    // Don't add if already exists
    const existing = cart.items?.find(
      (item: any) => item.metadata?.is_cod_fee === true
    )
    if (existing) {
      return new StepResponse({ item: existing, already_exists: true })
    }

    const [codFeeItem] = await cartService.addLineItems([
      {
        cart_id: input.cart_id,
        title: "COD Fee",
        unit_price: 40, // ₹40 in paise
        quantity: 1,
        requires_shipping: false,
        is_discountable: false,
        metadata: {
          is_cod_fee: true,
          non_returnable: true,
        },
      },
    ])

    return new StepResponse(
      { item: codFeeItem, already_exists: false },
      { item_id: codFeeItem.id, cart_id: input.cart_id }
    )
  },
  // Compensation — remove if workflow fails
  async (compensationInput, { container }) => {
    if (!compensationInput) return
    const cartService = container.resolve(Modules.CART)
    await cartService.deleteLineItems([compensationInput.item_id])
  }
)

// ─── Step: Remove COD fee line item ────────────────────────────────────────
const removeCodFeeLineItemStep = createStep(
  "remove-cod-fee-line-item-step",
  async (input: { cart_id: string }, { container }) => {
    const cartService = container.resolve(Modules.CART)

    const cart = await cartService.retrieveCart(input.cart_id, {
      relations: ["items"],
    })

    const codFeeItem = cart.items?.find(
      (item: any) => item.metadata?.is_cod_fee === true
    )

    if (!codFeeItem) {
      return new StepResponse({ removed: false })
    }

    await cartService.deleteLineItems([codFeeItem.id])

    return new StepResponse(
      { removed: true },
      { item_id: codFeeItem.id, cart_id: input.cart_id }
    )
  }
)

// ─── Workflows ──────────────────────────────────────────────────────────────
export const addCodFeeWorkflow = createWorkflow(
  "add-cod-fee-workflow",
  (input: { cart_id: string }) => {
    const result = addCodFeeLineItemStep(input)
    return new WorkflowResponse(result)
  }
)

export const removeCodFeeWorkflow = createWorkflow(
  "remove-cod-fee-workflow",
  (input: { cart_id: string }) => {
    const result = removeCodFeeLineItemStep(input)
    return new WorkflowResponse(result)
  }
)