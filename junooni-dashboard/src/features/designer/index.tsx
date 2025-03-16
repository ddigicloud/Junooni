// src/features/designer/index.tsx
import React from "react";
import TShirtDesigner from "./components/DataLoader";
import { useParams } from "@tanstack/react-router";




const Designer: React.FC = () => {

  const {id} = useParams({strict : false});

  return (
    <>
    
    <div className="min-h-screen p-8 bg-background">
      <TShirtDesigner  productId={id as string}  />
    </div>
    </>
  );
};

export default Designer;
