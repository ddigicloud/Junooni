// src/subscribers/handle-reset.ts
import { Modules } from "@medusajs/framework/utils"

export default async function resetPasswordTokenHandler({
  event: { data: { entity_id: email, token, actor_type } },
  container,
}) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  let urlPrefix
  switch (actor_type) {
    case "vendor":
      urlPrefix = "http://localhost:5173"
      break
    case "customer":
      urlPrefix = "http://localhost:8000"
      break
    default:
      urlPrefix = "http://localhost:9000/app"
      break
  }

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "reset-password-template",
    data: {
      url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
    },
  })
}

export const config = {
  event: "auth.password_reset",
}
