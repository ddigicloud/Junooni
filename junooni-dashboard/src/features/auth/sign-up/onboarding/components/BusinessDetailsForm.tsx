// pages/onboarding/components/BusinessDetailsForm.tsx
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Button 
} from "@/components/ui/button";
import { 
  IconBuilding,
  IconFileText,
  IconMapPin,
  IconAlertCircle,
  IconCircleCheck,
  IconLoader
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Indian states
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Define form schema
const businessDetailsSchema = z.object({
  companyname: z.string().min(2, "Company name must be at least 2 characters"),
  GSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Please select a state"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits"),
  tan_number: z.string().optional(),
});

type BusinessDetailsFormValues = z.infer<typeof businessDetailsSchema>;

export function BusinessDetailsForm({ vendorData, updateVendorData }) {
  const [verifyingGST, setVerifyingGST] = useState(false);
  const [gstVerified, setGstVerified] = useState(vendorData.gst_verification_status === "verified");
  const [gstVerificationFailed, setGstVerificationFailed] = useState(vendorData.gst_verification_status === "failed");
  
  // Initialize form with vendor data
  const form = useForm<BusinessDetailsFormValues>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      companyname: vendorData.companyname || "",
      GSTIN: vendorData.GSTIN || "",
      pan_number: vendorData.pan_number || "",
      address: vendorData.address || "",
      city: vendorData.city || "",
      state: vendorData.state || "",
      pincode: vendorData.pincode || "",
      tan_number: vendorData.tan_number || "",
    }
  });
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    updateVendorData(field, value);
  };
  
  // Handle GST verification
  const verifyGST = async () => {
    const gstNumber = form.getValues("GSTIN");
    
    if (!gstNumber) {
      form.setError("GSTIN", { 
        type: "manual", 
        message: "Please enter GSTIN to verify" 
      });
      return;
    }
    
    setVerifyingGST(true);
    
    try {
      // In a real implementation, this would call the Indian Govt API
      // For now, we'll simulate a successful verification after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGstVerified(true);
      setGstVerificationFailed(false);
      updateVendorData("gst_verification_status", "verified");
      
    } catch (error) {
      console.error('Error verifying GST:', error);
      setGstVerificationFailed(true);
      setGstVerified(false);
      updateVendorData("gst_verification_status", "failed");
    } finally {
      setVerifyingGST(false);
    }
  };
  
  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Company Name and GST */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="companyname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                      <IconBuilding className="w-5 h-5" />
                    </div>
                    <Input 
                      className="rounded-l-none" 
                      placeholder="Legal business name" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("companyname", e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  As registered with the government
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="GSTIN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN*</FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="flex items-center flex-1">
                      <div className="p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                        <IconFileText className="w-5 h-5" />
                      </div>
                      <Input 
                        className="rounded-l-none rounded-r-none" 
                        placeholder="15-digit GST number" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset verification status when GST number changes
                          if (gstVerified || gstVerificationFailed) {
                            setGstVerified(false);
                            setGstVerificationFailed(false);
                            updateVendorData("gst_verification_status", "pending");
                          }
                          handleFieldChange("GSTIN", e.target.value);
                        }}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant={gstVerified ? "outline" : "default"}
                      className="rounded-l-none"
                      onClick={verifyGST}
                      disabled={verifyingGST || gstVerified}
                    >
                      {verifyingGST ? (
                        <>
                          <IconLoader className="w-4 h-4 mr-2 animate-spin" />
                          Verifying
                        </>
                      ) : gstVerified ? (
                        <>
                          <IconCircleCheck className="w-4 h-4 mr-2 text-green-600" />
                          Verified
                        </>
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                </FormControl>
                <div className="mt-1">
                  {gstVerified && (
                    <div className="flex items-center text-sm text-green-600">
                      <IconCircleCheck className="w-4 h-4 mr-1" />
                      GST verified successfully
                    </div>
                  )}
                  {gstVerificationFailed && (
                    <div className="flex items-center text-sm text-red-600">
                      <IconAlertCircle className="w-4 h-4 mr-1" />
                      GST verification failed. Please check the number and try again.
                    </div>
                  )}
                </div>
                <FormDescription>
                  Your Goods and Services Tax Identification Number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* PAN and TAN */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pan_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PANU Number*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="10-digit PAN" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("pan_number", e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Permanent Account Number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tan_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TAN (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Tax Deduction Account Number" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("tan_number", e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Required only if you collect TDS
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Address */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="mb-4 text-lg font-medium">Business Address</h3>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address*</FormLabel>
                <FormControl>
                  <div className="flex items-start">
                    <div className="h-10 p-2 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
                      <IconMapPin className="w-5 h-5" />
                    </div>
                    <Input 
                      className="rounded-l-none" 
                      placeholder="Street address" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("address", e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-6 mt-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="City" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("city", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State*</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange("state", value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="6-digit pincode" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("pincode", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Alert className="mt-4">
          <IconAlertCircle className="w-4 h-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Make sure all business details match your GST registration. This information will be used for tax invoices and compliance.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}