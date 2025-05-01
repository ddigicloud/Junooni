import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react"

/**
 * Help component provides customer support options for the order page
 * Displays contact methods (phone, email, chat) and a contact button
 */
const Help = () => {
  return (
    <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6">
        {/* Component Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
              <HelpCircle size={20} />
            </div>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">
            Need Help?
          </h2>
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          {/* Help description */}
          <p className="mb-4 text-sm text-gray-600">
            If you have any questions or concerns about your order, please don't
            hesitate to contact our customer support team.
          </p>

          {/* Contact methods grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Phone contact */}
            <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Call Us</h3>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>

            {/* Email contact */}
            <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Email</h3>
                <p className="text-sm text-gray-600">support@example.com</p>
              </div>
            </div>

            {/* Live chat option */}
            <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
          </div>

          {/* Contact button */}
          <div className="mt-4">
            <button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
