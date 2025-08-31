// src/features/designer/index.tsx
import React from "react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import TShirtDesigner from "./components/DataLoader";
import { useParams } from "@tanstack/react-router";




const Designer: React.FC = () => {

  const {id} = useParams({strict : false});
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
    
    // Redirect to sign-in page
    window.location.href = '/sign-in';
    return;
  }
}, []); // Empty dependency array means this runs once when component mounts
  return (
    <>
    
    <div className="min-h-screen p-4 bg-background">
      <TShirtDesigner  productId={id as string}  />
    </div>
    </>
  );
};

export default Designer;
