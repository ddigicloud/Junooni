"use client";

import Catalog from "./components/Catalog";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const BRAND = {
  primary: "#e65100", 
  secondary: "#ac1900", 
  accent: "#581845", 
  light: "#FFC300",
  background: "#FFEFD5", 
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999"
};

// const vite_backend = import.meta.env.VITE_MEDUSA_BACKEND_URL;

// // Utility function to decode JWT token and check validity (same as nav-user)
// const validateToken = () => {
//   try {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) return { isValid: false, hasActorId: false, actorId: null };

//     // Decode JWT token
//     const payload = JSON.parse(atob(token.split('.')[1]));
    
//     // Check if token is expired
//     if (payload.exp && payload.exp * 1000 < Date.now()) {
//       return { isValid: false, hasActorId: false, actorId: null };
//     }
    
//     const actorId = payload.actor_id || payload.sub || payload.id;
//     return { 
//       isValid: true,
//       hasActorId: !!actorId, 
//       actorId: actorId 
//     };
//   } catch (error) {
//     // Token is malformed/corrupted
//     return { isValid: false, hasActorId: false, actorId: null };
//   }
// };

const ProductCatalog = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // useEffect(() => {
  //   const validateAndVerify = async () => {
  //     try {
  //       setIsChecking(true);
  //       const token = localStorage.getItem("vendorToken");
        
  //       if (!token) {
  //         toast({
  //           title: "Authentication Required",
  //           description: "Please sign in to access the catalog.",
  //           variant: "destructive",
  //         });
  //         window.location.href = '/sign-in';
  //         return;
  //       }
        
  //       // Validate token first (client-side check)
  //       const { isValid, hasActorId, actorId } = validateToken();
        
  //       // If token is invalid or expired, go to sign-in
  //       if (!isValid) {
  //         localStorage.clear();
  //         toast({
  //           title: "Session Expired",
  //           description: "Please sign in again.",
  //           variant: "destructive",
  //         });
  //         window.location.href = '/sign-in';
  //         return;
  //       }
        
  //       // If token is valid but no actor_id, go to onboarding
  //       if (!hasActorId) {
  //         toast({
  //           title: "Complete Your Profile",
  //           description: "Please complete your vendor profile.",
  //           variant: "destructive",
  //         });
  //         window.location.href = '/onboarding?step=basic-info';
  //         return;
  //       }
        
  //       // Token is valid with actor_id, verify with backend
  //       try {
  //         const response = await fetch(`${vite_backend}/vendors/me`, {
  //           headers: {
  //             "Authorization": `Bearer ${token}`,
  //             "Content-Type": "application/json"
  //           },
  //         });

  //         if (response.ok) {
  //           const data = await response.json();
  //           if (data?.vendor) {
  //             // Vendor data exists, authenticated successfully
  //             setIsAuthenticated(true);
  //             setIsChecking(false);
  //           } else {
  //             // Unexpected response format
  //             setIsAuthenticated(true);
  //             setIsChecking(false);
  //           }
  //         } else if (response.status === 401) {
  //           // Token rejected by backend (expired/invalid)
  //           localStorage.clear();
  //           toast({
  //             title: "Session Expired",
  //             description: "Please sign in again.",
  //             variant: "destructive",
  //           });
  //           window.location.href = '/sign-in';
  //           return;
  //         } else {
  //           // Other error, but allow access (fallback)
  //           setIsAuthenticated(true);
  //           setIsChecking(false);
  //         }
  //       } catch (apiError) {
  //         console.error('Backend verification failed:', apiError);
  //         // Network error, but token is valid locally - allow access
  //         setIsAuthenticated(true);
  //         setIsChecking(false);
  //       }
        
  //     } catch (err) {
  //       console.error('Authentication validation failed:', err);
  //       localStorage.clear();
  //       toast({
  //         title: "Authentication Error",
  //         description: "Please sign in again.",
  //         variant: "destructive",
  //       });
  //       window.location.href = '/sign-in';
  //     }
  //   };

  //   validateAndVerify();
  // }, [toast]);

  // // Show loading state while checking authentication
  // if (isChecking || !isAuthenticated) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin" style={{ borderTopColor: BRAND.primary }}></div>
  //         {/* <p className="mt-4 text-gray-600">Loading...</p> */}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="relative">
        <Navbar />
        <Catalog />
        {/* Footer */}
        <div className="py-6 mt-4 border-t border-gray-200">
          <div className="container px-4 mx-auto text-center">
            <p className="text-sm" style={{ color: BRAND.textLight }}>
              &copy; {new Date().getFullYear()} Junooni. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCatalog;