// src/utils/vendor.ts
export const fetchVendorId = async (): Promise<string> => {
  try {
    const token = localStorage.getItem("vendorToken");
    if (!token) return "";
    const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.vendor?.id ?? "";
  } catch {
    return "";
  }
};