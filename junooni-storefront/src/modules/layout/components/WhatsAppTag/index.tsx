

import { FaWhatsapp } from "react-icons/fa";

const WhatsAppTag = () => {
  const phoneNumber = process.env.WHATSAPP_NUMBER; // Replace with your WhatsApp number
  const message = encodeURIComponent("Hello! I'm interested in your services.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex items-center px-2 py-2 text-white transition bg-black rounded-full shadow-lg bottom-6 right-4 hover:bg-green-600"
    >
      <FaWhatsapp size={24} />
                                                            
    </a>
  );
};

export default WhatsAppTag;
