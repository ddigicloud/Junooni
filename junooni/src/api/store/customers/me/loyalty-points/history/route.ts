// import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { LOYALTY_MODULE } from "../../../../../../modules/loyalty"
// import LoyaltyModuleService from "../../../../../../modules/loyalty/service"

// export async function GET(
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) {
//   const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)
//   const history = await loyaltyModuleService.getPointsHistory(req.auth_context.actor_id)
//   res.json({ history })
// }

import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../../../../modules/loyalty";
import LoyaltyModuleService from "../../../../../../modules/loyalty/service";

interface HistoryQueryParams {
  limit?: string;
  offset?: string;
}

export async function GET(
  req: AuthenticatedMedusaRequest<HistoryQueryParams>,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  // Parse query parameters for pagination
  const limit = req.query?.limit ? parseInt(req.query.limit) : 50
  const offset = req.query?.offset ? parseInt(req.query.offset) : 0

  // Validate pagination parameters
  if (limit > 100) {
    return res.status(400).json({
      error: "Limit cannot exceed 100"
    })
  }

  if (limit < 1 || offset < 0) {
    return res.status(400).json({
      error: "Invalid pagination parameters"
    })
  }

  try {
    // Get transaction history for the authenticated customer
    const transactions = await loyaltyModuleService.getTransactionHistory(
      req.auth_context.actor_id,
      limit,
      offset
    )

    // Get current points balance
    const currentBalance = await loyaltyModuleService.getPoints(
      req.auth_context.actor_id
    )

    // Format transactions for better frontend consumption
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      points: transaction.points,
      balance_after: transaction.balance_after,
      event_type: transaction.event_type,
      description: transaction.description,
      reference_id: transaction.reference_id,
      reference_type: transaction.reference_type,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      // Add helper fields for frontend
      is_credit: transaction.points > 0,
      is_debit: transaction.points < 0,
      absolute_points: Math.abs(transaction.points),
    }))

    res.json({
      current_balance: currentBalance,
      transactions: formattedTransactions,
      pagination: {
        limit,
        offset,
        has_more: transactions.length === limit,
        total_returned: transactions.length
      }
    })

  } catch (error) {
    console.error('Error fetching loyalty transaction history:', error)

    res.status(500).json({
      error: "Failed to fetch transaction history"
    })
  }
}