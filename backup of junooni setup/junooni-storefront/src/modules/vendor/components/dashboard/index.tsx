"use client"; 

import React, { useState, useEffect } from "react";
import ProductTable from "../../templates/product-table";
import CreateProductForm from "../../templates/create-product-form";

const VendorDashboard = () => {
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchVendorProducts = async () => {
      const token = localStorage.getItem("vendorToken");
      console.log("data token", token);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendors/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchVendorProducts();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>

      <div className="mb-8">
        <CreateProductForm />
      </div>

      <div>
        <ProductTable products={products} />
      </div>
    </div>
  );
};

export default VendorDashboard;
