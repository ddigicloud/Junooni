// ../context/product-components/InventoryManager.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { IconX, IconInfoCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { fetchInventoryLevels, getVariantInventoryItemId } from '../fetchApi';
import { Variant } from '../product-modules/types';

// Default location ID for inventory management
const DEFAULT_LOCATION_ID = "sloc_01JCGXZT4VFHTDJ8EVNE2N8DSR";

interface InventoryManagerProps {
  variants: Variant[];
  updateVariant: (index: number, field: string, value: any) => void;
  onClose: () => void;
  inventoryChanges: {
    create: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    update: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    delete: string[];
  };
  setInventoryChanges: React.Dispatch<React.SetStateAction<{
    create: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    update: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    delete: string[];
  }>>;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  variants,
  updateVariant,
  onClose,
  inventoryChanges,
  setInventoryChanges
}) => {
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryLevels, setInventoryLevels] = useState<Record<string, any>>({});

  // Refs for maintaining values between renders
  const inventoryChangesRef = useRef(inventoryChanges);
  const inventoryLevelsRef = useRef(inventoryLevels);

  // Update refs when state changes
  useEffect(() => {
    inventoryChangesRef.current = inventoryChanges;
  }, [inventoryChanges]);

  useEffect(() => {
    inventoryLevelsRef.current = inventoryLevels;
  }, [inventoryLevels]);

  // Load inventory levels when the component mounts
  useEffect(() => {
    loadInventoryLevels();
  }, []);

  // Load inventory levels for all variants with inventory items
  const loadInventoryLevels = async () => {
    setIsLoadingInventory(true);
    setInventoryError(null);
    
    try {
      const variantInventoryPromises = [];
      const inventoryItemVariantMap: Record<string, number> = {}; // Map inventory item IDs to variant index
      
      // Reset inventory changes
      setInventoryChanges({
        create: [],
        update: [],
        delete: []
      });
      
      // Create a map of inventory item IDs to variant indices and collect fetch promises
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        
        // Skip variants that don't have manage_inventory enabled
        if (!variant.manageInventory) continue;
        
        // Get inventory item ID from the variant
        const inventoryItemId = getVariantInventoryItemId(variant);
        
        if (inventoryItemId) {
          inventoryItemVariantMap[inventoryItemId] = i;
          variantInventoryPromises.push(
            fetchInventoryLevels({ inventoryItemId })
              .then(response => ({ 
                inventoryItemId, 
                data: response 
              }))
              .catch(error => ({ 
                inventoryItemId, 
                error 
              }))
          );
        }
      }
      
      // Fetch all inventory levels in parallel
      const results = await Promise.all(variantInventoryPromises);
      
      // Process results
      const newInventoryLevels: Record<string, any> = {};
      
      results.forEach(result => {
        if ('data' in result && result.data) {
          newInventoryLevels[result.inventoryItemId] = result.data.inventory_levels || [];
        } else if ('error' in result) {
          console.error(`Error fetching inventory for ${result.inventoryItemId}:`, result.error);
        }
      });
      
      setInventoryLevels(newInventoryLevels);
      setIsLoadingInventory(false);
    } catch (error) {
      console.error('Error loading inventory levels:', error);
      setInventoryError('Failed to load inventory data. Please try again.');
      setIsLoadingInventory(false);
    }
  };

  // Handle updating inventory quantity
  const handleInventoryChange = (
    inventoryItemId: string, 
    locationId: string, 
    field: 'stocked_quantity' | 'incoming_quantity', 
    value: number
  ) => {
    // First update the inventoryLevels state for UI display
    setInventoryLevels(prev => {
      const updatedLevels = { ...prev };
      const levels = updatedLevels[inventoryItemId] || [];
      const levelIndex = levels.findIndex(level => level.location_id === locationId);
    
      if (levelIndex >= 0) {
        // Update existing level
        levels[levelIndex] = {
          ...levels[levelIndex],
          [field]: value
        };
      } else {
        // Create a new level if it doesn't exist
        levels.push({
          id: `temp_${inventoryItemId}_${locationId}`,
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          stocked_quantity: field === 'stocked_quantity' ? value : 0,
          incoming_quantity: field === 'incoming_quantity' ? value : 0,
          reserved_quantity: 0,
          available_quantity: field === 'stocked_quantity' ? value : 0
        });
      }
    
      updatedLevels[inventoryItemId] = levels;
      console.log("📦 Updated inventoryLevels:", updatedLevels[inventoryItemId]);
      return updatedLevels;
    });

    // In edit product context, always use update instead of create
    setInventoryChanges(prev => {
      const changes = { ...prev };
      
      // Always use update for inventory changes in edit product context
      // Remove from create queue if present
      changes.create = changes.create.filter(item => 
        !(item.inventory_item_id === inventoryItemId && item.location_id === locationId)
      );
      
      // Find or add to update queue
      const updateIndex = changes.update.findIndex(item => 
        item.inventory_item_id === inventoryItemId && 
        item.location_id === locationId
      );

      const updateEntry = {
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        stocked_quantity: field === 'stocked_quantity' ? value : 0,
        incoming_quantity: field === 'incoming_quantity' ? value : 0
      };

      if (updateIndex >= 0) {
        // Update existing update entry
        changes.update[updateIndex] = { 
          ...changes.update[updateIndex], 
          [field]: value 
        };
      } else {
        // Add new update entry
        changes.update.push(updateEntry);
      }
      
      console.log("✅ Added to update queue:", updateEntry);
    
      console.log("📋 Current inventory changes:", {
        create: changes.create.length,
        update: changes.update.length,
        delete: changes.delete.length
      });
      
      inventoryChangesRef.current = changes;
      return changes;
    });
    
    // Also update the variant's stock field for UI consistency
    if (field === 'stocked_quantity') {
      const variantIndex = variants.findIndex(v => {
        const itemId = getVariantInventoryItemId(v);
        return itemId === inventoryItemId;
      });
    
      if (variantIndex >= 0) {
        updateVariant(variantIndex, 'stock', value);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Inventory Management</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IconX size={20} />
          </Button>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="mb-6">
          <p className="mb-4 text-gray-700">
            Configure inventory settings for your product variants. You can manage stock levels, 
            set whether inventory is tracked, and configure backorder settings.
          </p>
          
          <div className="p-4 mb-4 border border-blue-200 rounded-md bg-blue-50">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <IconInfoCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-700">Inventory options explained:</h4>
                <ul className="pl-5 mt-1 space-y-1 text-sm text-blue-600 list-disc">
                  <li><strong>Manage Inventory:</strong> When enabled, stock levels will be tracked and decreased with each sale.</li>
                  <li><strong>Allow Backorder:</strong> When enabled, customers can purchase products even when out of stock.</li>
                  <li><strong>Stocked Quantity:</strong> The current quantity in stock.</li>
                  <li><strong>Incoming Quantity:</strong> Expected additional inventory (e.g., items on order).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {isLoadingInventory ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#e65100]" />
            <span className="ml-2 text-gray-600">Loading inventory data...</span>
          </div>
        ) : inventoryError ? (
          <div className="p-4 mb-4 text-red-600 border border-red-200 rounded-md bg-red-50">
            {inventoryError}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3 font-medium text-left text-gray-700">Variant</th>
                  <th className="p-3 font-medium text-left text-gray-700">Manage Inventory</th>
                  <th className="p-3 font-medium text-left text-gray-700">Allow Backorder</th>
                  <th className="p-3 font-medium text-left text-gray-700">Stocked Quantity</th>
                  <th className="p-3 font-medium text-left text-gray-700">Incoming Quantity</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => {
                  // Define inventoryItemId using the helper
                  const inventoryItemId = getVariantInventoryItemId(variant);

                  // Get the inventory levels array for this variant (if any)
                  const variantInventoryLevels = inventoryItemId ? inventoryLevels[inventoryItemId] || [] : [];

                  // Use the first available inventory level as primary; may be null
                  const primaryInventory = variantInventoryLevels[0] ?? null;

                  // Determine locationId: if the primary inventory level exists, use its location_id; otherwise, fall back to the default
                  const locationId = primaryInventory?.location_id ?? DEFAULT_LOCATION_ID;

                  return (
                    <tr key={variant.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-3 border-b border-gray-200">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{variant.title}</span>
                          <span className="text-xs text-gray-500">SKU: {variant.sku}</span>
                          {inventoryItemId ? (
                            <span className="mt-1 text-xs text-blue-500">
                              Inventory ID: {inventoryItemId}
                            </span>
                          ) : (
                            <span className="mt-1 text-xs text-orange-500">No inventory item assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <div className="flex items-center">
                          <Switch
                            checked={variant.manageInventory ?? true}
                            onCheckedChange={(checked) =>
                              updateVariant(index, "manageInventory", checked)
                            }
                            className="data-[state=checked]:bg-[#e65100]"
                          />
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <div className="flex items-center">
                          <Switch
                            checked={variant.allowBackorder ?? false}
                            onCheckedChange={(checked) =>
                              updateVariant(index, "allowBackorder", checked)
                            }
                            className="data-[state=checked]:bg-[#e65100]"
                            disabled={!variant.manageInventory}
                          />
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        {variant.manageInventory ? (
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            // Use ?? instead of || to ensure 0 is not replaced by fallback
                            value={primaryInventory?.stocked_quantity ?? variant.stock ?? 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              console.log("✏️ Stock change detected", {
                                variantId: variant.id,
                                inventoryItemId,
                                locationId,
                                value,
                              });
                              if (inventoryItemId) {
                                handleInventoryChange(inventoryItemId, locationId, "stocked_quantity", value);
                              } else {
                                updateVariant(index, "stock", value);
                              }
                            }}
                            className="w-24 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            disabled={!inventoryItemId}
                          />
                        ) : (
                          <span className="text-gray-500">Unlimited</span>
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        {variant.manageInventory ? (
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={primaryInventory?.incoming_quantity ?? 0}
                            onChange={(e) => {
                              const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                              console.log("✏️ Incoming quantity change detected", {
                                variantId: variant.id,
                                inventoryItemId,
                                locationId,
                                value,
                              });
                              if (inventoryItemId) {
                                handleInventoryChange(inventoryItemId, locationId, "incoming_quantity", value);
                              }
                            }}
                            className="w-24 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            disabled={!inventoryItemId}
                          />
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            className="bg-[#e65100] hover:bg-[#d84315] text-white"
            disabled={isLoadingInventory}
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;