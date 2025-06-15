// utils/searchColorUtils.ts - ENHANCED WITH IMAGE VARIANT SUPPORT FOR COLOR-BASED IMAGE SWITCHING

// ✅ ENHANCED: Color name normalizer (consistent across all templates)
export const normalizeColorName = (colorName: string): string => {
  return colorName
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ✅ ENHANCED: Extract available colors from search results with hex values
export const extractAvailableColorsFromSearchResults = (products: any[]): Array<{ name: string; hex: string; count: number }> => {
  const colorMap = new Map<string, { name: string; hex: string; count: number }>()
  
  products.forEach(product => {
    if (product.metadata && product.metadata.color_hex_values) {
      try {
        let colorsData = product.metadata.color_hex_values
        
        // Parse if it's a string
        if (typeof colorsData === 'string') {
          colorsData = JSON.parse(colorsData)
        }
        
        if (Array.isArray(colorsData)) {
          colorsData.forEach((color: any) => {
            if (color.name && color.hex) {
              let cleanHex = color.hex.trim()
              if (!cleanHex.startsWith('#')) {
                cleanHex = '#' + cleanHex
              }
              
              // Validate hex format
              if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
                const normalizedName = normalizeColorName(color.name)
                const colorKey = normalizedName.toLowerCase()
                
                if (colorMap.has(colorKey)) {
                  // Increment count if color already exists
                  const existing = colorMap.get(colorKey)!
                  colorMap.set(colorKey, {
                    ...existing,
                    count: existing.count + 1
                  })
                } else {
                  // Add new color
                  colorMap.set(colorKey, {
                    name: normalizedName,
                    hex: cleanHex,
                    count: 1
                  })
                }
              }
            }
          })
        }
      } catch (error) {
        console.warn('Error parsing color metadata from search result:', error)
      }
    }
  })
  
  // Convert to array and sort by count (most common first)
  const availableColors = Array.from(colorMap.values()).sort((a, b) => b.count - a.count)
  
  console.log('🎨 [ColorUtils] Extracted colors from search results:', {
    totalColors: availableColors.length,
    topColors: availableColors.slice(0, 5).map(c => ({ name: c.name, count: c.count }))
  })
  
  return availableColors
}

// ✅ ENHANCED: Extract vendor information from search results
export const extractVendorsFromSearchResults = (products: any[]): Array<{ id: string; name: string; handle: string; count: number }> => {
  const vendorMap = new Map<string, { id: string; name: string; handle: string; count: number }>()
  
  products.forEach(product => {
    if (product.vendor) {
      const vendorKey = product.vendor.id
      
      if (vendorMap.has(vendorKey)) {
        const existing = vendorMap.get(vendorKey)!
        vendorMap.set(vendorKey, {
          ...existing,
          count: existing.count + 1
        })
      } else {
        vendorMap.set(vendorKey, {
          id: product.vendor.id,
          name: product.vendor.name,
          handle: product.vendor.handle,
          count: 1
        })
      }
    }
  })
  
  return Array.from(vendorMap.values()).sort((a, b) => b.count - a.count)
}

// ✅ ENHANCED: Extract collection information from search results
export const extractCollectionsFromSearchResults = (products: any[]): Array<{ id: string; title: string; handle: string; count: number }> => {
  const collectionMap = new Map<string, { id: string; title: string; handle: string; count: number }>()
  
  products.forEach(product => {
    if (product.collection) {
      const collectionKey = product.collection.id
      
      if (collectionMap.has(collectionKey)) {
        const existing = collectionMap.get(collectionKey)!
        collectionMap.set(collectionKey, {
          ...existing,
          count: existing.count + 1
        })
      } else {
        collectionMap.set(collectionKey, {
          id: product.collection.id,
          title: product.collection.title,
          handle: product.collection.handle,
          count: 1
        })
      }
    }
  })
  
  return Array.from(collectionMap.values()).sort((a, b) => b.count - a.count)
}

// ✅ ENHANCED: Extract price range from search results
export const extractPriceRangeFromSearchResults = (products: any[], currencyCode: string = 'USD'): { min: number; max: number; currency: string } => {
  const prices: number[] = []
  
  products.forEach(product => {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: any) => {
        let price = null
        
        // Try calculated_price first
        if (variant.calculated_price && variant.calculated_price.calculated_amount) {
          price = variant.calculated_price.calculated_amount
        }
        // Fallback to prices array
        else if (variant.prices && variant.prices.length > 0) {
          const priceInCurrency = variant.prices.find((p: any) => p.currency_code === currencyCode)
          if (priceInCurrency) {
            price = priceInCurrency.amount
          }
        }
        
        if (price && price > 0) {
          prices.push(price)
        }
      })
    }
  })
  
  if (prices.length === 0) {
    return { min: 0, max: 0, currency: currencyCode }
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: currencyCode
  }
}

// ✅ ENHANCED: Check if search results have color-based image variants
export const checkColorImageVariantsInSearchResults = (products: any[]): boolean => {
  return products.some(product => {
    if (!product.metadata?.color_hex_values) return false
    
    try {
      let colorsData = product.metadata.color_hex_values
      if (typeof colorsData === 'string') {
        colorsData = JSON.parse(colorsData)
      }
      
      return Array.isArray(colorsData) && colorsData.length > 0
    } catch {
      return false
    }
  })
}

// ✅ NEW: Validate image variant data in search results for color-based image switching
export const validateImageVariantDataInSearchResults = (products: any[]): {
  hasImageVariants: boolean
  productsWithOptionImages: number
  productsWithVariantImages: number
  productsWithCompleteImageData: number
  issues: string[]
} => {
  const issues: string[] = []
  let productsWithOptionImages = 0
  let productsWithVariantImages = 0
  let productsWithCompleteImageData = 0
  
  products.forEach((product, index) => {
    if (product.metadata?.option_images) {
      try {
        const optionImages = typeof product.metadata.option_images === 'string' 
          ? JSON.parse(product.metadata.option_images) 
          : product.metadata.option_images
        
        if (optionImages && typeof optionImages === 'object') {
          productsWithOptionImages++
          console.log(`🎨 Product ${product.id} has option_images:`, optionImages)
        }
      } catch (error) {
        issues.push(`Product ${index} has invalid option_images format`)
      }
    }
    
    if (product.metadata?.variant_images) {
      try {
        const variantImages = typeof product.metadata.variant_images === 'string' 
          ? JSON.parse(product.metadata.variant_images) 
          : product.metadata.variant_images
        
        if (variantImages && typeof variantImages === 'object') {
          productsWithVariantImages++
          console.log(`🎨 Product ${product.id} has variant_images:`, variantImages)
        }
      } catch (error) {
        issues.push(`Product ${index} has invalid variant_images format`)
      }
    }
    
    // Check for complete image variant data (images + color mappings)
    if ((product.metadata?.option_images || product.metadata?.variant_images) && 
        product.images && Array.isArray(product.images) && product.images.length > 0) {
      productsWithCompleteImageData++
    }
  })
  
  const hasImageVariants = productsWithOptionImages > 0 || productsWithVariantImages > 0
  
  console.log('🎨 [ColorUtils] Image variant validation for color-based image switching:', {
    hasImageVariants,
    productsWithOptionImages,
    productsWithVariantImages,
    productsWithCompleteImageData,
    totalProducts: products.length,
    issues
  })
  
  return {
    hasImageVariants,
    productsWithOptionImages,
    productsWithVariantImages,
    productsWithCompleteImageData,
    issues
  }
}

// ✅ ENHANCED: Validate search result product format for color functionality
export const validateSearchResultsForColorFunctionality = (searchResponse: any): {
  isValid: boolean
  hasProducts: boolean
  hasColorData: boolean
  hasMetadata: boolean
  productsWithColors: number
  issues: string[]
} => {
  const issues: string[] = []
  
  if (!searchResponse) {
    issues.push('No search response provided')
    return { isValid: false, hasProducts: false, hasColorData: false, hasMetadata: false, productsWithColors: 0, issues }
  }
  
  const hasProducts = Array.isArray(searchResponse.products) && searchResponse.products.length > 0
  if (!hasProducts) {
    issues.push('No products array in search response')
  }
  
  let hasColorData = false
  let hasMetadata = false
  let productsWithColors = 0
  
  if (hasProducts) {
    searchResponse.products.forEach((product: any, index: number) => {
      if (product.metadata) {
        hasMetadata = true
        
        if (product.metadata.color_hex_values) {
          try {
            let colorsData = product.metadata.color_hex_values
            if (typeof colorsData === 'string') {
              colorsData = JSON.parse(colorsData)
            }
            
            if (Array.isArray(colorsData) && colorsData.length > 0) {
              hasColorData = true
              productsWithColors++
            }
          } catch (error) {
            issues.push(`Product ${index} has invalid color_hex_values format`)
          }
        }
      }
    })
  }
  
  const isValid = hasProducts && !issues.some(issue => issue.includes('No search response') || issue.includes('No products array'))
  
  console.log('🔍 [ColorUtils] Search results validation:', {
    isValid,
    hasProducts,
    hasColorData,
    hasMetadata,
    productsWithColors,
    totalProducts: hasProducts ? searchResponse.products.length : 0,
    issues
  })
  
  return {
    isValid,
    hasProducts,
    hasColorData,
    hasMetadata,
    productsWithColors,
    issues
  }
}

// ✅ ENHANCED: Format search results for ProductPreview components with image variant support
export const formatSearchResultsForProductPreview = (searchResponse: any): {
  products: any[]
  selectedColors: string[]
  availableColors: Array<{ name: string; hex: string; count: number }>
  hasColorFilter: boolean
  hasImageVariants: boolean
  debug: any
} => {
  const validation = validateSearchResultsForColorFunctionality(searchResponse)
  
  if (!validation.isValid) {
    console.warn('⚠️ [ColorUtils] Invalid search results for color functionality:', validation.issues)
    return {
      products: [],
      selectedColors: [],
      availableColors: [],
      hasColorFilter: false,
      hasImageVariants: false,
      debug: { validation, error: 'Invalid search results' }
    }
  }
  
  const products = searchResponse.products || []
  const filtersApplied = searchResponse.filters_applied || {}
  const colorFilters = filtersApplied.colors || []
  
  // Normalize selected colors for image selection
  const selectedColors = colorFilters.map((color: string) => normalizeColorName(color))
  const hasColorFilter = selectedColors.length > 0
  
  // Extract available colors with hex values
  const availableColors = extractAvailableColorsFromSearchResults(products)
  
  // ✅ CRITICAL: Validate image variant data for color-based image switching
  const imageVariantValidation = validateImageVariantDataInSearchResults(products)
  
  console.log('🎨 [ColorUtils] Formatted search results for ProductPreview with image variant support:', {
    productsCount: products.length,
    selectedColors: selectedColors,
    availableColorsCount: availableColors.length,
    hasColorFilter: hasColorFilter,
    hasImageVariants: imageVariantValidation.hasImageVariants,
    productsWithOptionImages: imageVariantValidation.productsWithOptionImages,
    productsWithVariantImages: imageVariantValidation.productsWithVariantImages,
    productsWithCompleteImageData: imageVariantValidation.productsWithCompleteImageData,
    validation: validation
  })
  
  return {
    products,
    selectedColors,
    availableColors,
    hasColorFilter,
    hasImageVariants: imageVariantValidation.hasImageVariants,
    debug: {
      validation,
      imageVariantValidation,
      transformation: 'success',
      filtersApplied: filtersApplied,
      imageVariantSupport: {
        enabled: imageVariantValidation.hasImageVariants,
        optionImagesCount: imageVariantValidation.productsWithOptionImages,
        variantImagesCount: imageVariantValidation.productsWithVariantImages,
        completeImageDataCount: imageVariantValidation.productsWithCompleteImageData
      }
    }
  }
}

// ✅ NEW: Extract specific image variants for color-based switching
export const extractImageVariantsForColorSwitching = (products: any[]): {
  productsWithImageVariants: Array<{
    id: string
    title: string
    optionImages?: any
    variantImages?: any
    colors: Array<{ name: string; hex: string }>
    imageVariantMap: Map<string, string> // color -> image URL mapping
  }>
  totalImageVariants: number
  colorImageMap: Map<string, string[]> // color -> array of image URLs
} => {
  const productsWithImageVariants: any[] = []
  const colorImageMap = new Map<string, string[]>()
  let totalImageVariants = 0

  products.forEach(product => {
    if (!product.metadata) return

    let optionImages = null
    let variantImages = null
    let colors: Array<{ name: string; hex: string }> = []
    const imageVariantMap = new Map<string, string>()

    // Parse option_images (color -> image mappings)
    if (product.metadata.option_images) {
      try {
        optionImages = typeof product.metadata.option_images === 'string' 
          ? JSON.parse(product.metadata.option_images)
          : product.metadata.option_images

        // Extract color to image mappings from option_images
        if (optionImages?.color) {
          Object.entries(optionImages.color).forEach(([colorName, imageUrl]) => {
            const normalizedColor = normalizeColorName(colorName as string)
            imageVariantMap.set(normalizedColor.toLowerCase(), imageUrl as string)
            
            // Add to global color image map
            if (!colorImageMap.has(normalizedColor.toLowerCase())) {
              colorImageMap.set(normalizedColor.toLowerCase(), [])
            }
            colorImageMap.get(normalizedColor.toLowerCase())!.push(imageUrl as string)
            totalImageVariants++
          })
        }
      } catch (error) {
        console.warn(`Error parsing option_images for product ${product.id}:`, error)
      }
    }

    // Parse variant_images (variant ID -> image mappings)
    if (product.metadata.variant_images) {
      try {
        variantImages = typeof product.metadata.variant_images === 'string' 
          ? JSON.parse(product.metadata.variant_images)
          : product.metadata.variant_images
      } catch (error) {
        console.warn(`Error parsing variant_images for product ${product.id}:`, error)
      }
    }

    // Parse color_hex_values
    if (product.metadata.color_hex_values) {
      try {
        const colorData = typeof product.metadata.color_hex_values === 'string' 
          ? JSON.parse(product.metadata.color_hex_values)
          : product.metadata.color_hex_values

        if (Array.isArray(colorData)) {
          colors = colorData.map(color => ({
            name: normalizeColorName(color.name),
            hex: color.hex
          }))
        }
      } catch (error) {
        console.warn(`Error parsing color_hex_values for product ${product.id}:`, error)
      }
    }

    // Only include products that have image variant data
    if (imageVariantMap.size > 0 || (variantImages && Object.keys(variantImages).length > 0)) {
      productsWithImageVariants.push({
        id: product.id,
        title: product.title,
        optionImages,
        variantImages,
        colors,
        imageVariantMap
      })
    }
  })

  console.log('🎨 [ColorUtils] Extracted image variants for color switching:', {
    productsWithImageVariants: productsWithImageVariants.length,
    totalImageVariants,
    uniqueColorsWithImages: colorImageMap.size,
    colorBreakdown: Array.from(colorImageMap.entries()).map(([color, images]) => ({
      color,
      imageCount: images.length
    }))
  })

  return {
    productsWithImageVariants,
    totalImageVariants,
    colorImageMap
  }
}

// ✅ NEW: Validate color-based image switching capability
export const validateColorBasedImageSwitching = (products: any[], selectedColors: string[]): {
  canSwitchImages: boolean
  productsWithColorImageSupport: number
  selectedColorsWithImages: string[]
  missingImageVariants: string[]
  recommendations: string[]
} => {
  const { productsWithImageVariants, colorImageMap } = extractImageVariantsForColorSwitching(products)
  
  const selectedColorsWithImages: string[] = []
  const missingImageVariants: string[] = []
  const recommendations: string[] = []

  // Check which selected colors have image variants
  selectedColors.forEach(selectedColor => {
    const normalizedColor = normalizeColorName(selectedColor).toLowerCase()
    if (colorImageMap.has(normalizedColor)) {
      selectedColorsWithImages.push(selectedColor)
    } else {
      missingImageVariants.push(selectedColor)
    }
  })

  const canSwitchImages = selectedColorsWithImages.length > 0 && productsWithImageVariants.length > 0

  // Generate recommendations
  if (!canSwitchImages) {
    recommendations.push('No products have color-based image variants configured')
  }
  if (missingImageVariants.length > 0) {
    recommendations.push(`Colors missing image variants: ${missingImageVariants.join(', ')}`)
  }
  if (selectedColorsWithImages.length === 0 && selectedColors.length > 0) {
    recommendations.push('None of the selected colors have associated images')
  }
  if (colorImageMap.size > 0) {
    recommendations.push(`Available colors with images: ${Array.from(colorImageMap.keys()).join(', ')}`)
  }

  console.log('🎨 [ColorUtils] Color-based image switching validation:', {
    canSwitchImages,
    productsWithColorImageSupport: productsWithImageVariants.length,
    selectedColorsWithImages,
    missingImageVariants,
    totalProductsChecked: products.length,
    availableColorVariants: colorImageMap.size
  })

  return {
    canSwitchImages,
    productsWithColorImageSupport: productsWithImageVariants.length,
    selectedColorsWithImages,
    missingImageVariants,
    recommendations
  }
}