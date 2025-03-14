import { useState } from 'react'
import { Button } from '@/components/ui/button'
import sellSometing from '@/assets/onlineShoping.svg'
import windowSoping from '@/assets/window_shoping.svg'
import { useNavigate } from '@tanstack/react-router'

export function ProductsPrimaryButtons() {
  const [showPopup, setShowPopup] = useState(false)
  const navigate = useNavigate()

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
                // Navigate to sell existing product page
                navigate({ to: '/products/createproduct' })
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
    </div>
  )
}