import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Input, Text, Textarea, Switch, Badge } from "@medusajs/ui";

interface Admin {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: string;
  name: string;
  handle?: string;
  logo?: string;
  coverphoto?: string;
  youtube?: string;
  instagram?: string;
  xtwitter?: string;
  facebook?: string;
  othersocial?: string;
  phonenumber?: string;
  GSTIN?: string;
  companyname?: string;
  pan_number?: string;
  city?: string;
  pincode?: string;
  state?: string;
  address?: string;
  tan_number?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  bank_account_ifsc_code?: string;
  bank_name?: string;
  bank_account_type?: "Saving" | "Current";
  cancelled_checkque?: string;
  creator_bio?: string;
  creator_title?: string;
  created_at: string;
  updated_at: string;
  admins?: Admin[];
  login_email?: string;
  auth_enabled?: boolean;
  last_login?: string;
  verified?: "Yes" | "No";
  gst_verification_status?: "pending" | "verified" | "failed";
  metadata?: Record<string, any>;
  // ── store mode ─────────────────────────────────────────────────────────────
  sell_on_marketplace?: boolean;
  sell_on_own_store?: boolean;
}

interface VendorFormData {
  name: string;
  handle: string;
  logo?: string;
  coverphoto?: string;
  youtube?: string;
  instagram?: string;
  xtwitter?: string;
  facebook?: string;
  othersocial?: string;
  phonenumber?: string;
  GSTIN?: string;
  companyname?: string;
  pan_number?: string;
  city?: string;
  pincode?: string;
  state?: string;
  address?: string;
  tan_number?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  bank_account_ifsc_code?: string;
  bank_name?: string;
  bank_account_type?: "Saving" | "Current";
  cancelled_checkque?: string;
  creator_bio?: string;
  creator_title?: string;
  login_email?: string;
  auth_enabled?: boolean;
  verified?: "Yes" | "No";
  gst_verification_status?: "pending" | "verified" | "failed";
  metadata?: Record<string, any>;
  // ── store mode ─────────────────────────────────────────────────────────────
  sell_on_marketplace?: boolean;
  sell_on_own_store?: boolean;
}

interface AdminFormData {
  email: string;
  first_name: string;
  last_name: string;
}

interface MetadataItem {
  key: string;
  value: string;
}

// Coerce any DB value to a real boolean
const coerceBool = (val: any): boolean => {
  if (val === true  || val === 1 || val === "true"  || val === "1") return true
  return false
}

const CreatorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabParam || "basic");

  const [formData, setFormData] = useState<VendorFormData>({ name: "", handle: "" });

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<AdminFormData>({ email: "", first_name: "", last_name: "" });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(null);
  const [selectedCheque, setSelectedCheque] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<string>("");

  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([{ key: "", value: "" }]);

  useEffect(() => { fetchVendorDetails(); }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/vendors?vendor_id=${id}`, { credentials: "include" });
      if (!response.ok) throw new Error(`Failed to fetch creator details: ${response.status}`);
      const data = await response.json();

      if (data.vendor) {
        setVendor(data.vendor);
        setFormData({
          name: data.vendor.name || "",
          handle: data.vendor.handle || "",
          logo: data.vendor.logo || "",
          coverphoto: data.vendor.coverphoto || "",
          youtube: data.vendor.youtube || "",
          instagram: data.vendor.instagram || "",
          xtwitter: data.vendor.xtwitter || "",
          facebook: data.vendor.facebook || "",
          othersocial: data.vendor.othersocial || "",
          phonenumber: data.vendor.phonenumber || "",
          GSTIN: data.vendor.GSTIN || "",
          companyname: data.vendor.companyname || "",
          pan_number: data.vendor.pan_number || "",
          city: data.vendor.city || "",
          pincode: data.vendor.pincode || "",
          state: data.vendor.state || "",
          address: data.vendor.address || "",
          tan_number: data.vendor.tan_number || "",
          bank_account_holder_name: data.vendor.bank_account_holder_name || "",
          bank_account_number: data.vendor.bank_account_number || "",
          bank_account_ifsc_code: data.vendor.bank_account_ifsc_code || "",
          bank_name: data.vendor.bank_name || "",
          bank_account_type: data.vendor.bank_account_type || "Saving",
          cancelled_checkque: data.vendor.cancelled_checkque || "",
          creator_bio: data.vendor.creator_bio || "",
          creator_title: data.vendor.creator_title || "",
          login_email: data.vendor.login_email || "",
          auth_enabled: data.vendor.auth_enabled || false,
          verified: data.vendor.verified || "No",
          gst_verification_status: data.vendor.gst_verification_status || "pending",
          metadata: data.vendor.metadata || {},
          // Coerce booleans from DB
          sell_on_marketplace: coerceBool(data.vendor.sell_on_marketplace),
          sell_on_own_store:   coerceBool(data.vendor.sell_on_own_store),
        });

        if (data.vendor.metadata) {
          const arr = Object.entries(data.vendor.metadata).map(([key, value]) => ({ key, value: String(value) }));
          setMetadataItems(arr.length ? arr : [{ key: "", value: "" }]);
        }
      } else {
        setError("Creator data not found in the response");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifiedToggle = () =>
    setFormData(prev => ({ ...prev, verified: prev.verified === "Yes" ? "No" : "Yes" }));

  const handleGstStatusChange = (value: "pending" | "verified" | "failed") =>
    setFormData(prev => ({ ...prev, gst_verification_status: value }));

  const handleAuthEnabledChange = (checked: boolean) =>
    setFormData(prev => ({ ...prev, auth_enabled: checked }));

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...metadataItems];
    updated[index][field] = newValue;
    setMetadataItems(updated);
    const newMeta: Record<string, any> = {};
    updated.forEach(item => { if (item.key.trim()) newMeta[item.key] = item.value; });
    setFormData(prev => ({ ...prev, metadata: newMeta }));
  };

  const addMetadataItem = () => setMetadataItems([...metadataItems, { key: "", value: "" }]);

  const removeMetadataItem = (index: number) => {
    const updated = [...metadataItems];
    updated.splice(index, 1);
    if (!updated.length) updated.push({ key: "", value: "" });
    setMetadataItems(updated);
    const newMeta: Record<string, any> = {};
    updated.forEach(item => { if (item.key.trim()) newMeta[item.key] = item.value; });
    setFormData(prev => ({ ...prev, metadata: newMeta }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (!e.target.files?.length) return;
    if (fileType === "logo") setSelectedLogo(e.target.files[0]);
    if (fileType === "coverphoto") setSelectedCoverPhoto(e.target.files[0]);
    if (fileType === "cheque") setSelectedCheque(e.target.files[0]);
  };

  const handleFileUpload = async (fileType: string) => {
    const file = fileType === "logo" ? selectedLogo : fileType === "coverphoto" ? selectedCoverPhoto : selectedCheque;
    if (!file) return;
    try {
      setIsUploading(true); setUploadProgress(0); setUploadType(fileType); setSaveError(null);
      const fd = new FormData();
      fd.append("files", file);
      const adminToken = localStorage.getItem("adminAuthToken");
      const response = await fetch("/vendors/uploads", {
        method: "POST",
        headers: { "Authorization": adminToken ? `Bearer ${adminToken}` : "", "x-medusa-admin": "true" },
        body: fd, credentials: "include",
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const data = await response.json();
      const fileUrl = data.files?.[0]?.url || data.url || "";
      if (!fileUrl) throw new Error("Could not extract file URL from upload response");
      setFormData(prev => ({ ...prev, [fileType]: fileUrl }));
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      if (fileType === "logo") setSelectedLogo(null);
      if (fileType === "coverphoto") setSelectedCoverPhoto(null);
      if (fileType === "cheque") setSelectedCheque(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false); setUploadProgress(100); setUploadType("");
    }
  };

  const handleSaveVendor = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      const adminToken = localStorage.getItem("adminAuthToken");

      let updateData: Partial<VendorFormData> = {};
      switch (activeTab) {
        case "basic":
          updateData = { name: formData.name, handle: formData.handle, logo: formData.logo, coverphoto: formData.coverphoto, creator_title: formData.creator_title, creator_bio: formData.creator_bio, login_email: formData.login_email, auth_enabled: formData.auth_enabled, verified: formData.verified };
          break;
        case "profile":
          updateData = { youtube: formData.youtube, instagram: formData.instagram, xtwitter: formData.xtwitter, facebook: formData.facebook, othersocial: formData.othersocial, phonenumber: formData.phonenumber, address: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode };
          break;
        case "business":
          updateData = { companyname: formData.companyname, GSTIN: formData.GSTIN, pan_number: formData.pan_number, tan_number: formData.tan_number, gst_verification_status: formData.gst_verification_status };
          break;
        case "banking":
          updateData = { bank_account_holder_name: formData.bank_account_holder_name, bank_account_number: formData.bank_account_number, bank_account_ifsc_code: formData.bank_account_ifsc_code, bank_name: formData.bank_name, bank_account_type: formData.bank_account_type, cancelled_checkque: formData.cancelled_checkque };
          break;
        case "store-mode":
          updateData = { sell_on_marketplace: formData.sell_on_marketplace, sell_on_own_store: formData.sell_on_own_store };
          break;
        case "metadata":
          updateData = { metadata: formData.metadata };
          break;
        default:
          updateData = { ...formData };
      }

      const response = await fetch(`/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": adminToken ? `Bearer ${adminToken}` : "", "x-medusa-admin": "true" },
        body: JSON.stringify(updateData), credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update creator: ${response.status}`);
      }
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      if (!newAdmin.email.trim()) { setSaveError("Email address is required"); return; }
      const response = await fetch(`/vendors/${id}/admins`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: { email: newAdmin.email.trim(), first_name: newAdmin.first_name.trim(), last_name: newAdmin.last_name.trim() } }),
        credentials: "include",
      });
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.message || `Failed to add admin: ${response.status}`); }
      setNewAdmin({ email: "", first_name: "", last_name: "" }); setShowAddAdmin(false);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to add admin");
    } finally { setIsSaving(false); }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    try {
      setIsSaving(true); setSaveError(null);
      const response = await fetch(`/vendors/admins/${adminId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Failed to remove admin: ${response.status}`);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to remove admin");
    } finally { setIsSaving(false); }
  };

  const handleManageAuth = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      const response = await fetch(`/vendors/${id}/auth`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_email: formData.login_email, auth_enabled: formData.auth_enabled }),
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to update auth settings: ${response.status}`);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update auth settings");
    } finally { setIsSaving(false); }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  if (isLoading) return <Container className="py-8"><div className="flex items-center justify-center h-40"><Text>Loading creator details...</Text></div></Container>;
  if (error) return <Container className="py-8"><div className="p-4 text-red-600 border border-red-300 rounded bg-red-50"><Heading level="h2" className="mb-2 text-lg">Error</Heading><Text>{error}</Text><Button variant="secondary" className="mt-4" onClick={() => navigate(`/vendors/${id}`)}>Back to Creator Details</Button></div></Container>;
  if (!vendor) return <Container className="py-8"><div className="p-4 border border-gray-300 rounded bg-gray-50"><Heading level="h2" className="mb-2 text-lg">Creator Not Found</Heading><Button variant="secondary" className="mt-4" onClick={() => navigate("/vendors")}>Back to Creators</Button></div></Container>;

  const neitherSelected = !formData.sell_on_marketplace && !formData.sell_on_own_store;

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Edit {vendor.name}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/vendors/${id}`)}>Back to Creator Details</Button>
          <Button variant="secondary" onClick={() => navigate("/vendors")}>All Creators</Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 mb-4 text-green-600 border border-green-300 rounded bg-green-50">
          <span className="font-bold">Success: </span>Changes saved successfully!
        </div>
      )}
      {saveError && (
        <div className="p-4 mb-4 text-red-600 border border-red-300 rounded bg-red-50">
          <Heading level="h2" className="mb-2 text-lg">Error</Heading><Text>{saveError}</Text>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={vendor.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {vendor.verified === "Yes" ? "Verified Creator" : "Unverified Creator"}
          </Badge>
          {vendor.gst_verification_status === "verified" && <Badge className="text-blue-800 bg-blue-100">GST Verified</Badge>}
          {coerceBool(vendor.sell_on_marketplace) && <Badge className="text-orange-800 bg-orange-100">Marketplace</Badge>}
          {coerceBool(vendor.sell_on_own_store)    && <Badge className="text-green-800 bg-green-100">Own store</Badge>}
        </div>
      </div>

      {/* Tab nav */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap gap-4">
          {[
            { key: "basic",       label: "Basic Info" },
            { key: "store-mode",  label: "Store mode" },   // ← NEW
            { key: "profile",     label: "Profile & Social" },
            { key: "business",    label: "Business Details" },
            { key: "banking",     label: "Banking Info" },
            { key: "admins",      label: "Account Admins" },
            { key: "metadata",    label: "Metadata" },
          ].map(tab => (
            <Button
              key={tab.key}
              variant="transparent"
              className={`py-2 px-1 border-b-2 rounded-none ${activeTab === tab.key ? "border-blue-500" : "border-transparent"}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── STORE MODE TAB ────────────────────────────────────────────────── */}
      {activeTab === "store-mode" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-1">Store mode</Heading>
          <Text className="mb-6 text-sm text-gray-500">
            Control where {vendor.name}'s merch is sold. Both can be active at the same time.
          </Text>

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            {/* Marketplace */}
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${formData.sell_on_marketplace ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-orange-500"
                checked={!!formData.sell_on_marketplace}
                onChange={(e) => setFormData(prev => ({ ...prev, sell_on_marketplace: e.target.checked }))}
              />
              <div>
                <Text className="font-semibold">Junooni marketplace</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Products appear on junooni.com/store/{vendor.handle || vendor.id}. Fans discover them through the platform.
                </Text>
                <Badge className="mt-2 text-orange-800 bg-orange-100">junooni.com</Badge>
              </div>
            </label>

            {/* Own store */}
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${formData.sell_on_own_store ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-green-600"
                checked={!!formData.sell_on_own_store}
                onChange={(e) => setFormData(prev => ({ ...prev, sell_on_own_store: e.target.checked }))}
              />
              <div>
                <Text className="font-semibold">Own branded store</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  A fully branded storefront at the creator's own domain. JUNOONI handles fulfillment invisibly.
                </Text>
                <Badge className="mt-2 text-green-800 bg-green-100">Custom domain</Badge>
              </div>
            </label>
          </div>

          {/* Domain field when own store is on */}
          {formData.sell_on_own_store && (
            <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
              <Label className="block mb-2 text-sm font-medium text-blue-800">
                Custom domain (fill when domain is configured)
              </Label>
              <Input
                type="text"
                placeholder="e.g. merch.tanishkbagchi.com"
                defaultValue={(vendor.metadata?.custom_domain as string) ?? ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, custom_domain: e.target.value }
                }))}
              />
              <Text className="mt-2 text-xs text-blue-600">
                Once set, this is where the creator's branded storefront will be live.
              </Text>
            </div>
          )}

          {/* Both selected note */}
          {formData.sell_on_marketplace && formData.sell_on_own_store && (
            <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
              <Text className="text-sm font-medium text-yellow-800">
                Both selected — merch will appear on junooni.com AND on the creator's own branded storefront.
              </Text>
            </div>
          )}

          {/* Neither warning */}
          {neitherSelected && (
            <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
              <Text className="text-sm text-red-800">
                ⚠️ Neither option is selected — this creator's products won't be publicly visible anywhere. Select at least one.
              </Text>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="primary"
              onClick={handleSaveVendor}
              disabled={isSaving || neitherSelected}
            >
              {isSaving ? "Saving..." : "Save store mode"}
            </Button>
          </div>
        </div>
      )}

      {/* ── BASIC INFO TAB ────────────────────────────────────────────────── */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Basic Information</Heading>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="block mb-2">Creator Name*</Label>
                    <Input id="name" name="name" type="text" value={formData.name} onChange={handleFormChange} placeholder="Enter creator name" required />
                  </div>
                  <div>
                    <Label htmlFor="handle" className="block mb-2">Handle</Label>
                    <Input id="handle" name="handle" type="text" value={formData.handle || ""} onChange={handleFormChange} placeholder="Enter handle" />
                    <Text className="mt-1 text-xs text-gray-500">Will be displayed as @{formData.handle || "handle"}</Text>
                  </div>
                </div>

                <div>
                  <Label htmlFor="creator_title" className="block mb-2">Professional Title</Label>
                  <Input id="creator_title" name="creator_title" type="text" value={formData.creator_title || ""} onChange={handleFormChange} placeholder="Enter professional title" />
                </div>

                <div className="pt-4 border-t">
                  <Heading level="h3" className="mb-3 text-lg">Verification Status</Heading>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="block mb-1">Creator Verification</Label>
                      <Text className="text-sm text-gray-500">Mark this creator as verified</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={formData.verified === "Yes"} onCheckedChange={handleVerifiedToggle} />
                      <Button variant="secondary" size="small" disabled={formData.verified === "Yes"} onClick={() => setFormData(prev => ({ ...prev, verified: "Yes" }))}>Verify Now</Button>
                    </div>
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <Badge className={formData.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {formData.verified === "Yes" ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Heading level="h3" className="mb-3 text-lg">Creator Images</Heading>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logo" className="block mb-2">Logo URL</Label>
                      <Input id="logo" name="logo" type="text" value={formData.logo || ""} onChange={handleFormChange} placeholder="Enter logo URL" />
                      {formData.logo && <div className="mt-2 w-20 h-20 overflow-hidden border rounded"><img src={formData.logo} alt="Creator logo" className="object-contain w-full h-full" /></div>}
                      <div className="flex items-center gap-2 mt-2">
                        <Input id="logoFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} disabled={isUploading && uploadType === "logo"} />
                        <Button variant="secondary" onClick={() => handleFileUpload("logo")} disabled={!selectedLogo || (isUploading && uploadType === "logo")}>
                          {isUploading && uploadType === "logo" ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coverphoto" className="block mb-2">Cover Photo URL</Label>
                      <Input id="coverphoto" name="coverphoto" type="text" value={formData.coverphoto || ""} onChange={handleFormChange} placeholder="Enter cover photo URL" />
                      {formData.coverphoto && <div className="mt-2 w-full h-32 overflow-hidden border rounded"><img src={formData.coverphoto} alt="Cover photo" className="object-cover w-full h-full" /></div>}
                      <div className="flex items-center gap-2 mt-2">
                        <Input id="coverFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "coverphoto")} disabled={isUploading && uploadType === "coverphoto"} />
                        <Button variant="secondary" onClick={() => handleFileUpload("coverphoto")} disabled={!selectedCoverPhoto || (isUploading && uploadType === "coverphoto")}>
                          {isUploading && uploadType === "coverphoto" ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Login Information</Heading>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Authentication Status</Label>
                    <Switch checked={formData.auth_enabled || false} onCheckedChange={handleAuthEnabledChange} />
                  </div>
                  <Badge className={formData.auth_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {formData.auth_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <Label htmlFor="login_email" className="block mb-2">Login Email</Label>
                  <Input id="login_email" name="login_email" type="email" value={formData.login_email || ""} onChange={handleFormChange} placeholder="Enter login email" disabled={!formData.auth_enabled} />
                </div>
                <div className="pt-2">
                  <Button variant="secondary" size="small" onClick={handleManageAuth} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Update Auth Settings"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Creator Bio</Heading>
              <Label htmlFor="creator_bio" className="block mb-2">Biography</Label>
              <Textarea id="creator_bio" name="creator_bio" value={formData.creator_bio || ""} onChange={handleFormChange} placeholder="Enter creator biography" rows={10} />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Basic Info"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE & SOCIAL TAB ─────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Social Media & Contact</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Social Profiles</Heading>
              <div className="space-y-4">
                {(["youtube", "instagram", "xtwitter", "facebook", "othersocial"] as const).map((field) => (
                  <div key={field}>
                    <Label htmlFor={field} className="block mb-2">{field === "xtwitter" ? "X (Twitter)" : field === "othersocial" ? "Other Social" : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input id={field} name={field} type="text" value={formData[field] || ""} onChange={handleFormChange} placeholder={`Enter ${field}`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Contact Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phonenumber" className="block mb-2">Phone Number</Label>
                  <Input id="phonenumber" name="phonenumber" type="tel" value={formData.phonenumber || ""} onChange={handleFormChange} placeholder="Enter phone number" />
                </div>
                <div>
                  <Label htmlFor="address" className="block mb-2">Address</Label>
                  <Textarea id="address" name="address" value={formData.address || ""} onChange={handleFormChange} placeholder="Enter street address" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="block mb-2">City</Label>
                    <Input id="city" name="city" type="text" value={formData.city || ""} onChange={handleFormChange} placeholder="Enter city" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="block mb-2">State</Label>
                    <Input id="state" name="state" type="text" value={formData.state || ""} onChange={handleFormChange} placeholder="Enter state" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pincode" className="block mb-2">Pincode</Label>
                  <Input id="pincode" name="pincode" type="text" value={formData.pincode || ""} onChange={handleFormChange} placeholder="Enter pincode" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Profile & Social"}</Button>
          </div>
        </div>
      )}

      {/* ── BUSINESS DETAILS TAB ─────────────────────────────────────────── */}
      {activeTab === "business" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Business Information</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Company Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyname" className="block mb-2">Company Name</Label>
                  <Input id="companyname" name="companyname" type="text" value={formData.companyname || ""} onChange={handleFormChange} placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="GSTIN" className="block mb-2">GSTIN</Label>
                  <Input id="GSTIN" name="GSTIN" type="text" value={formData.GSTIN || ""} onChange={handleFormChange} placeholder="Enter GSTIN" />
                </div>
                <div>
                  <Label htmlFor="gst_verification_status" className="block mb-2">GST Verification Status</Label>
                  <select id="gst_verification_status" name="gst_verification_status" value={formData.gst_verification_status || "pending"} onChange={handleFormChange} className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="failed">Failed</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="small" onClick={() => handleGstStatusChange("verified")} disabled={formData.gst_verification_status === "verified" || !formData.GSTIN}>Mark as Verified</Button>
                    <Button variant="secondary" size="small" onClick={() => handleGstStatusChange("failed")} disabled={formData.gst_verification_status === "failed" || !formData.GSTIN}>Mark as Failed</Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Tax Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pan_number" className="block mb-2">PAN Number</Label>
                  <Input id="pan_number" name="pan_number" type="text" value={formData.pan_number || ""} onChange={handleFormChange} placeholder="Enter PAN number" />
                </div>
                <div>
                  <Label htmlFor="tan_number" className="block mb-2">TAN Number</Label>
                  <Input id="tan_number" name="tan_number" type="text" value={formData.tan_number || ""} onChange={handleFormChange} placeholder="Enter TAN number" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Business Details"}</Button>
          </div>
        </div>
      )}

      {/* ── BANKING INFO TAB ─────────────────────────────────────────────── */}
      {activeTab === "banking" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Banking Details</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_account_holder_name" className="block mb-2">Account Holder Name</Label>
                  <Input id="bank_account_holder_name" name="bank_account_holder_name" type="text" value={formData.bank_account_holder_name || ""} onChange={handleFormChange} placeholder="Enter account holder name" />
                </div>
                <div>
                  <Label htmlFor="bank_name" className="block mb-2">Bank Name</Label>
                  <Input id="bank_name" name="bank_name" type="text" value={formData.bank_name || ""} onChange={handleFormChange} placeholder="Enter bank name" />
                </div>
                <div>
                  <Label htmlFor="bank_account_type" className="block mb-2">Account Type</Label>
                  <select id="bank_account_type" name="bank_account_type" value={formData.bank_account_type || "Saving"} onChange={handleFormChange} className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Saving">Saving</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_account_number" className="block mb-2">Account Number</Label>
                  <Input id="bank_account_number" name="bank_account_number" type="text" value={formData.bank_account_number || ""} onChange={handleFormChange} placeholder="Enter account number" />
                </div>
                <div>
                  <Label htmlFor="bank_account_ifsc_code" className="block mb-2">IFSC Code</Label>
                  <Input id="bank_account_ifsc_code" name="bank_account_ifsc_code" type="text" value={formData.bank_account_ifsc_code || ""} onChange={handleFormChange} placeholder="Enter IFSC code" />
                </div>
                <div>
                  <Label htmlFor="cancelled_checkque" className="block mb-2">Cancelled Cheque</Label>
                  <Input id="cancelled_checkque" name="cancelled_checkque" type="text" value={formData.cancelled_checkque || ""} onChange={handleFormChange} placeholder="Enter cancelled cheque URL" disabled={isUploading} />
                  {formData.cancelled_checkque && (
                    <div className="mt-2">
                      <Badge className="text-green-800 bg-green-100">Uploaded</Badge>
                      <Button variant="secondary" size="small" className="ml-2" onClick={() => window.open(formData.cancelled_checkque, "_blank")}>View</Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Input id="chequeFile" type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, "cheque")} disabled={isUploading && uploadType === "cheque"} />
                    <Button variant="secondary" onClick={() => handleFileUpload("cheque")} disabled={!selectedCheque || (isUploading && uploadType === "cheque")}>
                      {isUploading && uploadType === "cheque" ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Banking Details"}</Button>
          </div>
        </div>
      )}

      {/* ── ADMINS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "admins" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Account Administrators</Heading>
            <Button variant="secondary" size="small" onClick={() => setShowAddAdmin(!showAddAdmin)}>
              {showAddAdmin ? "Cancel" : "Add New Admin"}
            </Button>
          </div>
          {showAddAdmin && (
            <div className="p-4 mb-6 border rounded-lg bg-gray-50">
              <Heading level="h3" className="mb-4 text-md">Add New Admin</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail" className="block mb-2">Email Address*</Label>
                  <Input id="adminEmail" name="email" type="email" value={newAdmin.email} onChange={handleNewAdminChange} placeholder="Enter admin email" required />
                </div>
                <div>
                  <Label htmlFor="adminFirstName" className="block mb-2">First Name</Label>
                  <Input id="adminFirstName" name="first_name" type="text" value={newAdmin.first_name} onChange={handleNewAdminChange} placeholder="Enter first name" />
                </div>
                <div>
                  <Label htmlFor="adminLastName" className="block mb-2">Last Name</Label>
                  <Input id="adminLastName" name="last_name" type="text" value={newAdmin.last_name} onChange={handleNewAdminChange} placeholder="Enter last name" />
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <Button variant="primary" size="small" onClick={handleAddAdmin} disabled={isSaving || !newAdmin.email}>
                    {isSaving ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {vendor.admins && vendor.admins.length > 0 ? (
            <div className="space-y-4">
              {vendor.admins.map((admin) => (
                <div key={admin.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Text className="font-medium">{admin.first_name || admin.last_name ? `${admin.first_name || ""} ${admin.last_name || ""}`.trim() : "Unnamed Admin"}</Text>
                      <Text>{admin.email}</Text>
                      <Text className="text-sm text-gray-500">Added: {new Date(admin.created_at).toLocaleDateString()}</Text>
                    </div>
                    <Button variant="danger" size="small" onClick={() => handleDeleteAdmin(admin.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center border rounded-lg bg-gray-50">
              <Text className="text-gray-500">No admins assigned to this creator</Text>
            </div>
          )}
        </div>
      )}

      {/* ── METADATA TAB ─────────────────────────────────────────────────── */}
      {activeTab === "metadata" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Metadata</Heading>
            <Button variant="secondary" size="small" onClick={addMetadataItem}>Add Field</Button>
          </div>
          <Text className="mb-4 text-gray-600">Custom key-value pairs for additional information about this creator.</Text>
          <div className="space-y-4">
            {metadataItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Label htmlFor={`meta-key-${index}`} className="block mb-1">Key</Label>
                  <Input id={`meta-key-${index}`} type="text" value={item.key} onChange={(e) => handleMetadataChange(index, "key", e.target.value)} placeholder="Enter metadata key" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`meta-value-${index}`} className="block mb-1">Value</Label>
                  <Input id={`meta-value-${index}`} type="text" value={item.value} onChange={(e) => handleMetadataChange(index, "value", e.target.value)} placeholder="Enter metadata value" />
                </div>
                <div className="pt-6">
                  <Button variant="secondary" size="small" onClick={() => removeMetadataItem(index)} disabled={metadataItems.length === 1 && item.key === "" && item.value === ""}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Metadata"}</Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CreatorEditPage;