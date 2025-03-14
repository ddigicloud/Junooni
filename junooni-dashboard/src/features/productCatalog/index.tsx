"use client";

import Catalog from "./components/Catalog";
import Navbar from "./components/Navbar";


const ProductCatalog = () => {

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