// src/features/designer/index.tsx
import React from "react";
import TShirtDesigner from "./components/DataLoader";

const Designer: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <TShirtDesigner />
    </div>
  );
};

export default Designer;
