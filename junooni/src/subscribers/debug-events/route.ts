// subscribers/debug-all-events.ts - TEMPORARY DEBUG SUBSCRIBER  
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function debugAllEventsHandler({
  event: { name, data },
}: SubscriberArgs<any>) {
  // Log ALL events to see what's actually firing
  console.log(`🔥🔥🔥 EVENT: ${name}`, {
    data: data,
    timestamp: new Date().toISOString()
  });
}

export const config: SubscriberConfig = {
  event: "*", // Listen to EVERYTHING
}

/*
INSTRUCTIONS:
1. Create this file: src/subscribers/debug-all-events.ts
2. Restart your server
3. Place an order and fulfill it  
4. Check console logs to see what events fire
5. Look for fulfillment-related events
6. Delete this file when done debugging

This will show you exactly which events are firing when you fulfill orders.
*/