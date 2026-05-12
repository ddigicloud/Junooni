import React, { useState, useEffect } from 'react';
import { 
  IconPackage,
  IconAlertCircle, 
  IconPlus, 
  IconMinus,
  IconInfoCircle,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface InventoryManagementModalProps {
  variants: any[];
  inventoryLevels: Record<string, any>;
  isLoadingInventory: boolean;
  inventoryError: string | null;
  handleInventoryChange: (
    inventoryItemId: string, 
    locationId: string, 
    field: 'stocked_quantity', 
    value: number
  ) => void;
  updateVariant: (index: number, data: any) => void;
  defaultLocationId: string;
   batchUpdateInventoryLevels: (changes: InventoryChanges) => Promise<any>;
  inventoryChanges: InventoryChanges;
  onClose: () => void;
}

// Add these interfaces before the main component
interface InventoryUpdateItem {
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number;
}

interface InventoryChanges {
  create: InventoryUpdateItem[];
  update: InventoryUpdateItem[];
  delete: string[];
}

const InventoryManagementModal: React.FC<InventoryManagementModalProps> = ({
  variants,
  inventoryLevels,
  isLoadingInventory,
  inventoryError,
  handleInventoryChange,
  updateVariant,
  defaultLocationId,
  batchUpdateInventoryLevels,
  inventoryChanges,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVariantFilter, setActiveVariantFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Local state to track changes made in the modal
  const [localInventoryChanges, setLocalInventoryChanges] = useState<InventoryChanges>({
    create: [...(inventoryChanges.create || [])],
    update: [...(inventoryChanges.update || [])],
    delete: [...(inventoryChanges.delete || [])]
  });

  // Initialize local inventory changes when the modal opens
  useEffect(() => {
    //console.log("Initializing inventory changes from props:", inventoryChanges);
    setLocalInventoryChanges({
      create: [...(inventoryChanges.create || [])] as InventoryUpdateItem[],
      update: [...(inventoryChanges.update || [])] as InventoryUpdateItem[],
      delete: [...(inventoryChanges.delete || [])]
    });
  }, [inventoryChanges]);

  // Set up inventory tracking for a variant if needed
  const setupInventoryTracking = (variant, variantIndex) => {
    if (!variant.inventoryItemId && variant.manageInventory) {
      //console.log(`Setting up inventory tracking for variant ${variant.id}`);
      
      // Create a temporary inventory item ID
      const inventoryItemId = `temp_item_${variant.id}`;
      
      // Update the variant with the new inventory item ID
      const updatedVariant = {
        ...variant,
        inventoryItemId
      };
      
      // Update the variant in the form
      updateVariant(variantIndex, updatedVariant);
      
      // Initialize inventory with current stock value
      updateModalInventory(
        inventoryItemId,
        defaultLocationId,
        'stocked_quantity',
        parseInt(variant.stock) || 0,
        true // Force create
      );
      
      return updatedVariant;
    }
    return variant;
  };

  // FIXED: Enhanced update inventory changes function with more defensive logic
  const updateModalInventory = (
    inventoryItemId: string, 
    locationId: string, 
    field: 'stocked_quantity', 
    value: number,
    forceCreate = false // Added option to force create operation
  ) => {
    // Ensure we have numeric values
    const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    
    // Debug logging to see what we're working with
    // console.log("Inventory item check:", {
    //   inventoryItemId,
    //   locationId,
    //   hasInventoryData: Boolean(inventoryLevels[inventoryItemId]),
    //   levelCount: inventoryLevels[inventoryItemId]?.length || 0
    // });
    
    // CRITICAL FIX: More defensive check for existing location relationship
    const hasConfirmedLocationRelationship = Boolean(
      inventoryLevels[inventoryItemId] && 
      Array.isArray(inventoryLevels[inventoryItemId]) &&
      inventoryLevels[inventoryItemId].some(level => 
        level.location_id === locationId && 
        level.id && 
        !level.id.startsWith('temp_')
      )
    );

    // If there's ANY doubt that the item-location relationship exists, use CREATE
    const shouldCreateNew = 
      forceCreate ||
      inventoryItemId.startsWith('temp_') || 
      !inventoryLevels[inventoryItemId] ||
      !Array.isArray(inventoryLevels[inventoryItemId]) ||
      !hasConfirmedLocationRelationship;
    
    //console.log(`Decision for ${inventoryItemId} at ${locationId}: ${shouldCreateNew ? 'CREATE' : 'UPDATE'}`);
    
    // Update local inventory changes state
    setLocalInventoryChanges(prev => {
      const updatedChanges = { ...prev };
      
      // Prepare the inventory entry
      const inventoryEntry = {
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        stocked_quantity: numericValue
      };
      
      if (shouldCreateNew) {
        // ALWAYS USE CREATE if we're not 100% sure the relationship exists
        // First check if we're already tracking this item in the create array
        const createIndex = updatedChanges.create.findIndex(item => 
          item.inventory_item_id === inventoryItemId && item.location_id === locationId
        );
        
        if (createIndex >= 0) {
          // Update existing create entry
          updatedChanges.create[createIndex] = { 
            ...updatedChanges.create[createIndex], 
            [field]: numericValue 
          };
        } else {
          // Add new create entry
          updatedChanges.create.push(inventoryEntry);
        }
        
        // Always remove from update queue if present to avoid conflicts
        updatedChanges.update = updatedChanges.update.filter(item => 
          !(item.inventory_item_id === inventoryItemId && item.location_id === locationId)
        );
      } else {
        // We're confident this item is already stocked at this location
        // Check if we've already queued it in our local changes
        const existsInCreate = updatedChanges.create.some(
          item => item.inventory_item_id === inventoryItemId && item.location_id === locationId
        );
        
        const existsInUpdate = updatedChanges.update.some(
          item => item.inventory_item_id === inventoryItemId && item.location_id === locationId
        );
        
        if (existsInCreate) {
          // Keep in create queue if it's already there
          const createIndex = updatedChanges.create.findIndex(item => 
            item.inventory_item_id === inventoryItemId && item.location_id === locationId
          );
          updatedChanges.create[createIndex] = { 
            ...updatedChanges.create[createIndex], 
            [field]: numericValue 
          };
        } else if (existsInUpdate) {
          // Update in update queue
          const updateIndex = updatedChanges.update.findIndex(item => 
            item.inventory_item_id === inventoryItemId && item.location_id === locationId
          );
          updatedChanges.update[updateIndex] = { 
            ...updatedChanges.update[updateIndex], 
            [field]: numericValue 
          };
        } else {
          // Add to update queue
          updatedChanges.update.push(inventoryEntry);
        }
      }
      
      return updatedChanges;
    });
    
    // Also update the UI through the parent component's handler
    handleInventoryChange(inventoryItemId, locationId, field, numericValue);
  };

  // FIXED: Enhanced save function with safety check
  const saveInventoryChanges = async () => {
    // Check if there are any changes to save
    if (
      localInventoryChanges.create.length === 0 && 
      localInventoryChanges.update.length === 0 && 
      localInventoryChanges.delete.length === 0
    ) {
      //console.log("No inventory changes to save");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    
    try {
      // CRITICAL SAFETY FIX: Scan for any updates that should be creates
      const safeInventoryChanges: InventoryChanges = {
        create: [...localInventoryChanges.create],
        update: [] as InventoryUpdateItem[],
        delete: [...localInventoryChanges.delete]
      };

      // Safety check: Move any update to create if we don't have confirmed relationship
      localInventoryChanges.update.forEach(updateItem => {
        const itemId = updateItem.inventory_item_id;
        const locId = updateItem.location_id;
        
        const hasConfirmedRelationship = Boolean(
          inventoryLevels[itemId] &&
          Array.isArray(inventoryLevels[itemId]) &&
          inventoryLevels[itemId].some(level => 
            level.location_id === locId &&
            level.id && 
            !level.id.startsWith('temp_')
          )
        );
        
        if (hasConfirmedRelationship) {
          safeInventoryChanges.update.push(updateItem);
        } else {
          //console.log(`Safety: Moving ${itemId} at ${locId} from UPDATE to CREATE`);
          safeInventoryChanges.create.push(updateItem);
        }
      });
      
      // Enhanced logging for troubleshooting
      //console.log("Final safe inventory changes:", JSON.stringify(safeInventoryChanges, null, 2));
      //console.log("Current inventory levels:", Object.keys(inventoryLevels).length);
      
      // Call the batch update API with safe changes
      const result = await batchUpdateInventoryLevels(safeInventoryChanges);
      //console.log("Inventory update result:", result);
      
      // Close the modal on success
      onClose();
    } catch (error) {
      console.error("Error saving inventory changes:", error);
      let errorMessage = "Failed to save inventory changes. Please try again.";
      
      // Attempt to extract specific error message
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Error: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Error: ${error}`;
      }
      
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Update stock for a variant
  const updateStock = (variantIndex: number, inventoryItemId: string, newValue: number | string) => {
    // Ensure the value is a number
    const numericValue = typeof newValue === 'string' ? parseInt(newValue) || 0 : newValue;
    
    // Update the variant's stock in the form
    const variant = variants[variantIndex];
    updateVariant(variantIndex, {
      ...variant,
      stock: numericValue
    });
    
    // Determine if this should be a create or update
    const isNewVariant = !variant.id || variant.id.startsWith('temp_') || variant.isNewVariant;
    
    // Sync with inventory
    updateModalInventory(
      inventoryItemId,
      defaultLocationId,
      'stocked_quantity',
      numericValue,
      isNewVariant // Force create if it's a new variant
    );
  };

  // Toggle inventory management for a variant
  const toggleInventoryManagement = (variantIndex: number, enabled: boolean) => {
    const variant = variants[variantIndex];
    
    if (enabled) {
      // If enabling inventory management, make sure it has an inventory item ID
      setupInventoryTracking(variant, variantIndex);
    } else {
      // If disabling, just update the flag
      updateVariant(variantIndex, {
        ...variant,
        manageInventory: false
      });
    }
  };

  // Ensure all variants with inventory management enabled have inventory item IDs
  useEffect(() => {
    if (!isLoadingInventory && variants.length > 0) {
      variants.forEach((variant, index) => {
        if (variant.manageInventory && !variant.inventoryItemId) {
          setupInventoryTracking(variant, index);
        }
      });
    }
  }, [variants, isLoadingInventory]);

  // Filter variants based on search term and filter
  const filteredVariants = variants.filter(variant => {
    // Search by title or SKU
    const matchesSearch = searchTerm === '' || 
      variant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (variant.sku && variant.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply filter
    let matchesFilter = true;
    const stock = parseInt(variant.stock) || 0;
    
    if (activeVariantFilter === 'inStock') {
      matchesFilter = stock > 0;
    } else if (activeVariantFilter === 'lowStock') {
      matchesFilter = stock > 0 && stock <= 5;
    } else if (activeVariantFilter === 'outOfStock') {
      matchesFilter = stock === 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate inventory status
  const calculateInventoryStatus = () => {
    const totalVariants = variants.length;
    const outOfStockCount = variants.filter(v => {
      const stock = parseInt(v.stock) || 0;
      return stock === 0;
    }).length;
    const lowStockCount = variants.filter(v => {
      const stock = parseInt(v.stock) || 0;
      return stock > 0 && stock <= 5;
    }).length;
    
    return {
      totalVariants,
      outOfStockCount,
      lowStockCount,
      inStockCount: totalVariants - outOfStockCount
    };
  };
  
  const inventoryStatus = calculateInventoryStatus();

  // Count of changes pending to be saved
  const pendingChangesCount = 
    localInventoryChanges.create.length + 
    localInventoryChanges.update.length + 
    localInventoryChanges.delete.length;

  if (isLoadingInventory) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-[#e65100] animate-spin mb-4" />
        <p className="text-sm text-center text-gray-600 sm:text-base">Loading inventory data...</p>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <Alert className="my-4 border-red-200 bg-red-50">
        <IconAlertCircle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-sm text-red-800 sm:text-base">
          Error loading inventory: {inventoryError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Save Notification Banner */}
      {pendingChangesCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <IconInfoCircle className="w-5 h-5 text-yellow-600 shrink-0" />
          <AlertDescription className="flex flex-col items-start gap-3 text-yellow-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm sm:text-base">You have {pendingChangesCount} unsaved inventory {pendingChangesCount === 1 ? 'change' : 'changes'}.</span>
            <Button 
              onClick={saveInventoryChanges} 
              disabled={isSaving}
              className="w-full text-white bg-yellow-600 hover:bg-yellow-700 sm:w-auto sm:ml-4"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error banner if save failed */}
      {saveError && (
        <Alert className="border-red-200 bg-red-50">
          <IconAlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-sm text-red-800 sm:text-base">
            {saveError}
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-3 sm:gap-4 sm:mb-6">
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm sm:text-base text-green-700">
              <Badge className="mr-2 text-xs text-green-800 bg-green-100 sm:text-sm">
                {inventoryStatus.inStockCount}
              </Badge>
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 sm:text-sm">
              {Math.round((inventoryStatus.inStockCount / inventoryStatus.totalVariants) * 100) || 0}% of variants have stock
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm sm:text-base text-amber-700">
              <Badge className="mr-2 text-xs bg-amber-100 text-amber-800 sm:text-sm">
                {inventoryStatus.lowStockCount}
              </Badge>
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 sm:text-sm">
              {inventoryStatus.lowStockCount} variants have 5 or fewer items in stock
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm sm:text-base text-red-700">
              <Badge className="mr-2 text-xs text-red-800 bg-red-100 sm:text-sm">
                {inventoryStatus.outOfStockCount}
              </Badge>
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 sm:text-sm">
              {inventoryStatus.outOfStockCount} variants are out of stock
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-4 sm:gap-4 sm:mb-6 md:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by variant name or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm border-gray-300 focus:border-[#e65100] focus:ring-[#e65100] sm:text-base"
          />
        </div>
        
        <Tabs 
          value={activeVariantFilter} 
          onValueChange={(value) => setActiveVariantFilter(value as any)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full h-auto grid-cols-4 p-1 bg-gray-100 rounded-md">
            <TabsTrigger 
              value="all" 
              className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-[#e65100]"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="inStock" 
              className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-green-600"
            >
              In Stock
            </TabsTrigger>
            <TabsTrigger 
              value="lowStock" 
              className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-amber-600"
            >
              Low Stock
            </TabsTrigger>
            <TabsTrigger 
              value="outOfStock" 
              className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Out of Stock
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Instructions */}
      <Alert className="mb-4 border-orange-200 bg-orange-50 sm:mb-6">
        <IconInfoCircle className="w-4 h-4 text-orange-600 shrink-0" />
        <AlertDescription className="text-xs text-orange-800 sm:text-sm">
          Update stock levels for each variant below. Click "Save Inventory Changes" when you're done to commit your changes.
        </AlertDescription>
      </Alert>
      
      {/* Mobile: Card View, Desktop: Table View */}
      {/* Desktop Table */}
      <div className="hidden overflow-hidden border border-gray-200 rounded-lg lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Variant</th>
              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">SKU</th>
              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Stock</th>
              <th className="p-3 font-medium text-center text-gray-700">Manage Inventory</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariants.length > 0 ? (
              filteredVariants.map((variant, index) => {
                // Find the actual index in the original variants array
                const originalIndex = variants.findIndex(v => v.id === variant.id);
                const stock = parseInt(variant.stock) || 0;
                const inventoryItemId = variant.inventoryItemId || `temp_item_${variant.id}`;
                
                // Determine the stock status
                let stockStatus = 'in-stock';
                if (stock === 0) {
                  stockStatus = 'out-of-stock';
                } else if (stock <= 5) {
                  stockStatus = 'low-stock';
                }
                
                return (
                  <tr 
                    key={variant.id} 
                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="p-3 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{variant.title}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {variant.optionValues?.map((optVal, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-xs text-[#e65100] border-orange-200 bg-orange-50"
                            >
                              {optVal.optionName}: {optVal.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 border-r border-gray-200">
                      {variant.sku || 'No SKU'}
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      <div className="flex items-center">
                        {variant.manageInventory ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateStock(originalIndex, inventoryItemId, Math.max(0, stock - 1))}
                              className="w-8 h-8 p-0"
                              disabled={stock <= 0}
                            >
                              <IconMinus size={14} />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={stock}
                              onChange={(e) => updateStock(originalIndex, inventoryItemId, e.target.value)}
                              className="mx-2 w-20 h-8 text-center border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateStock(originalIndex, inventoryItemId, stock + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <IconPlus size={14} />
                            </Button>
                            <div className="ml-3">
                              <Badge 
                                className={`
                                  ${stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' : 
                                    stockStatus === 'low-stock' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-red-100 text-red-800'}
                                `}
                              >
                                {stockStatus === 'in-stock' ? 'In Stock' : 
                                  stockStatus === 'low-stock' ? 'Low Stock' : 
                                  'Out of Stock'}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <span className="italic text-gray-500">Inventory not tracked</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Switch 
                        checked={variant.manageInventory} 
                        onCheckedChange={(checked) => toggleInventoryManagement(originalIndex, checked)}
                        className="data-[state=checked]:bg-[#e65100]"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No variants match your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 lg:hidden">
        {filteredVariants.length > 0 ? (
          filteredVariants.map((variant, index) => {
            // Find the actual index in the original variants array
            const originalIndex = variants.findIndex(v => v.id === variant.id);
            const stock = parseInt(variant.stock) || 0;
            const inventoryItemId = variant.inventoryItemId || `temp_item_${variant.id}`;
            
            // Determine the stock status
            let stockStatus = 'in-stock';
            if (stock === 0) {
              stockStatus = 'out-of-stock';
            } else if (stock <= 5) {
              stockStatus = 'low-stock';
            }
            
            return (
              <Card key={variant.id} className="overflow-hidden border border-gray-200">
                <CardContent className="p-4">
                  {/* Variant Title and Options */}
                  <div className="mb-3">
                    <h3 className="mb-2 text-sm font-semibold text-gray-800">{variant.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {variant.optionValues?.map((optVal, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs text-[#e65100] border-orange-200 bg-orange-50"
                        >
                          {optVal.optionName}: {optVal.value}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      SKU: <span className="font-medium">{variant.sku || 'No SKU'}</span>
                    </p>
                  </div>

                  {/* Inventory Management Toggle */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Manage Inventory</span>
                    <Switch 
                      checked={variant.manageInventory} 
                      onCheckedChange={(checked) => toggleInventoryManagement(originalIndex, checked)}
                      className="data-[state=checked]:bg-[#e65100]"
                    />
                  </div>

                  {/* Stock Management */}
                  {variant.manageInventory ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Stock Level</span>
                        <Badge 
                          className={`text-xs ${
                            stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' : 
                            stockStatus === 'low-stock' ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {stockStatus === 'in-stock' ? 'In Stock' : 
                            stockStatus === 'low-stock' ? 'Low Stock' : 
                            'Out of Stock'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateStock(originalIndex, inventoryItemId, Math.max(0, stock - 1))}
                          className="flex-1 h-10"
                          disabled={stock <= 0}
                        >
                          <IconMinus size={18} />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => updateStock(originalIndex, inventoryItemId, e.target.value)}
                          className="w-24 h-10 text-base text-center border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateStock(originalIndex, inventoryItemId, stock + 1)}
                          className="flex-1 h-10"
                        >
                          <IconPlus size={18} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-center text-gray-500">Inventory not tracked</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="p-6 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
            <IconPackage className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">No variants match your search criteria</p>
          </div>
        )}
      </div>
      
      {variants.length === 0 && (
        <div className="p-6 text-center border border-gray-300 border-dashed rounded-md bg-gray-50 sm:p-8">
          <IconPackage className="w-10 h-10 mx-auto mb-3 text-gray-400 sm:w-12 sm:h-12" />
          <h3 className="mb-1 text-base font-medium text-gray-700 sm:text-lg">No variants found</h3>
          <p className="text-sm text-gray-500 sm:text-base">
            Add options and create variants first to manage inventory
          </p>
        </div>
      )}

      {/* Save button in footer */}
      <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:justify-end sm:mt-8 sm:space-x-3 sm:gap-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={saveInventoryChanges} 
          disabled={isSaving || pendingChangesCount === 0}
          className="w-full bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="w-4 h-4 mr-2" />
              Save Inventory Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InventoryManagementModal;