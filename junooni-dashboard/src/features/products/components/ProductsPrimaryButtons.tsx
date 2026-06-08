export interface ProductsPrimaryButtonsHandle {
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;
}

import { useState, useEffect, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import sellSometing from '@/assets/onlineShoping.png'
import windowSoping from '@/assets/window_shoping.png'
import { useNavigate } from '@tanstack/react-router'

// Define BRAND object for styling
const BRAND = {
  primary: "#e65100",
  secondary: "#ac1900",
  accent: "#581845",
  light: "#FFC300",
  background: "#FFEFD5"
};

interface ProductsPrimaryButtonsProps {}

// Use forwardRef to pass a ref from parent components
const ProductsPrimaryButtonsComponent: ForwardRefRenderFunction<
  ProductsPrimaryButtonsHandle, 
  ProductsPrimaryButtonsProps> = (props, ref) => {
  const [showPopup, setShowPopup] = useState(false)
  const [showGSTVerificationMessage, setShowGSTVerificationMessage] = useState(false)
  const [vendor, setVendor] = useState(null)
  const navigate = useNavigate()

 // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    openPopup: () => setShowPopup(true),
    closePopup: () => setShowPopup(false),
    togglePopup: () => setShowPopup(prev => !prev)
  }));

  // Fetch vendor data when component mounts
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem('vendorToken')
        
        if (!token) {
          console.error('No authentication token found')
          return
        }
        
        const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        setVendor(data.vendor)
      } catch (error) {
        console.error('Error fetching vendor data:', error)
      }
    }

    fetchVendorData()
  }, [])
  
  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* <Button variant="outline">Import Products</Button> */}
        <Button style={{ backgroundColor: BRAND.primary }} onClick={() => setShowPopup(true)}>
          Add Product
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div id="tour-product-modal" className="relative w-full max-w-4xl bg-white">
            <div className="absolute top-0 right-0 flex justify-end p-4">
              <button 
                id="tour-product-modal-close"
                onClick={() => setShowPopup(false)}
                className="font-bold text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-0">
            {/* Design Something New */}
            <div 
              className="flex flex-col items-center p-4 transition border-b rounded-lg shadow-sm cursor-pointer md:p-6 md:border-b-0 md:border-r hover:bg-gray-50 md:rounded-none md:shadow-none"
              id="tour-product-modal-design"
              onClick={() => {
                setShowPopup(false);
                navigate({ to: '/productCatalog' })
              }}
            >
              <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
                <img src={windowSoping} alt="Design something new" className="max-w-full max-h-full" />
              </div>
              <h3 className="text-lg font-semibold text-center md:text-xl">Design Something Amazing</h3>
              <p className="mt-1 text-sm text-gray-500">Recommended</p>
            </div>

            {/* Sell Something I Have */}
            <div 
              className="flex flex-col items-center p-4 transition rounded-lg shadow-sm cursor-pointer md:p-6 hover:bg-gray-50 md:rounded-none md:shadow-none"
              id="tour-product-modal-existing"
              onClick={() => {
                setShowPopup(false);
                const gstStatus = vendor?.gst_verification_status || "pending";
                if (gstStatus === "verified") {
                  window.location.href = '/products/createproduct';
                } else {  
                  setShowGSTVerificationMessage(true);
                }
              }}
            >
              <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
                <img src={sellSometing} alt="Sell something I have" className="max-w-full max-h-full" />
              </div>
              <h3 className="text-lg font-semibold text-center md:text-xl">List Your Existing Products</h3>
              <p className="mt-1 text-sm text-red-500">GST Required</p>
            </div>
          </div>

          </div>
        </div>
      )}

      {/* GST Verification Message Modal */}
      {showGSTVerificationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
              <h3 className="text-lg font-semibold">GST Verification Required</h3>
            </div>
            <p className="mb-4 text-gray-600">
              You need to get your GST verified before you can add products to your store.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowGSTVerificationMessage(false)}
              >
                Close
              </Button>
              <Button 
                style={{ backgroundColor: BRAND.primary }}
                onClick={() => {
                  setShowGSTVerificationMessage(false);
                  window.location.href = '/onboarding?step=business-details';
                }}
              >
                Verify GST
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductsPrimaryButtons = forwardRef(ProductsPrimaryButtonsComponent);
// // Add a display name for better debugging
// // ProductsPrimaryButtons.displayName = 'ProductsPrimaryButtons';

