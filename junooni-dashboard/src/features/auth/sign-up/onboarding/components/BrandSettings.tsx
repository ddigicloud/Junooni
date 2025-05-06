import React, { useState, useEffect, useRef } from "react"
import { IconX, IconFileText, IconHelpCircle } from "@tabler/icons-react"
import { useToast } from "@/hooks/use-toast"

interface VendorData {
  name: string
  logo: string | null
  coverphoto: string | null
  phonenumber: string | null
  instagram: string | null
  youtube: string | null
  xtwitter: string | null
  othersocial: string | null
}

const brandColors = {
  primary: "#e65100",
  success: "#2ECC71",
  error: "#E74C3C",
}

export default function BrandSettings({
  vendorData,
  updateVendorData,
}: {
  vendorData: VendorData
  updateVendorData: (field: keyof VendorData, value: any) => void
}) {
  console.log('BrandSettings received vendorData:', vendorData);
  
  const { toast } = useToast();
  
  // References to the file input elements
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadType, setUploadType] = useState<string>("")

  useEffect(() => {
    setLogoFile(null)
    setCoverFile(null)
  }, [vendorData.logo, vendorData.coverphoto])

  // Upload file to server and get URL
  const uploadFile = async (file: File, fileType: 'logo' | 'coverphoto') => {
    try {
      setIsUploading(true);
      setUploadType(fileType);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('files', file);
      
      // Get the vendor token for authentication
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Use your upload endpoint
      const response = await fetch('http://localhost:9000/vendors/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      // Extract the file URL from the response based on its structure
      let fileUrl = '';
      
      if (data.files && data.files.length > 0) {
        // If response has a files array with URLs
        fileUrl = data.files[0].url || data.files[0].file_url || '';
      } else if (data.url) {
        // If response has a direct URL property
        fileUrl = data.url;
      }
      
      if (!fileUrl) {
        throw new Error('Could not extract file URL from upload response');
      }
      
      console.log(`Extracted ${fileType} URL:`, fileUrl);
      
      // Update the form data with the file URL
      updateVendorData(fileType, fileUrl);
      
      toast({
        title: "File Uploaded",
        description: `${fileType === 'logo' ? 'Logo' : 'Cover photo'} uploaded successfully`,
      });
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadType("");
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Show a temporary preview using object URL
      const previewUrl = URL.createObjectURL(file)
      updateVendorData('logo', previewUrl) // Temporary preview
      
      // Upload the file to get a permanent URL
      const uploadedUrl = await uploadFile(file, 'logo')
      if (uploadedUrl) {
        // If upload successful, update with permanent URL
        updateVendorData('logo', uploadedUrl)
        // Revoke the temporary object URL to free up memory
        URL.revokeObjectURL(previewUrl)
      } else {
        // If upload failed, remove the temporary preview
        updateVendorData('logo', vendorData.logo) // Revert to previous value
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      // Show a temporary preview using object URL
      const previewUrl = URL.createObjectURL(file)
      updateVendorData('coverphoto', previewUrl) // Temporary preview
      
      // Upload the file to get a permanent URL
      const uploadedUrl = await uploadFile(file, 'coverphoto')
      if (uploadedUrl) {
        // If upload successful, update with permanent URL
        updateVendorData('coverphoto', uploadedUrl)
        // Revoke the temporary object URL to free up memory
        URL.revokeObjectURL(previewUrl)
      } else {
        // If upload failed, remove the temporary preview
        updateVendorData('coverphoto', vendorData.coverphoto) // Revert to previous value
        URL.revokeObjectURL(previewUrl)
      }
    }
  }
  
  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input
    updateVendorData('logo', null);
    setLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }
  
  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input
    updateVendorData('coverphoto', null);
    setCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }
  
  // Trigger file input click programmatically
  const triggerLogoFileInput = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  }
  
  const triggerCoverFileInput = () => {
    if (coverInputRef.current) {
      coverInputRef.current.click();
    }
  }
  console.log('Name value:', vendorData.name, 'Type:', typeof vendorData.name);
  return (
    <div className="space-y-6">
      {/* Brand Name */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Brand Name <span className="text-red-500">*</span></label>
          <span className="text-xs text-gray-400">Required</span>
        </div>
        <input
          type="text"
          value={vendorData.name || ''}
          onChange={e => updateVendorData('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{
            borderColor: vendorData.name && vendorData.name.trim() !== '' 
              ? brandColors.success  // Use success/green color for valid input
              : brandColors.error,   // Use error/red color for invalid input
            // outlineColor: brandColors.primary,
          }}
          placeholder="Enter your brand name"
        />
        {!vendorData.name && (
          <p className="mt-1 text-sm" style={{ color: brandColors.error }}>Brand name is required</p>
        )}
      </div>

      {/* Logo & Cover Row */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Logo */}
        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium">Logo <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-400">Recommended size: 400x400px</span>
          </div>
          <div
            className="relative flex items-center justify-center h-40 transition-colors border-2 border-dashed rounded-lg hover:bg-gray-50"
            style={{ 
              borderColor: vendorData.logo ? brandColors.success : 'rgb(229, 231, 235)',
              cursor: isUploading && uploadType === 'logo' ? 'wait' : 'pointer'
            }}
            onClick={isUploading ? undefined : triggerLogoFileInput}
          >
            {/* Hidden file input */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {vendorData.logo ? (
              <div className="relative w-full h-full">
                <img
                  src={vendorData.logo}
                  alt="Logo Preview"
                  className="absolute inset-0 object-contain w-full h-full p-2"
                />
                {isUploading && uploadType === 'logo' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-center text-white">
                      <div className="inline-block w-6 h-6 mb-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <p className="text-sm">Uploading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="absolute z-10 p-1 bg-white rounded-full shadow-md cursor-pointer top-2 right-2"
                      onClick={handleRemoveLogo}
                    >
                      <IconX className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <button 
                        type="button"
                        className="z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-80 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerLogoFileInput();
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {isUploading && uploadType === 'logo' ? (
                  <div className="p-4 text-center">
                    <div className="inline-block w-8 h-8 mb-2 border-2 border-gray-500 rounded-full border-t-transparent animate-spin"></div>
                    <p className="text-sm">Uploading logo...</p>
                  </div>
                ) : (
                  <div className="p-4 text-center cursor-pointer">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                      <IconFileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">Drop your logo here or <span style={{ color: brandColors.primary }}>browse</span></p>
                    <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, SVG</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cover */}
        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium">Cover Photo</label>
            <span className="text-xs text-gray-400">Recommended size: 1200x400px</span>
          </div>
          <div
            className="relative flex items-center justify-center h-40 transition-colors border-2 border-dashed rounded-lg hover:bg-gray-50"
            style={{ 
              borderColor: vendorData.coverphoto ? brandColors.success : 'rgb(229, 231, 235)',
              cursor: isUploading && uploadType === 'coverphoto' ? 'wait' : 'pointer'
            }}
            onClick={isUploading ? undefined : triggerCoverFileInput}
          >
            {/* Hidden file input */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {vendorData.coverphoto ? (
              <div className="relative w-full h-full">
                <img
                  src={vendorData.coverphoto}
                  alt="Cover Preview"
                  className="absolute inset-0 object-cover w-full h-full"
                />
                {isUploading && uploadType === 'coverphoto' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-center text-white">
                      <div className="inline-block w-6 h-6 mb-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <p className="text-sm">Uploading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="absolute z-10 p-1 bg-white rounded-full shadow-md cursor-pointer top-2 right-2"
                      onClick={handleRemoveCover}
                    >
                      <IconX className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <button 
                        type="button"
                        className="z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-80 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCoverFileInput();
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {isUploading && uploadType === 'coverphoto' ? (
                  <div className="p-4 text-center">
                    <div className="inline-block w-8 h-8 mb-2 border-2 border-gray-500 rounded-full border-t-transparent animate-spin"></div>
                    <p className="text-sm">Uploading cover photo...</p>
                  </div>
                ) : (
                  <div className="p-4 text-center cursor-pointer">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                      <IconFileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">Add a cover photo</p>
                    <p className="mt-1 text-xs text-gray-500">Showcases your brand</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <IconHelpCircle className="w-4 h-4 mr-1 text-gray-400" />
            <span className="text-xs text-gray-400">For verification and support</span>
          </div>
        </div>
        <input
          type="tel"
          value={vendorData.phonenumber || ''}
          onChange={e => updateVendorData('phonenumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
          style={{ outlineColor: brandColors.primary }}
          placeholder="+91 9876543210"
        />
      </div>

      {/* Social Media Links */}
      <div className="space-y-4">
        <h3 className="font-medium">Social Media Links</h3>
        <p className="text-sm text-gray-500">Add your social media accounts to help customers connect with you</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Instagram</label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                <span className="text-sm text-gray-500">instagram.com/</span>
              </div>
              <input
                type="text"
                value={vendorData.instagram || ''}
                onChange={e => updateVendorData('instagram', e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                style={{ outlineColor: brandColors.primary }}
                placeholder="yourbrand"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">YouTube</label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                <span className="text-sm text-gray-500">youtube.com/</span>
              </div>
              <input
                type="text"
                value={vendorData.youtube || ''}
                onChange={e => updateVendorData('youtube', e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                placeholder="@yourchannel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}