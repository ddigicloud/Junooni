// // "use client"

// // import FilterCheckboxGroup from "@modules/store/components/filter-checkbox"

// // type VendorFilterProps = {
// //   vendors: {
// //     value: string
// //     label: string
// //   }[]
// //   selectedVendors: string[]
// //   setQueryParams: (name: string, value: string) => void
// //   "data-testid"?: string
// // }

// // const VendorFilter = ({
// //   vendors,
// //   selectedVendors,
// //   setQueryParams,
// //   "data-testid": dataTestId,
// // }: VendorFilterProps) => {
// //   const handleChange = (values: string[]) => {
// //     setQueryParams("vendors", values.join(","))
// //   }

// //   return (
// //     <FilterCheckboxGroup
// //       title="Vendors"
// //       items={vendors}
// //       values={selectedVendors}
// //       handleChange={handleChange}
// //       data-testid={dataTestId}
// //     />
// //   )
// // }

// // export default VendorFilter

// "use client"

// type VendorFilterProps = {
//   vendors: {
//     value: string
//     label: string
//   }[]
//   selectedVendors: string[]
//   setQueryParams: (name: string, value: string) => void
//   "data-testid"?: string
// }

// const VendorFilter = ({
//   vendors,
//   selectedVendors,
//   setQueryParams,
//   "data-testid": dataTestId,
// }: VendorFilterProps) => {
//   const handleChange = (values: string[]) => {
//     setQueryParams("vendors", values.join(","))
//   }

//   if (!vendors || vendors.length <= 1) {
//     return null
//   }

//   // Skip "All Vendors" option (usually the first one)
//   const filteredVendors = vendors.filter(v => v.value !== "");

//   return (
//     <div className="space-y-2">
//       {filteredVendors.map((vendor) => {
//         const isSelected = selectedVendors.includes(vendor.value);
        
//         return (
//           <label key={vendor.value} className="flex items-center py-1.5 cursor-pointer group">
//             <input
//               type="checkbox"
//               className="w-4 h-4 mr-3 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
//               checked={isSelected}
//               onChange={() => {
//                 const newValues = isSelected
//                   ? selectedVendors.filter(v => v !== vendor.value)
//                   : [...selectedVendors, vendor.value];
//                 handleChange(newValues);
//               }}
//             />
//             <span className={`text-sm ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
//               {vendor.label}
//             </span>
//           </label>
//         );
//       })}
//     </div>
//   )
// }

// export default VendorFilter

// @modules/store/components/vendor-filter/index.tsx
"use client"

import { useState } from "react"
import { Text } from "@medusajs/ui"

type VendorOption = {
  value: string
  label: string
}

type VendorFilterProps = {
  vendors: VendorOption[]
  selectedVendors?: string[]
  setQueryParams: (name: string, value: string) => void
  'data-testid'?: string
}

const VendorFilter = ({ 
  vendors, 
  selectedVendors = [],
  setQueryParams,
  'data-testid': dataTestId 
}: VendorFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  if (!vendors || vendors.length <= 1) {
    return null
  }
  
  const handleVendorChange = (handle: string) => {
    if (handle === "") {
      // Clear all selected vendors
      setQueryParams("vendors", "")
    } else if (selectedVendors.includes(handle)) {
      // Remove from selection
      const newVendors = selectedVendors.filter(v => v !== handle).join(",")
      setQueryParams("vendors", newVendors)
    } else {
      // Add to selection
      const newVendors = [...selectedVendors, handle].join(",")
      setQueryParams("vendors", newVendors)
    }
  }
  
  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => 
    vendor.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div data-testid={dataTestId}>
      {/* Search input for vendors */}
      {vendors.length > 6 && (
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>
      )}
      
      {/* Vendor list */}
      <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
        {/* "All Vendors" option */}
        <div className="flex items-center">
          <input
            id="all-vendors"
            name="vendor-options"
            type="radio"
            value=""
            checked={selectedVendors.length === 0}
            onChange={() => handleVendorChange("")}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
          />
          <label htmlFor="all-vendors" className="ml-2 block text-sm text-gray-700">
            All Brands
          </label>
        </div>
        
        {/* Vendor options */}
        {filteredVendors.slice(1).map((vendor) => (
          <div key={vendor.value} className="flex items-center">
            <input
              id={`vendor-${vendor.value}`}
              name="vendor-options"
              type="checkbox"
              value={vendor.value}
              checked={selectedVendors.includes(vendor.value)}
              onChange={() => handleVendorChange(vendor.value)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor={`vendor-${vendor.value}`} className="ml-2 block text-sm text-gray-700">
              {vendor.label}
            </label>
          </div>
        ))}
        
        {filteredVendors.length <= 1 && searchTerm && (
          <div className="text-sm text-gray-500 italic">
            No brands found matching "{searchTerm}"
          </div>
        )}
      </div>
      
      {/* Clear selection button */}
      {selectedVendors.length > 0 && (
        <button 
          onClick={() => handleVendorChange("")}
          className="text-xs text-pink-600 font-medium mt-2 hover:underline" 
        >
          Clear selection
        </button>
      )}
    </div>
  )
}

export default VendorFilter