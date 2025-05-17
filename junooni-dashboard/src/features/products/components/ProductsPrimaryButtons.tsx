export interface ProductsPrimaryButtonsHandle {
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;
}

import { useState, useEffect, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import sellSometing from '@/assets/onlineShoping.svg'
import windowSoping from '@/assets/window_shoping.svg'
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
        
        const response = await fetch('http://localhost:9000/vendors/me', {
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
        <Button variant="outline">Import Products</Button>
        <Button onClick={() => setShowPopup(true)}>
          Add Product
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white max-w-4xl w-full relative">
            <div className="flex justify-end p-4 absolute right-0 top-0">
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-0">
              {/* Design Something New */}
              <div className="border-r p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50" onClick={() => {
                setShowPopup(false);
                // Navigate to create product page
                navigate({ to: '/productCatalog' })
              }}>
                <div className="mb-6 w-64 h-64 flex items-center justify-center">
                  <img src={windowSoping} alt="Design something new" className="max-w-full" />
                </div>
                <h3 className="text-xl font-semibold text-center">Design something new</h3>
              </div>

              {/* Sell Something I Have */}
              <div className="p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50" onClick={() => {
                setShowPopup(false);
                // Check GST verification status
                const gstStatus = vendor?.gst_verification_status || "pending";
                
                console.log("GST Status:", gstStatus);
                if (gstStatus === "verified") {
                  // Navigate to create product page
                  window.location.href = '/products/createproduct';
                } else {  
                  // Show GST verification message
                  setShowGSTVerificationMessage(true);
                }
              }}>
                <div className="mb-6 w-64 h-64 flex items-center justify-center">
                  <img src={sellSometing} alt="Sell something I have" className="max-w-full" />
                </div>
                <h3 className="text-xl font-semibold text-center">Sell something I have</h3>
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
// Add a display name for better debugging
// ProductsPrimaryButtons.displayName = 'ProductsPrimaryButtons';