// pages/onboarding/components/BasicInfoForm.tsx
import { useState, useEffect } from "react"; // Added useEffect
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
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { 
  Button 
} from "@/components/ui/button";

import { IconUpload, IconUser, IconBrandInstagram, IconBrandYoutube, IconBrandX } from "@tabler/icons-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define form schema
const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(2, "Handle must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens (no spaces or underscores)"),
  phonenumber: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  xtwitter: z.string().optional(),
  othersocial: z.string().optional(),
  logo: z.string().optional(),
  coverphoto: z.string().optional(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export function BasicInfoForm({ vendorData, updateVendorData }) {
  console.log('BasicInfoForm received vendorData:', vendorData);
  
  const [logoPreview, setLogoPreview] = useState<string | null>(vendorData?.logo || null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(vendorData?.coverphoto || null);
  
  // Initialize form with vendor data
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: vendorData?.name || "",
      handle: vendorData?.handle || "",
      phonenumber: vendorData?.phonenumber || "",
      instagram: vendorData?.instagram || "",
      youtube: vendorData?.youtube || "",
      xtwitter: vendorData?.xtwitter || "",
      othersocial: vendorData?.othersocial || "",
    }
  });
  
  // Update form values when vendor data changes
  useEffect(() => {
    if (vendorData) {
      console.log('Updating form values with:', vendorData);
      
      // Reset form with new data
      form.reset({
        name: vendorData.name || "",
        handle: vendorData.handle || "",
        phonenumber: vendorData.phonenumber || "",
        instagram: vendorData.instagram || "",
        youtube: vendorData.youtube || "",
        xtwitter: vendorData.xtwitter || "",
        othersocial: vendorData.othersocial || "",
      });
      
      // Update preview states
      setLogoPreview(vendorData.logo || null);
      setCoverPhotoPreview(vendorData.coverphoto || null);
    }
  }, [vendorData, form]);
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        updateVendorData("logo", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle cover photo upload
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPhotoPreview(result);
        updateVendorData("coverphoto", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    console.log(`Updating field ${field} to:`, value);
    updateVendorData(field, value);
  };

  // Handle handle input to prevent invalid characters
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    // Remove any characters that aren't lowercase letters, numbers, or hyphens
    const sanitizedValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ''); // Remove spaces, underscores, and other invalid characters
    
    // Update the form field with sanitized value
    field.onChange(sanitizedValue);
    handleFieldChange("handle", sanitizedValue);
  };

  // If vendor data is not available yet, show loading state
  if (!vendorData) {
    return <div className="p-4 text-center">Loading vendor information...</div>;
  }
  console.log("vendor data", vendorData);
  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo Upload */}
          <FormItem>
            <FormLabel>Brand Logo</FormLabel>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={logoPreview || ""} />
                <AvatarFallback className="text-gray-400 bg-gray-100">
                  <IconUser className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <FormDescription>
                  Upload a square logo for your brand (300x300px recommended)
                </FormDescription>
                <div className="mt-2">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                      <IconUpload className="w-4 h-4" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </div>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </FormItem>
          
          {/* Cover Photo Upload */}
          <FormItem>
            <FormLabel>Cover Photo</FormLabel>
            <div className="relative h-32 overflow-hidden border rounded-md bg-gray-50">
              {coverPhotoPreview ? (
                <img 
                  src={coverPhotoPreview} 
                  alt="Cover" 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span>No cover photo</span>
                </div>
              )}
              
              <div className="absolute bottom-2 right-2">
                <label htmlFor="cover-upload" className="cursor-pointer">
                  <Button variant="secondary" size="sm">
                    <IconUpload className="w-4 h-4 mr-1" />
                    {coverPhotoPreview ? 'Change' : 'Upload'}
                  </Button>
                  <Input 
                    id="cover-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCoverPhotoUpload}
                  />
                </label>
              </div>
            </div>
            <FormDescription>
              Recommended size: 1200x300px
            </FormDescription>
          </FormItem>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Brand Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between mb-2">
                  <FormLabel>Brand Name <span className="text-red-500">*</span></FormLabel>
                  <span className="text-xs text-gray-400">Required</span>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Your brand name" 
                    {...field} 
                    value={field.value || vendorData?.name || ""}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: field.value || vendorData?.name ? '#2ECC71' : '#E74C3C',
                    }}
                    onChange={(e) => {
                      console.log(`Updating name from ${field.value} to ${e.target.value}`);
                      field.onChange(e);
                      handleFieldChange("name", e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This will be displayed to customers
                </FormDescription>
                {!field.value && !vendorData?.name && (
                  <p className="mt-1 text-sm" style={{ color: "#E74C3C" }}>Brand name is required</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Brand Handle */}
          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Handle*</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="px-3 py-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                      junooni.com/
                    </span>
                    <Input 
                      className="rounded-l-none" 
                      placeholder="yourbrand" 
                      value={field.value}
                      onChange={(e) => handleHandleChange(e, field)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Your unique URL on Junooni (lowercase letters, numbers, and hyphens only)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phonenumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number*</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                    +91
                  </span>
                  <Input 
                    className="rounded-l-none" 
                    placeholder="10-digit mobile number" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("phonenumber", e.target.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                We'll use this for verification and updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 border-t border-gray-100">
          <h3 className="mb-4 text-lg font-medium">Social Media Profiles (Optional)</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Instagram */}
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                        <IconBrandInstagram className="w-5 h-5" />
                      </div>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="username" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("instagram", e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* YouTube */}
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                        <IconBrandYoutube className="w-5 h-5" />
                      </div>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="channel" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("youtube", e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* X/Twitter */}
            <FormField
              control={form.control}
              name="xtwitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X / Twitter</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                        <IconBrandX className="w-5 h-5" />
                      </div>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="username" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("xtwitter", e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Other Social */}
            <FormField
              control={form.control}
              name="othersocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Social</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full URL" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("othersocial", e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}