// pages/onboarding/components/CreatorProfileForm.tsx
import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
  } from "@/components/ui/form";
  import { 
    Input 
  } from "@/components/ui/input";
  import { 
    Textarea 
  } from "@/components/ui/textarea";
  import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from "@/components/ui/select";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import * as z from "zod";
  
  // Creator categories
  const CREATOR_CATEGORIES = [
    "Fashion Designer", "Jewelry Maker", "Artist", "Home Decor", "Craft Supplies",
    "Food & Beverages", "Beauty & Personal Care", "Accessories", "Toys & Games",
    "Digital Products", "Photography", "Handmade Crafts", "Pottery & Ceramics",
    "Woodworking", "Metal Crafts", "Paper Goods", "Vintage Items", "Custom Clothing"
  ];
  
  // Define form schema
  const creatorProfileSchema = z.object({
    creator_title: z.string().min(2, "Title must be at least 2 characters"),
    creator_bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must not exceed 500 characters"),
    creator_category: z.string().min(1, "Please select a category"),
  });
  
  type CreatorProfileFormValues = z.infer<typeof creatorProfileSchema>;
  
  export function CreatorProfileForm({ vendorData, updateVendorData }) {
    // Initialize form with vendor data
    const form = useForm<CreatorProfileFormValues>({
      resolver: zodResolver(creatorProfileSchema),
      defaultValues: {
        creator_title: vendorData.creator_title || "",
        creator_bio: vendorData.creator_bio || "",
        creator_category: vendorData.creator_category || "",
      }
    });
    
    // Handle form field changes
    const handleFieldChange = (field: string, value: string) => {
      updateVendorData(field, value);
    };
    
    return (
      <Form {...form}>
        <form className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6">
              This information will be displayed on your public profile and storefront to help customers learn about you.
            </p>
            
            <FormField
              control={form.control}
              name="creator_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator Title*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Handmade Jewelry Designer" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("creator_title", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    A short descriptor of what you create (50 characters max)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="creator_bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator Bio*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell customers about yourself, your journey, and what makes your products special..." 
                      className="min-h-32"
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("creator_bio", e.target.value);
                      }}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormDescription>
                      Your story helps build connection with customers
                    </FormDescription>
                    <p className="text-xs text-gray-500">
                      {field.value?.length || 0}/500
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="creator_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Category*</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange("creator_category", value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main product category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CREATOR_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the category that best represents your products
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    );
  }