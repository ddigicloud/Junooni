// pages/onboarding/components/FinalReview.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert";
  import {
    IconCircleCheck,
    IconAlertCircle,
    IconEdit,
    IconUserCircle,
    IconBuilding,
    IconCreditCard,
    IconFileText
  } from "@tabler/icons-react";
  import { Button } from "@/components/ui/button";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  
  export function FinalReview({ vendorData, stepCompletion }) {
    // Helper to check if a section needs attention
    const sectionNeedsAttention = (sectionId: string) => {
      return !stepCompletion[sectionId];
    };
    
    // Helper to check if all sections are complete
    const allSectionsComplete = () => {
      return (
        stepCompletion["basic-info"] &&
        stepCompletion["business-details"] &&
        stepCompletion["banking-info"] &&
        stepCompletion["creator-profile"]
      );
    };
    
    return (
      <div className="space-y-8">
        {!allSectionsComplete() && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Incomplete Profile</AlertTitle>
            <AlertDescription>
              Please complete all required sections before submitting your profile.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Basic Info */}
        <Card className={sectionNeedsAttention("basic-info") ? "border-red-300" : "border-green-100"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <IconUserCircle className="w-5 h-5 mr-2 text-gray-600" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
            <div className="flex items-center">
              {sectionNeedsAttention("basic-info") ? (
                <span className="text-red-500 text-sm font-medium flex items-center">
                  <IconAlertCircle className="w-4 h-4 mr-1" />
                  Incomplete
                </span>
              ) : (
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <IconCheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </span>
              )}
              <Button variant="ghost" size="sm" className="ml-2" asChild>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  // Navigation would be handled in the parent component
                }}>
                  <IconEdit className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={vendorData.logo || ""} />
                <AvatarFallback className="bg-gray-100 text-gray-400 text-lg">
                  {vendorData.name?.charAt(0) || "J"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{vendorData.name || "Not provided"}</h3>
                <p className="text-gray-500">@{vendorData.handle || "handle"}</p>
                <p className="text-sm text-gray-600 mt-1">{vendorData.phonenumber || "Phone not provided"}</p>
              </div>
            </div>
            
            {vendorData.instagram || vendorData.youtube || vendorData.xtwitter ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {vendorData.instagram && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                    Instagram: {vendorData.instagram}
                  </span>
                )}
                {vendorData.youtube && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                    YouTube: {vendorData.youtube}
                  </span>
                )}
                {vendorData.xtwitter && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                    X/Twitter: {vendorData.xtwitter}
                  </span>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
        
        {/* Business Details */}
        <Card className={sectionNeedsAttention("business-details") ? "border-red-300" : "border-green-100"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <IconBuilding className="w-5 h-5 mr-2 text-gray-600" />
              <CardTitle className="text-lg">Business Details</CardTitle>
            </div>
            <div className="flex items-center">
              {sectionNeedsAttention("business-details") ? (
                <span className="text-red-500 text-sm font-medium flex items-center">
                  <IconAlertCircle className="w-4 h-4 mr-1" />
                  Incomplete
                </span>
              ) : (
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <IconCheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </span>
              )}
              <Button variant="ghost" size="sm" className="ml-2" asChild>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  // Navigation would be handled in the parent component
                }}>
                  <IconEdit className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Company Name:</span>
                <span className="font-medium">{vendorData.companyname || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GSTIN:</span>
                <div className="flex items-center">
                  <span className="font-medium">{vendorData.GSTIN || "Not provided"}</span>
                  {vendorData.gst_verification_status === "verified" && (
                    <IconCheckCircle className="w-4 h-4 ml-1 text-green-600" />
                  )}
                  {vendorData.gst_verification_status === "failed" && (
                    <IconAlertCircle className="w-4 h-4 ml-1 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PAN:</span>
                <span className="font-medium">{vendorData.pan_number || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right">
                  {vendorData.address ? (
                    <>
                      {vendorData.address},<br />
                      {vendorData.city}, {vendorData.state} - {vendorData.pincode}
                    </>
                  ) : (
                    "Not provided"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Banking Info */}
        <Card className={sectionNeedsAttention("banking-info") ? "border-red-300" : "border-green-100"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <IconCreditCard className="w-5 h-5 mr-2 text-gray-600" />
              <CardTitle className="text-lg">Banking Information</CardTitle>
            </div>
            <div className="flex items-center">
              {sectionNeedsAttention("banking-info") ? (
                <span className="text-red-500 text-sm font-medium flex items-center">
                  <IconAlertCircle className="w-4 h-4 mr-1" />
                  Incomplete
                </span>
              ) : (
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <IconCheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </span>
              )}
              <Button variant="ghost" size="sm" className="ml-2" asChild>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  // Navigation would be handled in the parent component
                }}>
                  <IconEdit className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Holder:</span>
                <span className="font-medium">{vendorData.bank_account_holder_name || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">
                  {vendorData.bank_account_number ? 
                    `XXXX XXXX ${vendorData.bank_account_number.slice(-4)}` : 
                    "Not provided"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="font-medium">{vendorData.bank_name || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IFSC Code:</span>
                <span className="font-medium">{vendorData.bank_account_ifsc_code || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">{vendorData.bank_account_type || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancelled Cheque:</span>
                <span className="font-medium">
                  {vendorData.cancelled_checkque ? "Uploaded" : "Not uploaded"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Creator Profile */}
        <Card className={sectionNeedsAttention("creator-profile") ? "border-red-300" : "border-green-100"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center">
              <IconFileText className="w-5 h-5 mr-2 text-gray-600" />
              <CardTitle className="text-lg">Creator Profile</CardTitle>
            </div>
            <div className="flex items-center">
              {sectionNeedsAttention("creator-profile") ? (
                <span className="text-red-500 text-sm font-medium flex items-center">
                  <IconAlertCircle className="w-4 h-4 mr-1" />
                  Incomplete
                </span>
              ) : (
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <IconCircleCheck className="w-4 h-4 mr-1" />
                  Complete
                </span>
              )}
              <Button variant="ghost" size="sm" className="ml-2" asChild>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  // Navigation would be handled in the parent component
                }}>
                  <IconEdit className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Title:</h3>
                <p>{vendorData.creator_title || "Not provided"}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Category:</h3>
                <p>{vendorData.creator_category || "Not provided"}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Bio:</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {vendorData.creator_bio || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Terms and Conditions */}
        <Alert className="mt-4">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Agreement</AlertTitle>
          <AlertDescription>
            By completing your registration, you agree to Junooni's Terms of Service, Privacy Policy, and Seller Agreement. You confirm that all information provided is accurate.
          </AlertDescription>
        </Alert>
      </div>
    );
  }