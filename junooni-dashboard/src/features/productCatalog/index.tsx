"use client";

import Catalog from "./components/Catalog";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


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
    console.log("No token found, redirecting to sign-in page...");
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
        </div>
        
    </>
  );
 
};

export default ProductCatalog;