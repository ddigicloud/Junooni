"use client"

import { useState } from "react"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { Button } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion"

// type CategoryFilterProps = {
//   categories: {
//     value: string
//     label: string
//   }[]
//   categoryId: string | null
//   setQueryParams: (name: string, value: string) => void
//   "data-testid"?: string
// }

type CategoryFilterProps = {
  categories: {
    value: string
    label: string
  }[]
  categoryId: string | null
  setQueryParams: (name: string, value: string) => void
  parents?: {
    id: string
    name: string
    handle: string
  }[]
  categoryChildren?: {  // Add categoryChildren property here
    id: string
    name: string
    handle: string
  }[]  // Define its type
  "data-testid"?: string
}

const CategoryFilter = ({
  categories,
  categoryId,
  setQueryParams,
  parents,
  categoryChildren,
  "data-testid": dataTestId,
}: CategoryFilterProps) => {
  const [showAll, setShowAll] = useState(false)
  
  // ➡️ NEW CODE: first format the categories dynamically
  const formattedCategories = categoryChildren && categoryChildren.length > 0
  ? categoryChildren.map((child) => ({
      value: child.handle,
      label: child.name,
    }))
  : categories

  console.log(categoryChildren, "categoryChildren")

const hasMoreThan6 = formattedCategories.length > 6

const initialCategories = formattedCategories.slice(0, 6)
const additionalCategories = formattedCategories.slice(6)

  // Determine if we need a "Show More" button
  // const hasMoreThan6 = categories.length > 6
  
  // Get initial and additional categories
  // const initialCategories = categories.slice(0, 6)
  // const additionalCategories = categories.slice(6)
  
  const handleChange = (value: string) => {
    setQueryParams("category", value)
  }

  // Handle the "Show More" button click
  const toggleShowAll = () => {
    setShowAll(!showAll)
  }
  console.log("Categories: ", categoryChildren);
  return (
    <div className="flex flex-col gap-0">
      {/* Always show first 6 categories */}
      {/* {parents && parents.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-ui-fg-subtle">
        {parents.map((parent, index) => (
          <span key={parent.id}>
            <a href={`/categories/${parent.handle}`} className="hover:text-black">
              {parent.name}
            </a>
            {index !== parents.length - 1 && " / "}
          </span>
        ))}
      </div>
    )}
   */}
        
        <FilterRadioGroup
        title="Categories"
        items={showAll || !hasMoreThan6 ? formattedCategories : initialCategories}
        value={categoryId || ""}
        handleChange={handleChange}
        data-testid={dataTestId}
      />

      {/* {categoryChildren && categoryChildren.length > 0 && (
        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-1">
            {categoryChildren.map((child) => (
              <li key={child.id}>
                <a href={`/categories/${child.handle}`} className="hover:text-black">
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )} */}
      {/* Animated container for additional categories */}
      <AnimatePresence>
        {showAll && hasMoreThan6 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="gap-0 overflow-hidden"
          >
            <FilterRadioGroup
              title=""
              items={additionalCategories}
              value={categoryId || ""}
              handleChange={handleChange}
              data-testid={`${dataTestId}-additional`}
              
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show More/Less button */}
      {hasMoreThan6 && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="gap-0"
        >
          <Button
            variant="secondary"
            size="small"
            className="w-full mt-4"
            onClick={toggleShowAll}
          >
            {showAll ? "Show Less" : `Show More (${additionalCategories.length})`}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default CategoryFilter