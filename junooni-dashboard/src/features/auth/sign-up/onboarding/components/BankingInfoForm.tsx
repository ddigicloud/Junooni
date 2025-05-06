// pages/onboarding/components/BankingInfoForm.tsx
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
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Button 
} from "@/components/ui/button";
import { 
  //IconBuilding,
  IconFileText,
  IconInfoCircle,
  IconUpload,
  IconCreditCard,
  IconBuildingBank,
  IconUser,
  IconAlertCircle,
  //IconCheck
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define form schema
const bankingInfoSchema = z.object({
  bank_account_holder_name: z.string().min(2, "Account holder name is required"),
  bank_account_number: z.string().min(9, "Account number must be at least 9 digits"),
  bank_account_ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  bank_name: z.string().min(2, "Bank name is required"),
  bank_account_type: z.enum(["Saving", "Current"]),
  cancelled_checkque: z.string().optional(),
});

type BankingInfoFormValues = z.infer<typeof bankingInfoSchema>;

export function BankingInfoForm({ vendorData, updateVendorData }) {
  const [chequePreview, setChequePreview] = useState<string | null>(vendorData.cancelled_checkque);
  
  // Initialize form with vendor data
  const form = useForm<BankingInfoFormValues>({
    resolver: zodResolver(bankingInfoSchema),
    defaultValues: {
      bank_account_holder_name: vendorData.bank_account_holder_name || "",
      bank_account_number: vendorData.bank_account_number || "",
      bank_account_ifsc_code: vendorData.bank_account_ifsc_code || "",
      bank_name: vendorData.bank_name || "",
      bank_account_type: vendorData.bank_account_type || "Saving",
      cancelled_checkque: vendorData.cancelled_checkque || "",
    }
  });
  
  // Handle cheque upload
  const handleChequeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setChequePreview(result);
        updateVendorData("cancelled_checkque", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    updateVendorData(field, value);
  };
  
  // Verify IFSC code
  const verifyIFSC = async () => {
    const ifscCode = form.getValues("bank_account_ifsc_code");
    
    if (!ifscCode) {
      form.setError("bank_account_ifsc_code", { 
        type: "manual", 
        message: "Please enter IFSC code to verify" 
      });
      return;
    }
    
    try {
      // In a real implementation, this would call a bank API
      // For now, we'll auto-fill bank name based on IFSC
      if (ifscCode.startsWith("SBIN")) {
        form.setValue("bank_name", "State Bank of India");
        handleFieldChange("bank_name", "State Bank of India");
      } else if (ifscCode.startsWith("HDFC")) {
        form.setValue("bank_name", "HDFC Bank");
        handleFieldChange("bank_name", "HDFC Bank");
      } else if (ifscCode.startsWith("ICIC")) {
        form.setValue("bank_name", "ICICI Bank");
        handleFieldChange("bank_name", "ICICI Bank");
      } else {
        form.setValue("bank_name", "Other Bank");
        handleFieldChange("bank_name", "Other Bank");
      }
    } catch (error) {
      console.error('Error verifying IFSC:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form className="space-y-6">
        <Alert>
          <IconInfoCircle className="h-4 w-4" />
          <AlertTitle>Payment Information</AlertTitle>
          <AlertDescription>
            This is where we'll send your earnings. Make sure all details are accurate.
          </AlertDescription>
        </Alert>
        
        {/* Account Holder */}
        <FormField
          control={form.control}
          name="bank_account_holder_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name*</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 text-gray-500 border border-r-0 rounded-l-md">
                    <IconUser className="w-5 h-5" />
                  </div>
                  <Input 
                    className="rounded-l-none" 
                    placeholder="Name as per bank records" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("bank_account_holder_name", e.target.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Exactly as it appears on your bank account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Account Number */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bank_account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number*</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 text-gray-500 border border-r-0 rounded-l-md">
                      <IconCreditCard className="w-5 h-5" />
                    </div>
                    <Input 
                      className="rounded-l-none" 
                      placeholder="Bank account number" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("bank_account_number", e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bank_account_ifsc_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code*</FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="flex items-center flex-1">
                      <div className="bg-gray-100 p-2 text-gray-500 border border-r-0 rounded-l-md">
                        <IconBuildingBank className="w-5 h-5" />
                      </div>
                      <Input 
                        className="rounded-l-none rounded-r-none" 
                        placeholder="11-character IFSC code" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          field.onChange(value);
                          handleFieldChange("bank_account_ifsc_code", value);
                        }}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="rounded-l-none"
                      onClick={verifyIFSC}
                    >
                      Verify
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Your bank's IFSC code (e.g., SBIN0000123)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Bank Name */}
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Bank name" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange("bank_name", e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Auto-filled when IFSC is verified
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Account Type */}
        <FormField
          control={form.control}
          name="bank_account_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type*</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFieldChange("bank_account_type", value);
                  }}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Saving" />
                    </FormControl>
                    <FormLabel className="font-normal">Savings Account</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Current" />
                    </FormControl>
                    <FormLabel className="font-normal">Current Account</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Cancelled Cheque */}
        <FormItem>
          <FormLabel>Cancelled Cheque*</FormLabel>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
            {chequePreview ? (
              <div className="w-full">
                <img 
                  src={chequePreview} 
                  alt="Cancelled Cheque" 
                  className="max-h-48 mx-auto object-contain mb-4"
                />
                <div className="flex justify-center">
                  <label htmlFor="cheque-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm">
                      <IconUpload className="w-4 h-4 mr-1" />
                      Change File
                    </Button>
                    <Input 
                      id="cheque-upload" 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      onChange={handleChequeUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <>
                <IconFileText className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload a scanned copy of cancelled cheque</p>
                <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG or PDF (Max 2MB)</p>
                <label htmlFor="cheque-upload" className="cursor-pointer">
                  <Button>
                    <IconUpload className="w-4 h-4 mr-1" />
                    Upload Cheque
                  </Button>
                  <Input 
                    id="cheque-upload" 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={handleChequeUpload}
                  />
                </label>
              </>
            )}
          </div>
          <FormDescription>
            This helps verify your bank account details
          </FormDescription>
        </FormItem>
        
        <Alert variant="destructive" className="mt-4">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Double-check all banking details. Incorrect information may result in payment delays or failures.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}