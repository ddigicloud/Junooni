// // // // Add a display name for better debugging
// // // // ProductsPrimaryButtons.displayName = 'ProductsPrimaryButtons';


// import { useState, forwardRef, useImperativeHandle } from 'react'
// import { Button } from '@/components/ui/button'
// import sellSometing from '@/assets/onlineShoping.jpeg'
// import windowSoping from '@/assets/window_shoping.jpeg'
// import { useNavigate } from '@tanstack/react-router'

// export interface ProductsPrimaryButtonsHandle {
//   openPopup: () => void;
//   closePopup: () => void;
//   togglePopup: () => void;
// }

// const BRAND = {
//   primary: "#e65100",
//   secondary: "#ac1900",
//   accent: "#581845",
//   light: "#FFC300",
//   background: "#FFEFD5"
// };

// export const ProductsPrimaryButtons = forwardRef<ProductsPrimaryButtonsHandle>((props, ref) => {
//   const [showPopup, setShowPopup] = useState(false)
//   const navigate = useNavigate()

//   useImperativeHandle(ref, () => ({
//     openPopup: () => setShowPopup(true),
//     closePopup: () => setShowPopup(false),
//     togglePopup: () => setShowPopup(prev => !prev)
//   }));

//   return (
//     <div className="relative">
//       <div className="flex gap-2">
//         <Button style={{ backgroundColor: BRAND.primary }} onClick={() => setShowPopup(true)}>
//           Add Product
//         </Button>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
//           <div id="tour-product-modal" className="relative w-full max-w-4xl bg-white">
//             <div className="absolute top-0 right-0 flex justify-end p-4">
//               <button
//                 id="tour-product-modal-close"
//                 onClick={() => setShowPopup(false)}
//                 className="font-bold text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-0">
//               {/* Design Something New */}
//               <div
//                 className="flex flex-col items-center p-4 transition border-b rounded-lg shadow-sm cursor-pointer md:p-6 md:border-b-0 md:border-r hover:bg-gray-50 md:rounded-none md:shadow-none"
//                 id="tour-product-modal-design"
//                 onClick={() => {
//                   setShowPopup(false);
//                   navigate({ to: '/productCatalog' })
//                 }}
//               >
//                 <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
//                   <img src={windowSoping} alt="Design something new" className="max-w-full max-h-full" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-center md:text-xl">Design Something Amazing</h3>
//                 <p className="mt-1 text-sm text-gray-500">Recommended</p>
//               </div>

//               {/* Sell Something I Have */}
//               <div
//                 className="flex flex-col items-center p-4 transition rounded-lg shadow-sm cursor-pointer md:p-6 hover:bg-gray-50 md:rounded-none md:shadow-none"
//                 id="tour-product-modal-existing"
//                 onClick={() => {
//                   setShowPopup(false);
//                   window.location.href = '/products/createproduct';
//                 }}
//               >
//                 <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
//                   <img src={sellSometing} alt="Sell something I have" className="max-w-full max-h-full" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-center md:text-xl">List Your Existing Products</h3>
//                 <p className="mt-1 text-sm text-gray-500">Add products from your inventory</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });

// ProductsPrimaryButtons.displayName = 'ProductsPrimaryButtons';



import { useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import sellSometing from '@/assets/onlineShoping.jpeg'
import windowSoping from '@/assets/window_shoping.jpeg'
import { useNavigate } from '@tanstack/react-router'

export interface ProductsPrimaryButtonsHandle {
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;
}

interface ProductsPrimaryButtonsProps {
  totalProducts?: number;
  vendorPlan?: string;
}

const BRAND = {
  primary: "#e65100",
};

const PLAN_LIMITS: Record<string, number | null> = {
  free: 30,
  starter: 50,
  growth: null,
  pro: null,
  enterprise: null,
};

function ProductsPrimaryButtonsInner(
  props: ProductsPrimaryButtonsProps,
  ref: React.ForwardedRef<ProductsPrimaryButtonsHandle>
) {
  const { totalProducts = 0, vendorPlan = 'free' } = props;
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    openPopup: () => setShowPopup(true),
    closePopup: () => setShowPopup(false),
    togglePopup: () => setShowPopup(prev => !prev),
  }));

  const planKey = (vendorPlan || 'free').toLowerCase();
  const limit = PLAN_LIMITS[planKey] ?? null;
  const isAtLimit = limit !== null && totalProducts >= limit;
  const planLabel = planKey.charAt(0).toUpperCase() + planKey.slice(1);
  const nextPlan = planKey === 'free' ? 'Starter' : 'Growth';

  return (
    <div className="relative">
      <div className="flex flex-col items-start gap-1">
        <Button
          style={isAtLimit ? {} : { backgroundColor: BRAND.primary }}
          disabled={isAtLimit}
          onClick={() => !isAtLimit && setShowPopup(true)}
          className={isAtLimit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
        >
          Add Product
        </Button>

        {isAtLimit && (
          <p className="text-xs text-red-500 max-w-[220px]">
            You've reached the {limit}-product limit on the{' '}
            <span className="font-semibold">{planLabel}</span> plan. Upgrade to{' '}
            <span className="font-semibold">{nextPlan}</span> to add more.
          </p>
        )}

        {/* {!isAtLimit && limit !== null && (
          <p className="text-xs text-gray-400">
            {totalProducts}/{limit} products on {planLabel} plan
          </p>
        )} */}
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-full max-w-4xl bg-white">
            <div className="absolute top-0 right-0 flex justify-end p-4">
              <button
                onClick={() => setShowPopup(false)}
                className="font-bold text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-0">
              <div
                className="flex flex-col items-center p-4 transition border-b rounded-lg shadow-sm cursor-pointer md:p-6 md:border-b-0 md:border-r hover:bg-gray-50 md:rounded-none md:shadow-none"
                onClick={() => {
                  setShowPopup(false);
                  navigate({ to: '/productCatalog' });
                }}
              >
                <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
                  <img src={windowSoping} alt="Design something new" className="max-w-full max-h-full" />
                </div>
                <h3 className="text-lg font-semibold text-center md:text-xl">Design Something Amazing</h3>
                <p className="mt-1 text-sm text-gray-500">Recommended</p>
              </div>

              <div
                className="flex flex-col items-center p-4 transition rounded-lg shadow-sm cursor-pointer md:p-6 hover:bg-gray-50 md:rounded-none md:shadow-none"
                onClick={() => {
                  setShowPopup(false);
                  window.location.href = '/products/createproduct';
                }}
              >
                <div className="flex items-center justify-center w-40 h-40 mb-4 md:w-64 md:h-64 md:mb-6">
                  <img src={sellSometing} alt="Sell something I have" className="max-w-full max-h-full" />
                </div>
                <h3 className="text-lg font-semibold text-center md:text-xl">List Your Existing Products</h3>
                <p className="mt-1 text-sm text-gray-500">Add products from your inventory</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ProductsPrimaryButtons = forwardRef(ProductsPrimaryButtonsInner);
ProductsPrimaryButtons.displayName = 'ProductsPrimaryButtons';