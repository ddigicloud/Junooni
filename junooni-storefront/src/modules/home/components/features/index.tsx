import React from 'react';
import assets from "@assets/assets"

// Define the type for each furniture category
interface junooniCategory {
  id: string;
  name: string;
  image: string;
}

// Component for individual category
const CategoryItem: React.FC<junooniCategory> = ({ name, image }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Circular container for image */}
      <div className="w-64 h-64 rounded-full bg-[#f9f5f0] flex items-center justify-center mb-4 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-3/4 h-auto object-contain"
        />
      </div>
      {/* Category name */}
      <h3 className="text-xl font-bold text-gray-800">{name}</h3>
    </div>
  );
};

// Main component
const HomeCategories: React.FC = () => {
  // Sample data for furniture categories
  const categories: junooniCategory[] = [
    {
      id: 'Mens',
      name: 'Mens',
      image: `${assets.mens}`
    },
    {
      id: 'Womens',   
      name: 'Womens',
      image: '/images/sofa.png',
    },
    {
      id: 'Kids',
      name: 'Kids',
      image: '/images/chair.png',
    },
    {
      id: 'Merch',
      name: 'Junooni Merch',
      image: '/images/table.png',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            id={category.id}
            name={category.name}
            image={category.image}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeCategories;