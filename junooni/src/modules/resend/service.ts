import { 
  AbstractNotificationProviderService, 
  MedusaError
} from "@medusajs/framework/utils"
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO,
  Logger
} from "@medusajs/framework/types";
import { 
  CreateEmailOptions, 
  Resend
} from "resend";
import { orderPlacedEmail } from "./emails/order-placed";
import { resetPasswordEmail } from "./emails/reset-password-template";
import { onboardingReminderEmail } from "./emails/onboarding-reminder"
import { vendorOrderPlacedEmail } from "./emails/vendor-order-placed"
import { adminOrderPlacedEmail } from "./emails/admin-order-placed"
import { accountMergeConfirmationEmail } from "./emails/account-merge-confirmation"
import { creatorOtpEmail } from "./emails/creator-otp"

enum Templates {
  ORDER_PLACED = "order-placed",
  RESET_PASSWORD = "reset-password-template",
  ONBOARDING_REMINDER = "onboarding-reminder",
  VENDOR_ORDER_PLACED = "vendor-order-placed",
  ADMIN_ORDER_PLACED = "admin-order-placed",
  ACCOUNT_MERGE_CONFIRMATION = "account-merge-confirmation", // ← NEW
  CREATOR_OTP = "creator-otp", // ← NEW
}

const templates: {[key in Templates]?: (props: unknown) => React.ReactNode} = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.RESET_PASSWORD]: resetPasswordEmail,
  [Templates.ONBOARDING_REMINDER]: onboardingReminderEmail,
  [Templates.VENDOR_ORDER_PLACED]: vendorOrderPlacedEmail,
  [Templates.ADMIN_ORDER_PLACED]: adminOrderPlacedEmail,
  [Templates.ACCOUNT_MERGE_CONFIRMATION]: accountMergeConfirmationEmail, // ← NEW
  [Templates.CREATOR_OTP]: creatorOtpEmail, // ← NEW
}

type ResendOptions = {
  api_key: string
  from: string
  html_templates?: Record<string, {
    subject?: string
    content: string
  }>
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor(
    { logger }: InjectedDependencies, 
    options: ResendOptions
  ) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      )
    }
  }

  getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }
    const allowedTemplates = Object.keys(templates)

    if (!allowedTemplates.includes(template)) {
      return null
    }

    return templates[template]
  }

  getTemplateSubject(template: Templates) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject
    }
    switch(template) {
      case Templates.ORDER_PLACED:
        return "Order Confirmation"
      case Templates.RESET_PASSWORD:
        return "Reset Your Password"
      case Templates.ONBOARDING_REMINDER:
        return "Complete your Junooni Creator onboarding 🎨"
      case Templates.VENDOR_ORDER_PLACED:
        return "New order received 🎉"
      case Templates.ADMIN_ORDER_PLACED:
        return "New order placed on Junooni"
      case Templates.ACCOUNT_MERGE_CONFIRMATION:          // ← NEW
        return "Did you just create a JUNOONI account? 🔐" // ← NEW
      case Templates.CREATOR_OTP:
        return "Your JUNOONI verification code 🔐"
      default:
        return "New Email"
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates)

    if (!template) {
      this.logger.error(`Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(Templates)}`)
      return {}
    }

    // const commonOptions = {
    //   from: this.options.from,
    //   to: [notification.to],
    //   subject: this.getTemplateSubject(notification.template as Templates),
    // }

    const storeName = (notification.data as any)?.storeName
    const vendorHandle = (notification.data as any)?.order?.metadata?.vendor_ids?.[0]

    // For vendor store orders, send from {handle}@junooni.com
    // For marketplace orders, fall back to default (orders@junooni.com)
    const defaultFrom = storeName && vendorHandle
      ? `${storeName} <${vendorHandle}@junooni.com>`
      : this.options.from

   const commonOptions = {
      from: (notification as any).from || this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
      replyTo: "support@junooni.com",
    }

    let emailOptions: CreateEmailOptions
    if (typeof template === "string") {
      emailOptions = {
        ...commonOptions,
        html: template,
      }
    } else {
      emailOptions = {
        ...commonOptions,
        react: template(notification.data),
      }
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error || !data) {
      if (error) {
        this.logger.error("Failed to send email", error)
      } else {
        this.logger.error("Failed to send email: unknown error")
      }
      return {}
    }

    return { id: data.id }
  }
}

export default ResendNotificationProviderService