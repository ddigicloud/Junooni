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

const ProductCatalog = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  
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