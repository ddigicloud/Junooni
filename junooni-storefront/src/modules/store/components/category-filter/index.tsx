"use client"

import { useState } from "react"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { Button } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion"

type CategoryFilterProps = {
  categories: {
    value: string
    label: string
  }[]
  categoryId: string | null
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const CategoryFilter = ({
  categories,
  categoryId,
  setQueryParams,
  "data-testid": dataTestId,
}: CategoryFilterProps) => {
  const [showAll, setShowAll] = useState(false)
  
  // Determine if we need a "Show More" button
  const hasMoreThan6 = categories.length > 6
  
  // Get initial and additional categories
  const initialCategories = categories.slice(0, 6)
  const additionalCategories = categories.slice(6)
  
  const handleChange = (value: string) => {
    // Simply pass the string value of the category handle
    console.log("Category selected:", value)
    setQueryParams("category", value)
  }

  // Handle the "Show More" button click
  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Always show first 6 categories */}
      <FilterRadioGroup
        title="Categories"
        items={initialCategories}
        value={categoryId || ""}
        handleChange={handleChange}
        data-testid={dataTestId}
      />
      
      {/* Animated container for additional categories */}
      <AnimatePresence>
        {showAll && hasMoreThan6 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden gap-0"
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
            className="mt-4 w-full"
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