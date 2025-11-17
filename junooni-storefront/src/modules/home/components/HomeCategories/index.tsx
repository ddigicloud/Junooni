import { listCategories } from '@lib/data/categories'
import Link from 'next/link';
import React from 'react'

// Define proper TypeScript interfaces for our data
interface CategoryMetadata {
  featured_image?: string;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
  handle: string;
  metadata: CategoryMetadata | null;
  parent_category: any | null;
}

const HomeCategories = async () => {
  // Cast the result to our defined type
  const categories = await listCategories() as Category[];

  // Filter categories with proper type checking
  const categoriesWithImages = categories.filter((category: Category) => 
    category.metadata !== null && 
    typeof category.metadata.featured_image === 'string' && 
    category.metadata.featured_image.length > 0
  );

  return (
    <section className="py-10 bg-gray-50">
      <div className="mx-auto w-full max-w-full px-0 sm:px-4">
        <h2 className="mb-12 text-3xl font-bold text-center">
          <span className="inline-block pb-2">Shop by Category</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-1 sm:gap-3 md:grid-cols-4 md:gap-2">
          {categoriesWithImages.map((category) => (
            <Link 
              href={`/categories/${category.handle}`} 
              key={category.id} 
              className="group"
            >
              <div className="overflow-hidden transition-all duration-300">
                <div className="relative bg-gray-100 aspect-square">
                  {category.metadata && category.metadata.featured_image && (
                    <img 
                      src={category.metadata.featured_image as string}
                      alt={category.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 transition-all duration-300 bg-black bg-opacity-0 group-hover:bg-opacity-10 group-hover:scale-105"></div>
                </div>
                
                <div className="px-4 py-2 sm:p-4 md:p-4 text-center">
                  <h3 className="text-lg font-medium transition-colors duration-300 group-hover:text-orange-primary">
                    {category.name}
                  </h3>
                  <div className="mt-2 h-0.5 w-0 bg-orange-primary mx-auto transition-all duration-300 group-hover:w-12"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeCategories