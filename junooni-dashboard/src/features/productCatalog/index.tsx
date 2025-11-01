"use client";

import Catalog from "./components/Catalog";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
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

const ProductCatalog = () => {
 const { toast } = useToast();
  // Add this useEffect near the top of your component, right after your state declarations
useEffect(() => {
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('vendorToken');
  
  // If no token is found, redirect to sign-in page
  if (!token) {
    // Show a toast notification
    toast({
      title: "Authentication Required",
      description: "Please sign in to access your profile.",
      variant: "destructive",
    });
    //console.log("No token found, redirecting to sign-in page...");
    // Redirect to sign-in page
    window.location.href = '/sign-in';
    return;
  }
}, []); // Empty dependency array means this runs once when component mounts
  return (
    <>
        <div className="relative" >
        <Navbar />
        <Catalog/>
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