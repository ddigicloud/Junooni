// import { useState, useEffect, useRef } from "react";
// import VendorHandleInput from "./VendorHandleInput";
// import { useNavigate } from "@tanstack/react-router";
// import ChatwootWidget from '@/components/ChatwootWidget'
// import JunooniLogo from '../../../../assets/junooni_logo_brand_color.png'
// import { Link } from "@tanstack/react-router";
// import { IconShoppingBag, IconWorld } from "@tabler/icons-react";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import {
//   IconCircleCheck, IconAlertCircle, IconUser,
//   IconFileText, IconCheckbox, IconChevronRight, IconHelpCircle,
//   IconX, IconLogout,
//   IconCamera, IconBrandInstagram, IconBrandYoutube, IconBrandTwitter, IconBrandFacebook,
//   IconPhone, IconSparkles, IconCheck
// } from "@tabler/icons-react";
// import { cn } from "@/lib/utils";


// interface ApiVendorResponse {
//   vendor: VendorData;
// }

// interface VendorData {
//   id: string;
//   handle: string;
//   name: string;
//   logo: string | null;
//   coverphoto: string | null;
//   youtube: string | null;
//   instagram: string | null;
//   xtwitter: string | null;
//   facebook: string | null;
//   othersocial: string | null;
//   phonenumber: string | null;
//   GSTIN: string | null;
//   gst_verification_status: "pending" | "verified" | "failed";
//   companyname: string | null;
//   pan_number: string | null;
//   city: string | null;
//   pincode: string | null;
//   state: string | null;
//   address: string | null;
//   tan_number: string | null;
//   bank_account_holder_name: string | null;
//   bank_account_number: string | null;
//   bank_account_ifsc_code: string | null;
//   bank_name: string | null;
//   bank_account_type: "Saving" | "Current";
//   cancelled_checkque: string | null;
//   creator_bio: string | null;
//   creator_title: string | null;
//   creator_category: string | null;
//   sell_on_marketplace: boolean;
//   sell_on_own_store: boolean;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   admins: {
//     email: string,
//     first_name: string,
//     last_name: string
//   }[]
// }

// const STEPS = [
//   {
//     id: "basic-info",
//     title: "Your identity",
//     description: "Name, handle & contact",
//     icon: IconUser,
//     isSkippable: false,
//     estimatedTime: "2 min",
//   },
//   {
//     id: "sell-type",
//     title: "Where to sell",
//     description: "Pick your storefront",
//     icon: IconShoppingBag,
//     isSkippable: false,
//     estimatedTime: "1 min",
//   },
//   {
//     id: "creator-profile",
//     title: "Your profile",
//     description: "Brand details & bio",
//     icon: IconFileText,
//     isSkippable: true,
//     estimatedTime: "2 min",
//   },
// ];

// const BRAND = {
//   primary: "#e65100",
//   secondary: "#ac1900",
//   accent: "#581845",
//   light: "#FFC300",
//   background: "#FFEFD5",
//   success: "#e65100",
//   warning: "#F39C12",
//   error: "#E74C3C",
//   textPrimary: "#1a1a1a",
//   textSecondary: "#666666",
//   textLight: "#999999"
// };

// const checkTokenForActorId = () => {
//   try {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) return { hasActorId: false, actorId: null };
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     const actorId = payload.actor_id || payload.sub || payload.id;
//     return { hasActorId: !!actorId, actorId };
//   } catch {
//     return { hasActorId: false, actorId: null };
//   }
// };

// const getEmailFromToken = (): string => {
//   try {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) return '';
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.email || payload.app_metadata?.email || payload.entity_id || '';
//   } catch {
//     return '';
//   }
// };

// const inputClass = "w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400";

// const Field = ({ label, hint, required = false, error = '', children }: {
//   label: any; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
// }) => (
//   <div className="space-y-1.5">
//     <div className="flex items-baseline justify-between">
//       <label className="text-sm font-semibold text-gray-800">
//         {label}
//         {required && <span className="ml-1 text-red-400">*</span>}
//       </label>
//       {hint && <span className="text-xs text-gray-400">{hint}</span>}
//     </div>
//     {children}
//     {error && <p className="flex items-center gap-1 text-xs text-red-500"><IconAlertCircle className="w-3 h-3" />{error}</p>}
//   </div>
// );

// // ── Social links collapsible ──
// const SocialLinksSection = ({ vendorData, updateVendorData, brandColors }) => {
//   const [open, setOpen] = useState(false);
//   const hasSocial = vendorData.vendor.instagram || vendorData.vendor.youtube || vendorData.vendor.xtwitter || vendorData.vendor.facebook;

//   return (
//     <div className="overflow-hidden border border-gray-100 rounded-2xl">
//       <button type="button" onClick={() => setOpen(!open)}
//         className="flex items-center justify-between w-full px-5 py-4 transition-colors bg-gray-50 hover:bg-gray-100">
//         <div className="flex items-center gap-3">
//           <div className="flex gap-1">
//             {[IconBrandInstagram, IconBrandYoutube, IconBrandTwitter].map((Icon, i) => (
//               <div key={i} className="flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-md">
//                 <Icon className="w-3.5 h-3.5 text-gray-400" />
//               </div>
//             ))}
//           </div>
//           <div className="text-left">
//             <p className="text-sm font-semibold text-gray-700">Social Media Links</p>
//             <p className="text-xs text-gray-400">{hasSocial ? 'Some accounts connected' : 'Optional — helps fans find you'}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {hasSocial && <span className="w-2 h-2 bg-green-400 rounded-full" />}
//           <IconChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-90")} />
//         </div>
//       </button>
//       {open && (
//         <div className="p-5 space-y-4 bg-white">
//           {[
//             { label: "Instagram", field: "instagram", icon: IconBrandInstagram, prefix: "instagram.com/", placeholder: "yourbrand", color: "#E1306C" },
//             { label: "YouTube", field: "youtube", icon: IconBrandYoutube, prefix: "youtube.com/", placeholder: "@yourchannel", color: "#FF0000" },
//             { label: "Twitter / X", field: "xtwitter", icon: IconBrandTwitter, prefix: "twitter.com/", placeholder: "@yourhandle", color: "#1DA1F2" },
//             { label: "Facebook", field: "facebook", icon: IconBrandFacebook, prefix: "facebook.com/", placeholder: "@yourhandle", color: "#1877F2" },
//           ].map(({ label, field, icon: Icon, prefix, placeholder, color }) => (
//             <div key={field}>
//               <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
//                 <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
//               </label>
//               <div className="flex overflow-hidden border border-gray-200 rounded-xl bg-gray-50">
//                 <span className="flex items-center flex-shrink-0 px-3 text-xs text-gray-400 border-r border-gray-200 whitespace-nowrap bg-gray-50">{prefix}</span>
//                 <input type="text" value={vendorData.vendor[field] || ''} onChange={(e) => updateVendorData(field, e.target.value)}
//                   className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder:text-gray-300" placeholder={placeholder} />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Animated step wrapper ──
// const AnimatedStep = ({ children, direction }: { children: React.ReactNode; direction: 'forward' | 'back' }) => (
//   <div style={{ animation: direction === 'forward' ? 'slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both' : 'slideInLeft 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
//     {children}
//   </div>
// );

// // ── STEP 1: Basic Info ──
// const StepBasicInfo = ({ vendorData, updateVendorData, setVendorData, brandColors }) => (
//   <div className="space-y-5">
//     <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
//       <div className="flex items-center gap-2">
//         <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
//           <IconUser className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
//         </div>
//         <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Your name</span>
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         <Field label="First Name" required error={!vendorData.vendor.admins?.[0]?.first_name ? "Required" : ""}>
//           <input type="text" value={vendorData.vendor.admins?.[0]?.first_name || ''}
//             onChange={(e) => {
//               const updated = { ...vendorData };
//               if (!updated.vendor.admins?.length) updated.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
//               updated.vendor.admins[0].first_name = e.target.value;
//               setVendorData(updated);
//             }}
//             className={inputClass} placeholder="Priya" />
//         </Field>
//         <Field label="Last Name" required error={!vendorData.vendor.admins?.[0]?.last_name ? "Required" : ""}>
//           <input type="text" value={vendorData.vendor.admins?.[0]?.last_name || ''}
//             onChange={(e) => {
//               const updated = { ...vendorData };
//               if (!updated.vendor.admins?.length) updated.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
//               updated.vendor.admins[0].last_name = e.target.value;
//               setVendorData(updated);
//             }}
//             className={inputClass} placeholder="Sharma" />
//         </Field>
//       </div>
//     </div>

//     <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
//       <div className="flex items-center gap-2">
//         <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
//           <IconSparkles className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
//         </div>
//         <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Handle & contact</span>
//       </div>
//       <VendorHandleInput vendorData={vendorData} updateVendorData={updateVendorData} brandColors={brandColors} />
//       <Field label="Phone Number" hint="Optional — for support only">
//         <div className="flex">
//           <span className="flex items-center flex-shrink-0 px-3 text-sm text-gray-500 bg-white border border-r-0 border-gray-200 rounded-l-xl">
//             <IconPhone className="w-4 h-4" />
//           </span>
//           <input type="tel" value={vendorData.vendor.phonenumber || ''} onChange={(e) => updateVendorData('phonenumber', e.target.value)}
//             className="w-full px-4 py-3 text-sm transition-all bg-white border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 placeholder:text-gray-400"
//             placeholder="+91 98765 43210" />
//         </div>
//       </Field>
//     </div>
//   </div>
// );

// // ── STEP 2: Sell Type ──
// const StepSellType = ({ vendorData, updateVendorData }) => (
//   <div className="space-y-4">
//     <p className="text-sm text-gray-500">Choose where your merch will appear. Pick one or both.</p>
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

//       {/* Marketplace */}
//       <button type="button" onClick={() => updateVendorData('sell_on_marketplace', !vendorData.vendor.sell_on_marketplace)}
//         className={cn("relative text-left p-6 rounded-2xl border-2 transition-all duration-200",
//           vendorData.vendor.sell_on_marketplace ? "border-orange-400 bg-orange-50/70 shadow-md" : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm")}>
//         <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
//           vendorData.vendor.sell_on_marketplace ? "bg-[#e65100] border-[#e65100]" : "border-gray-300 bg-white")}>
//           {vendorData.vendor.sell_on_marketplace && <IconCheck className="w-3 h-3 text-white" />}
//         </div>
//         <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl" style={{ background: "#fff0e8" }}>
//           <IconShoppingBag style={{ color: BRAND.primary, width: 22, height: 22 }} />
//         </div>
//         <p className="mb-1 text-base font-bold text-gray-900 pr-7">JUNOONI Marketplace</p>
//         <p className="mb-4 text-xs leading-relaxed text-gray-500">Your merch on junooni.com alongside other creators. Zero setup needed.</p>
//         <div className="pt-3 space-y-2 border-t border-orange-100">
//           {["Instant go-live", "Built-in fan discovery", "Zero extra setup"].map(f => (
//             <div key={f} className="flex items-center gap-2">
//               <div className="flex items-center justify-center w-4 h-4 rounded-full shrink-0" style={{ background: `${BRAND.primary}18` }}>
//                 <IconCheck className="w-2.5 h-2.5" style={{ color: BRAND.primary }} />
//               </div>
//               <span className="text-xs text-gray-600">{f}</span>
//             </div>
//           ))}
//         </div>
//       </button>

//       {/* Own store */}
//       <button type="button" onClick={() => updateVendorData('sell_on_own_store', !vendorData.vendor.sell_on_own_store)}
//         className={cn("relative text-left p-6 rounded-2xl border-2 transition-all duration-200",
//           vendorData.vendor.sell_on_own_store ? "border-emerald-400 bg-emerald-50/70 shadow-md" : "border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm")}>
//         <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
//           vendorData.vendor.sell_on_own_store ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white")}>
//           {vendorData.vendor.sell_on_own_store && <IconCheck className="w-3 h-3 text-white" />}
//         </div>
//         <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl" style={{ background: "#e8f5e9" }}>
//           <IconWorld className="text-emerald-600" style={{ width: 22, height: 22 }} />
//         </div>
//         <p className="mb-1 text-base font-bold text-gray-900 pr-7">Your Own Store</p>
//         <p className="mb-4 text-xs leading-relaxed text-gray-500">Sell from your own branded domain. We handle everything invisibly.</p>
//         <div className="pt-3 space-y-2 border-t border-emerald-100">
//           {["Custom domain", "100% your branding", "Full page builder"].map(f => (
//             <div key={f} className="flex items-center gap-2">
//               <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 shrink-0">
//                 <IconCheck className="w-2.5 h-2.5 text-emerald-600" />
//               </div>
//               <span className="text-xs text-gray-600">{f}</span>
//             </div>
//           ))}
//         </div>
//       </button>
//     </div>

//     {vendorData.vendor.sell_on_marketplace && vendorData.vendor.sell_on_own_store && (
//       <div className="px-4 py-3 text-xs font-medium border rounded-xl text-amber-800 bg-amber-50 border-amber-100">
//         🎯 Both selected — merch will appear on junooni.com AND your branded storefront simultaneously.
//       </div>
//     )}
//     {vendorData.vendor.sell_on_own_store && !vendorData.vendor.sell_on_marketplace && (
//       <div className="px-4 py-3 text-xs text-blue-700 border border-blue-100 rounded-xl bg-blue-50">
//         🔧 Our team will help configure your domain and branded theme after you confirm.
//       </div>
//     )}
//     {!vendorData.vendor.sell_on_marketplace && !vendorData.vendor.sell_on_own_store && (
//       <div className="px-4 py-3 text-xs text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
//         👆 Select at least one option to continue.
//       </div>
//     )}
//   </div>
// );

// // ── STEP 3: Creator Profile (conditional) ──
// const StepCreatorProfile = ({ vendorData, updateVendorData, handleFileUpload, isUploading, uploadType, brandColors }) => {
//   const isMarketplace = vendorData.vendor.sell_on_marketplace;

//   return (
//     <div className="space-y-5">
//       {/* Brand name + photos — marketplace only */}
//       {isMarketplace && (
//         <div className="p-5 space-y-4 border border-gray-100 rounded-2xl bg-gray-50">
//           <div className="flex items-center gap-2">
//             <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
//               <IconSparkles className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
//             </div>
//             <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Brand</span>
//           </div>
//           <Field label="Brand Name" required hint="What customers will see" error={!vendorData.vendor.name ? "Required" : ""}>
//             <input type="text" value={vendorData.vendor.name || ''} onChange={(e) => updateVendorData('name', e.target.value)}
//               className={inputClass} placeholder="e.g. Priya's Art Studio" />
//           </Field>
//           <div className="flex gap-4">
//             <div className="flex-shrink-0">
//               <p className="mb-2 text-xs font-medium text-center text-gray-600">Profile pic</p>
//               <div className="relative w-20 h-20 overflow-hidden transition-all border-2 border-dashed cursor-pointer rounded-2xl group hover:border-orange-400"
//                 style={{ borderColor: vendorData.vendor.logo ? brandColors.success : '#e5e7eb' }}
//                 onClick={() => document.getElementById('logo-upload').click()}>
//                 {vendorData.vendor.logo ? (
//                   <>
//                     <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
//                     <div className="absolute inset-0 flex items-center justify-center transition-all opacity-0 bg-black/40 group-hover:opacity-100">
//                       <span className="text-xs font-medium text-white">Change</span>
//                     </div>
//                     <button className="absolute flex items-center justify-center w-5 h-5 transition-all bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
//                       onClick={(e) => { e.stopPropagation(); updateVendorData('logo', null); }}>
//                       <IconX className="w-3 h-3 text-white" />
//                     </button>
//                   </>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center w-full h-full bg-white">
//                     <IconCamera className="w-5 h-5 mb-1 text-gray-300" />
//                     <span className="text-xs text-gray-400">Upload</span>
//                   </div>
//                 )}
//                 <input id="logo-upload" type="file" accept="image/*" disabled={isUploading && uploadType === 'logo'} className="hidden"
//                   onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'logo'); e.target.value = ''; }} />
//               </div>
//               <p className="mt-1 text-xs text-center text-gray-400">400×400px</p>
//             </div>
//             <div className="flex-1">
//               <p className="mb-2 text-xs font-medium text-gray-600">Cover Photo</p>
//               <div className="relative h-20 overflow-hidden transition-all border-2 border-dashed cursor-pointer rounded-2xl group hover:border-orange-400"
//                 style={{ borderColor: vendorData.vendor.coverphoto ? brandColors.success : '#e5e7eb' }}
//                 onClick={() => document.getElementById('cover-upload').click()}>
//                 {vendorData.vendor.coverphoto ? (
//                   <>
//                     <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
//                     <div className="absolute inset-0 flex items-center justify-center transition-all opacity-0 bg-black/40 group-hover:opacity-100">
//                       <span className="text-xs font-medium text-white">Change</span>
//                     </div>
//                     <button className="absolute flex items-center justify-center w-5 h-5 transition-all bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
//                       onClick={(e) => { e.stopPropagation(); updateVendorData('coverphoto', null); }}>
//                       <IconX className="w-3 h-3 text-white" />
//                     </button>
//                   </>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center w-full h-full bg-white">
//                     <IconCamera className="w-4 h-4 mb-1 text-gray-300" />
//                     <span className="text-xs text-gray-400">Click to upload a cover photo</span>
//                     <span className="text-xs text-gray-300 mt-0.5">1200×400px</span>
//                   </div>
//                 )}
//                 <input id="cover-upload" type="file" accept="image/jpeg,image/png" disabled={isUploading && uploadType === 'coverphoto'} className="hidden"
//                   onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'coverphoto'); e.target.value = ''; }} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Social links — both types */}
//       <SocialLinksSection vendorData={vendorData} updateVendorData={updateVendorData} brandColors={brandColors} />

//       {/* Creator info — both types */}
//       <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
//         <div className="flex items-center gap-2">
//           <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
//             <IconFileText className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
//           </div>
//           <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">About you</span>
//           <span className="ml-1 text-xs text-gray-400">(all optional)</span>
//         </div>

//         <Field label="What do you create" hint="Keep it short — one line">
//           <input type="text" value={vendorData.vendor.creator_title || ''} onChange={(e) => updateVendorData('creator_title', e.target.value)}
//             className={inputClass} placeholder="e.g. Bollywood music producer & composer" maxLength={60} />
//         </Field>

//         <Field label="Category">
//           <div className="grid grid-cols-3 gap-2">
//             {[
//               { value: "Music", emoji: "🎵" }, { value: "Cinema", emoji: "🎬" }, { value: "Art", emoji: "🎨" },
//               { value: "Fashion", emoji: "👗" }, { value: "Sports", emoji: "⚽" }, { value: "Comedy", emoji: "😄" },
//               { value: "Gaming", emoji: "🎮" }, { value: "Influencer", emoji: "✨" }, { value: "other", emoji: "🌟" },
//             ].map(({ value, emoji }) => (
//               <button key={value} type="button" onClick={() => updateVendorData('creator_category', value)}
//                 className={cn("flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all",
//                   vendorData.vendor.creator_category === value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50")}>
//                 <span className="mb-1 text-lg">{emoji}</span>
//                 <span>{value === "other" ? "Other" : value}</span>
//               </button>
//             ))}
//           </div>
//         </Field>

//         <Field label="Your Bio" hint={`${vendorData.vendor.creator_bio?.length || 0}/500`}>
//           <textarea value={vendorData.vendor.creator_bio || ''} onChange={(e) => updateVendorData('creator_bio', e.target.value)}
//             rows={4} maxLength={500} className={`${inputClass} resize-none`}
//             placeholder="Tell fans what you do, what you've created, and why they should follow you." />
//           <p className="text-xs text-gray-400">💡 2–3 sentences is enough. Mention your best work.</p>
//         </Field>
//       </div>
//     </div>
//   );
// };

// // ── STEP 4: Final Review ──
// const StepFinalReview = ({ vendorData, stepCompletion, setCurrentStep, termsAgreed, setTermsAgreed, openDialog, setOpenDialog }) => (
//   <div className="space-y-5">
//     <div className="p-5 text-center rounded-2xl"
//       style={{ background: `linear-gradient(135deg, ${BRAND.primary}08 0%, ${BRAND.light}12 100%)`, border: `1px solid ${BRAND.primary}18` }}>
//       <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full" style={{ background: `${BRAND.success}18` }}>
//         <IconCheck className="w-6 h-6" style={{ color: BRAND.success }} />
//       </div>
//       <h3 className="mb-1 font-bold text-gray-800">Almost there!</h3>
//       <p className="text-sm text-gray-500">Review your details, then launch your store.</p>
//     </div>

//     <div className="space-y-3">
//       {STEPS.filter(s => s.id !== "final-review").map((step) => {
//         const isCompleted = stepCompletion[step.id];
//         const StepIcon = step.icon;
//         return (
//           <div key={step.id} className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center rounded-lg w-7 h-7"
//                   style={{ background: isCompleted ? `${BRAND.success}18` : `${BRAND.error}12` }}>
//                   {isCompleted
//                     ? <IconCircleCheck className="w-4 h-4" style={{ color: BRAND.success }} />
//                     : <StepIcon className="w-4 h-4" style={{ color: BRAND.error }} />}
//                 </div>
//                 <span className="text-sm font-semibold text-gray-800">{step.title}</span>
//                 {!isCompleted && step.isSkippable && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg">Optional</span>}
//                 {!isCompleted && !step.isSkippable && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-lg">Incomplete</span>}
//               </div>
//               <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100"
//                 style={{ color: BRAND.primary }} onClick={() => setCurrentStep(step.id)}>
//                 {isCompleted ? 'Edit' : 'Fill in →'}
//               </button>
//             </div>
//             <div className="px-4 py-3 text-sm">
//               {step.id === "basic-info" && (
//                 <div className="grid grid-cols-2 gap-x-6 gap-y-1">
//                   <div><span className="text-xs text-gray-400">Name</span><p className="font-medium text-gray-800">{vendorData.vendor.admins?.[0]?.first_name ? `${vendorData.vendor.admins[0].first_name} ${vendorData.vendor.admins[0].last_name}` : '—'}</p></div>
//                   <div><span className="text-xs text-gray-400">Phone</span><p className="font-medium text-gray-800">{vendorData.vendor.phonenumber || '—'}</p></div>
//                 </div>
//               )}
//               {step.id === "sell-type" && (
//                 <div className="flex gap-2">
//                   {vendorData.vendor.sell_on_marketplace && <span className="px-2 py-1 text-xs font-medium text-orange-700 border border-orange-100 rounded-lg bg-orange-50">JUNOONI Marketplace</span>}
//                   {vendorData.vendor.sell_on_own_store && <span className="px-2 py-1 text-xs font-medium border rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100">Own Store</span>}
//                   {!vendorData.vendor.sell_on_marketplace && !vendorData.vendor.sell_on_own_store && <span className="text-xs text-gray-400">—</span>}
//                 </div>
//               )}
//               {step.id === "creator-profile" && (
//                 <div className="grid grid-cols-2 gap-x-6 gap-y-1">
//                   <div><span className="text-xs text-gray-400">Brand</span><p className="font-medium text-gray-800 truncate">{vendorData.vendor.name || '—'}</p></div>
//                   <div><span className="text-xs text-gray-400">Category</span><p className="font-medium text-gray-800">{vendorData.vendor.creator_category || '—'}</p></div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>

//     <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
//       <label className="flex items-start gap-3 cursor-pointer">
//         <div className="relative flex-shrink-0 mt-0.5">
//           <input type="checkbox" className="sr-only peer" checked={termsAgreed} onChange={() => setTermsAgreed(!termsAgreed)} />
//           <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
//             termsAgreed ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white")}>
//             {termsAgreed && <IconCheck className="w-3 h-3 text-white" />}
//           </div>
//         </div>
//         <div>
//           <p className="text-sm font-medium text-gray-800">Everything looks good — let's go!</p>
//           <p className="text-xs text-gray-400 mt-0.5">
//             By submitting you agree to our{' '}
//             <button type="button" className="font-medium underline" style={{ color: BRAND.primary }}
//               onClick={(e) => { e.preventDefault(); setOpenDialog('terms'); }}>Terms</button>
//             {' '}and{' '}
//             <button type="button" className="font-medium underline" style={{ color: BRAND.primary }}
//               onClick={(e) => { e.preventDefault(); setOpenDialog('seller'); }}>Seller Policy</button>.
//           </p>
//         </div>
//       </label>
//     </div>

//     <Dialog open={openDialog === 'terms'} onOpenChange={(open) => !open && setOpenDialog(null)}>
//       <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold" style={{ color: BRAND.primary }}>Terms of Service</DialogTitle>
//           <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4 text-sm">
//           {[
//             { title: "1. Acceptance of Terms", body: "By accessing and using Junooni's creator platform, you accept and agree to be bound by the terms and provision of this agreement." },
//             { title: "2. Creator Responsibilities", body: "As a creator, you are responsible for the accuracy and legality of your product listings, fulfilling orders in a timely manner, providing excellent customer service, and complying with all applicable laws." },
//             { title: "3. Intellectual Property", body: "You retain all rights to your intellectual property. By listing products on JUNOONI, you grant us a limited license to display, promote, and sell your products through our platform." },
//             { title: "4. Payments and Fees", body: "Platform fees are deducted from each sale. Payments are processed according to our payment schedule. You are responsible for applicable taxes on your earnings." },
//             { title: "5. Termination", body: "We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or at our discretion." },
//             { title: "6. Contact", body: "For questions, please contact us at support@junooni.com." },
//           ].map(({ title, body }) => (
//             <section key={title}>
//               <h3 className="mb-2 text-base font-semibold" style={{ color: BRAND.secondary }}>{title}</h3>
//               <p className="text-gray-600">{body}</p>
//             </section>
//           ))}
//         </div>
//         <div className="flex justify-end pt-4 mt-4 border-t">
//           <Button onClick={() => setOpenDialog(null)} style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>Close</Button>
//         </div>
//       </DialogContent>
//     </Dialog>

//     <Dialog open={openDialog === 'seller'} onOpenChange={(open) => !open && setOpenDialog(null)}>
//       <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold" style={{ color: BRAND.primary }}>Seller Policy</DialogTitle>
//           <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4 text-sm">
//           {[
//             { title: "1. Product Listings", body: "All listings must contain accurate descriptions, clear images of actual products, correct pricing, and comply with consumer protection laws." },
//             { title: "2. Prohibited Items", body: "Counterfeit products, stolen goods, weapons, illegal substances, items promoting hate or violence, and IP-infringing items are strictly prohibited." },
//             { title: "3. Order Fulfillment", body: "Ship orders within your stated processing time, provide tracking where available, package items securely, and respond to customers within 24 hours." },
//             { title: "4. Returns and Refunds", body: "Establish clear return policies complying with consumer protection laws. Accept returns for defective or misrepresented items as a minimum." },
//             { title: "5. Policy Violations", body: "Violations may result in warning notices, listing removal, account suspension, or permanent termination depending on severity." },
//             { title: "6. Support", body: "Contact seller-support@junooni.com for assistance or to appeal policy decisions." },
//           ].map(({ title, body }) => (
//             <section key={title}>
//               <h3 className="mb-2 text-base font-semibold" style={{ color: BRAND.secondary }}>{title}</h3>
//               <p className="text-gray-600">{body}</p>
//             </section>
//           ))}
//         </div>
//         <div className="flex justify-end pt-4 mt-4 border-t">
//           <Button onClick={() => setOpenDialog(null)} style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>Close</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   </div>
// );


// // ══════════════════════════════════════════════════
// //  MAIN COMPONENT
// // ══════════════════════════════════════════════════
// export default function ImprovedCreatorOnboarding() {
//   const [currentStep, setCurrentStepState] = useState("basic-info");
//   const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
//   const [animKey, setAnimKey] = useState(0);
//   const [openDialog, setOpenDialog] = useState<'terms' | 'seller' | null>(null);
//   const [termsAgreed, setTermsAgreed] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadType, setUploadType] = useState<string | null>(null);
//   const [pendingFiles, setPendingFiles] = useState({ logo: null, coverphoto: null, cancelled_checkque: null });
//   const [vendorData, setVendorData] = useState<ApiVendorResponse | null>(null);
//   const [localPayload, setLocalPayload] = useState(null);
//   const [stepCompletion, setStepCompletion] = useState({
//     "basic-info": false, "sell-type": false, "creator-profile": false
//   });
//   const [autoSaveIndicator, setAutoSaveIndicator] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const setCurrentStep = (newStep: string) => {
//     const currentIdx = STEPS.findIndex(s => s.id === currentStep);
//     const newIdx = STEPS.findIndex(s => s.id === newStep);
//     setSlideDirection(newIdx >= currentIdx ? 'forward' : 'back');
//     setAnimKey(k => k + 1);
//     setCurrentStepState(newStep);
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const stepParam = params.get('step');
//     if (stepParam && STEPS.some(s => s.id === stepParam)) setCurrentStepState(stepParam);
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) {
//       toast({ title: "Authentication Required", description: "Please sign up or log in.", variant: "destructive" });
//       navigate({ to: '/sign-up' });
//     }
//   }, [navigate]);

//   useEffect(() => {
//     let isActive = true;
//     const setupInitialState = () => {
//       const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
//       const defaultData = {
//         vendor: {
//           handle: "", name: "", logo: null, coverphoto: null,
//           youtube: null, instagram: null, xtwitter: null, facebook: null, othersocial: null,
//           phonenumber: null, GSTIN: null, gst_verification_status: "pending",
//           companyname: null, pan_number: null, city: null, pincode: null, state: null,
//           address: null, tan_number: null, bank_account_holder_name: null,
//           bank_account_number: null, bank_account_ifsc_code: null, bank_name: null,
//           bank_account_type: "Saving", cancelled_checkque: null,
//           creator_bio: null, creator_title: null, creator_category: "other",
//           sell_on_marketplace: false, sell_on_own_store: false,
//           created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
//           admins: [{ email: userEmail, first_name: '', last_name: '' }]
//         }
//       };
//       if (isActive) { setVendorData(defaultData); setIsLoading(false); }
//     };

//     const initializeOnboarding = async () => {
//       try {
//         setIsLoading(true);
//         const token = localStorage.getItem('vendorToken');
//         if (!token) { setupInitialState(); return; }
//         const { hasActorId } = checkTokenForActorId();
//         if (hasActorId) {
//           try {
//             const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
//               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
//             });
//             if (res.ok) {
//               const data = await res.json();
//               if (isActive) {
//                 setVendorData(data);
//                 setStepCompletion({
//                   "basic-info": Boolean(data.vendor.admins?.[0]?.first_name && data.vendor.admins?.[0]?.last_name),
//                   "sell-type": Boolean(data.vendor.sell_on_marketplace || data.vendor.sell_on_own_store),
//                   "creator-profile": Boolean(data.vendor.creator_bio || data.vendor.name),
//                 });
//               }
//             } else { setupInitialState(); }
//           } catch { setupInitialState(); }
//         } else { setupInitialState(); }
//         if (isActive) setIsLoading(false);
//       } catch { if (isActive) setupInitialState(); }
//     };

//     initializeOnboarding();
//     return () => { isActive = false; };
//   }, [navigate, toast]);

//   useEffect(() => {
//     if (vendorData?.vendor && (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins))) {
//       const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
//       setVendorData(prev => ({ ...prev, vendor: { ...prev.vendor, admins: [{ email: userEmail, first_name: '', last_name: '' }] } }));
//     }
//   }, [vendorData]);

//   useEffect(() => {
//     if (vendorData?.vendor) {
//       setStepCompletion({
//         "basic-info": Boolean(vendorData.vendor.admins?.[0]?.first_name && vendorData.vendor.admins?.[0]?.last_name),
//         "sell-type": Boolean(vendorData.vendor.sell_on_marketplace || vendorData.vendor.sell_on_own_store),
//         "creator-profile": Boolean(vendorData.vendor.creator_bio || vendorData.vendor.name || vendorData.vendor.creator_category),
//       });
//     }
//   }, [vendorData]);

//   const handleLocalSave = () => {
//     if (vendorData?.vendor) setLocalPayload({ ...vendorData.vendor, updated_at: new Date().toISOString() });
//   };

//   const handleServerUpdate = async () => {
//     try {
//       const token = localStorage.getItem('vendorToken');
//       if (!token || !vendorData?.vendor) return;
//       const uploadedUrls = await uploadPendingFiles();
//       const updatePayload: Record<string, any> = {};
//       const textFields = ['name', 'handle', 'phonenumber', 'youtube', 'instagram', 'xtwitter', 'facebook', 'othersocial',
//         'GSTIN', 'gst_verification_status', 'companyname', 'pan_number', 'city', 'pincode', 'state',
//         'address', 'tan_number', 'bank_account_holder_name', 'bank_account_number',
//         'bank_account_ifsc_code', 'bank_name', 'bank_account_type', 'creator_bio', 'creator_title', 'creator_category'];
//       textFields.forEach(f => { const v = vendorData.vendor[f]; if (v && !String(v).startsWith('data:')) updatePayload[f] = v; });
//       const admin = vendorData.vendor.admins?.[0];
//       if (admin) updatePayload.admins = { email: admin.email, first_name: admin.first_name || '', last_name: admin.last_name || '' };
//       if (uploadedUrls.logo) updatePayload.logo = uploadedUrls.logo;
//       if (uploadedUrls.coverphoto) updatePayload.coverphoto = uploadedUrls.coverphoto;
//       if (uploadedUrls.cancelled_checkque) updatePayload.cancelled_checkque = uploadedUrls.cancelled_checkque;
//       ['logo', 'coverphoto', 'cancelled_checkque'].forEach(f => {
//         if (!uploadedUrls[f] && vendorData.vendor[f] && !vendorData.vendor[f].startsWith('data:')) updatePayload[f] = vendorData.vendor[f];
//       });
//       updatePayload.sell_on_marketplace = vendorData.vendor.sell_on_marketplace;
//       updatePayload.sell_on_own_store = vendorData.vendor.sell_on_own_store;
//       const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
//         method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify(updatePayload)
//       });
//       if (res.ok) {
//         const d = await res.json();
//         if (d.vendor) setVendorData(prev => ({ ...prev, vendor: { ...prev.vendor, ...d.vendor } }));
//       }
//     } catch {}
//   };

//   const handleContinue = async () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     try {
//       if (currentStep === "basic-info" && (!vendorData?.vendor?.admins?.[0]?.first_name || !vendorData?.vendor?.admins?.[0]?.last_name)) {
//         toast({ title: "Name is required", description: "Please enter your first and last name.", variant: "destructive" }); return;
//       }
//       if (currentStep === "sell-type" && !vendorData?.vendor?.sell_on_marketplace && !vendorData?.vendor?.sell_on_own_store) {
//         toast({ title: "Please select a store type", description: "Pick at least one option to continue.", variant: "destructive" }); return;
//       }
//       if (currentStep === "creator-profile") {
//         const { hasActorId } = checkTokenForActorId();
//         if (hasActorId) await handleServerUpdate(); else handleLocalSave();
//         await handleFinalSubmission(); return;
//       }
//       const { hasActorId } = checkTokenForActorId();
//       if (hasActorId) await handleServerUpdate(); else handleLocalSave();
//       const idx = STEPS.findIndex(s => s.id === currentStep);
//       if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
//     } catch {
//       toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
//     }
//   };

//   const handleSaveAndExit = async () => {
//     try {
//       const token = localStorage.getItem('vendorToken');
//       if (!token) { toast({ title: "Authentication Required", variant: "destructive" }); return; }
//       setAutoSaveIndicator("Saving...");
//       const { hasActorId } = checkTokenForActorId();
//       if (hasActorId) {
//         await handleServerUpdate();
//         toast({ title: "Profile saved!", description: "Taking you to your dashboard..." });
//         setTimeout(() => { setAutoSaveIndicator(""); navigate({ to: '/dashboard' }); }, 1500);
//       } else {
//         await handleCreateNewVendor();
//         toast({ title: "Profile created!", description: "Taking you to sign in..." });
//         setTimeout(() => { setAutoSaveIndicator(""); navigate({ to: '/sign-in' }); }, 1500);
//       }
//     } catch (error) {
//       toast({ title: "Save failed", description: error.message || "Please try again.", variant: "destructive" });
//       setAutoSaveIndicator("");
//     }
//   };

//   const handleCreateNewVendor = async () => {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) throw new Error('Authentication token not found');
//     const uploadedUrls = await uploadPendingFiles();
//     const finalData = localPayload || vendorData.vendor;
//     const payload = {
//       name: finalData.name || 'New Vendor', handle: finalData.handle || 'new-vendor-handle',
//       phonenumber: finalData.phonenumber || '', logo: uploadedUrls.logo || '',
//       coverphoto: uploadedUrls.coverphoto || '', cancelled_checkque: uploadedUrls.cancelled_checkque || '',
//       admin: { email: finalData.admins?.[0]?.email || localStorage.getItem('vendorEmail') || 'vendor@example.com',
//         first_name: finalData.admins?.[0]?.first_name || '', last_name: finalData.admins?.[0]?.last_name || '' }
//     };
//     const textFields = ['youtube', 'instagram', 'xtwitter', 'facebook', 'GSTIN', 'companyname', 'pan_number',
//       'city', 'pincode', 'state', 'address', 'bank_name', 'bank_account_holder_name',
//       'bank_account_number', 'bank_account_ifsc_code', 'bank_account_type', 'creator_bio', 'creator_title', 'creator_category'];
//     textFields.forEach(f => { if (finalData[f] && !finalData[f].startsWith('data:')) payload[f] = finalData[f]; });
//     const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors`, {
//       method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//       body: JSON.stringify(payload)
//     });
//     if (!res.ok) throw new Error(`Failed to create vendor: ${res.status}`);
//     const d = await res.json();
//     if (d.vendor) { setVendorData(d); setLocalPayload(null); setPendingFiles({ logo: null, coverphoto: null, cancelled_checkque: null }); }
//   };

//   const handleFinalSubmission = async () => {
//     const { hasActorId } = checkTokenForActorId();
//     if (hasActorId) {
//       await handleServerUpdate();
//       toast({ title: "🎉 You're live on JUNOONI!", description: "Welcome to the creator family!" });
//       setTimeout(() => navigate({ to: '/dashboard' }), 1000);
//     } else {
//       await handleCreateNewVendor();
//       toast({ title: "🎉 Profile created!", description: "Your creator store is ready!" });
//       setTimeout(() => navigate({ to: '/sign-in' }), 1000);
//     }
//   };

//   const handleFileUpload = async (file: File, fileType: 'logo' | 'coverphoto' | 'cancelled_checkque') => {
//     if (!file) return;
//     try {
//       if (!file.type.startsWith('image/') && fileType !== 'cancelled_checkque') throw new Error('Please select a valid image file');
//       if (file.size > 10 * 1024 * 1024) throw new Error('File size must be less than 10MB');
//       setPendingFiles(prev => ({ ...prev, [fileType]: file }));
//       const reader = new FileReader();
//       reader.onload = (e) => { updateVendorData(fileType, e.target?.result as string); toast({ title: "Photo selected!", description: "It will upload when you save." }); };
//       reader.onerror = () => { throw new Error(`Failed to read ${fileType} file`); };
//       reader.readAsDataURL(file);
//     } catch (error) { toast({ title: "File error", description: error.message, variant: "destructive" }); }
//   };

//   const uploadPendingFiles = async () => {
//     const token = localStorage.getItem('vendorToken');
//     if (!token) throw new Error('Authentication token not found');
//     const uploaded: Record<string, string> = {};
//     const toUpload = Object.entries(pendingFiles).filter(([, f]) => f instanceof File);
//     if (!toUpload.length) return uploaded;
//     for (const [fileType, file] of toUpload) {
//       try {
//         const form = new FormData();
//         form.append('files', file);
//         const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/uploads`, {
//           method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: form
//         });
//         if (!res.ok) continue;
//         const data = await res.json();
//         const url = data.files?.[0]?.url || data.files?.[0]?.path || data.url || data.file_url ||
//           (data.path ? (data.path.startsWith('http') ? data.path : `${import.meta.env.VITE_MEDUSA_BACKEND_URL}${data.path}`) : null);
//         if (url) uploaded[fileType] = url;
//       } catch (e) { toast({ title: "Upload failed", description: `Failed to upload ${fileType}: ${e.message}`, variant: "destructive" }); }
//     }
//     return uploaded;
//   };

//   const updateVendorData = (field: keyof VendorData, value: any) => {
//     if (vendorData?.vendor) {
//       setVendorData({ ...vendorData, vendor: { ...vendorData.vendor, [field]: value, updated_at: new Date().toISOString() } });
//     }
//   };

//   const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-white">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
//           <p className="text-sm text-gray-500">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50" style={{ color: BRAND.textPrimary }}>

//       {/* ── Header ── */}
//       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-6xl px-4 py-3 mx-auto">
//           <div className="flex items-center justify-between">
//             <Link to="/dashboard"><img src={JunooniLogo} alt="Junooni Logo" className="h-8" /></Link>
//             <div className="flex items-center gap-2">
//               {autoSaveIndicator && <span className="text-xs font-medium text-green-500">{autoSaveIndicator}</span>}
//               <Button variant="ghost" size="sm" onClick={handleSaveAndExit} className="text-xs text-gray-500 hover:text-gray-700">
//                 <IconLogout className="w-3.5 h-3.5 mr-1" />Save & Exit
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Horizontal Step Tracker ── */}
//       <div className="bg-white border-b border-gray-100">
//         <div className="max-w-3xl px-4 py-3 mx-auto">
//           <div className="flex items-center justify-center gap-1">
//             {STEPS.map((step, index) => {
//               const isCompleted = stepCompletion[step.id];
//               const isCurrent = currentStep === step.id;
//               return (
//                 <div key={step.id} className="flex items-center">
//                   <button
//                     onClick={() => { setCurrentStep(step.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
//                     className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-medium",
//                       isCurrent ? "bg-orange-50 text-orange-700" : isCompleted ? "text-gray-500 hover:bg-gray-50" : "text-gray-400 hover:bg-gray-50")}>
//                     <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold rounded-lg"
//                       style={isCompleted ? { background: `${BRAND.success}22`, color: BRAND.success } : isCurrent ? { background: `${BRAND.primary}15`, color: BRAND.primary } : { background: '#f3f4f6', color: '#9ca3af' }}>
//                       {isCompleted ? <IconCircleCheck className="w-3.5 h-3.5" /> : <span>{index + 1}</span>}
//                     </div>
//                     <span className="hidden sm:inline whitespace-nowrap">{step.title}</span>
//                   </button>
//                   {index < STEPS.length - 1 && (
//                     <div className="w-6 h-px mx-1 transition-all rounded-full" style={{ background: isCompleted ? BRAND.success : '#e5e7eb' }} />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ── Page body ── */}
//       <div className="max-w-5xl px-4 py-8 mx-auto">
//         <div className="mb-6">
//           {/* <div className="flex items-center gap-2 mb-1">
//             <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
//               Step {currentStepIndex + 1} of {STEPS.length}
//             </span>
//             {STEPS.find(s => s.id === currentStep)?.estimatedTime && (
//               <span className="text-xs text-gray-400">· {STEPS.find(s => s.id === currentStep)?.estimatedTime}</span>
//             )}
//           </div> */}
//           <h1 className="text-2xl font-bold text-gray-900">{STEPS.find(s => s.id === currentStep)?.title}</h1>
//           <p className="mt-1 text-sm text-gray-500">{STEPS.find(s => s.id === currentStep)?.description}</p>
//         </div>

//         <div className="flex items-start gap-6">

//           {/* ── Form with slide animation ── */}
//           <div className="flex-1 min-w-0 overflow-hidden">
//             <div className="p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//               <AnimatedStep key={animKey} direction={slideDirection}>
//                 {currentStep === "basic-info" && (
//                   <StepBasicInfo vendorData={vendorData} updateVendorData={updateVendorData} setVendorData={setVendorData} brandColors={BRAND} />
//                 )}
//                 {currentStep === "sell-type" && (
//                   <StepSellType vendorData={vendorData} updateVendorData={updateVendorData} />
//                 )}
//                 {currentStep === "creator-profile" && (
//                   <StepCreatorProfile vendorData={vendorData} updateVendorData={updateVendorData}
//                     handleFileUpload={handleFileUpload} isUploading={isUploading} uploadType={uploadType} brandColors={BRAND} />
//                 )}

//               </AnimatedStep>
//             </div>

//             {/* Footer nav */}
//             <div className="flex items-center justify-between mt-6">
//               <Button variant="ghost" className="text-sm text-gray-400 hover:text-gray-600"
//                 onClick={() => { const i = STEPS.findIndex(s => s.id === currentStep); if (i > 0) setCurrentStep(STEPS[i - 1].id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
//                 ← Back
//               </Button>
//               <div className="flex items-center gap-3">
//                 {STEPS.find(s => s.id === currentStep)?.isSkippable && (
//                   <Button variant="ghost" className="text-sm text-gray-400 hover:text-gray-600"
//                     onClick={() => { const i = STEPS.findIndex(s => s.id === currentStep); if (i < STEPS.length - 1) setCurrentStep(STEPS[i + 1].id); }}>
//                     Skip for now
//                   </Button>
//                 )}
//                 <Button onClick={handleContinue}
//                   className="px-8 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm"
//                   style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>
//                   {currentStep === "creator-profile" ? "🚀 Launch My Store" : "Continue →"}
//                 </Button>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 px-4 py-3 mt-6 bg-white border border-gray-100 rounded-xl">
//                 <IconHelpCircle className="flex-shrink-0 w-4 h-4 text-gray-400" />
//                 <p className="flex-1 text-xs text-gray-500">Need help with this step?</p>
//                 <Button onClick={() => { if (window.$chatwoot?.toggle) window.$chatwoot.toggle(); }}
//                   variant="ghost" size="sm" className="px-3 text-xs h-7" style={{ color: BRAND.primary }}>
//                   Chat with us
//                 </Button>
//               </div>
//           </div>

//           {/* ── Live Preview (xl only, step 3 + marketplace only) ── */}
//           {currentStep === "creator-profile" && vendorData?.vendor?.sell_on_marketplace && (
//             <div className="hidden xl:block w-64 shrink-0 self-start sticky top-[100px]">
//               <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//                 <div className="px-4 py-3 border-b border-gray-50">
//                   <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Live Preview</p>
//                 </div>
//                 <div className="relative h-28 bg-gradient-to-r from-gray-100 to-gray-200">
//                   {vendorData?.vendor?.coverphoto
//                     ? <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
//                     : <div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-gray-400">Cover photo</p></div>}
//                   <div className="absolute -bottom-6 left-4">
//                     <div className="w-12 h-12 overflow-hidden bg-white border-2 border-white shadow-md rounded-xl">
//                       {vendorData?.vendor?.logo
//                         ? <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
//                         : <div className="flex items-center justify-center w-full h-full bg-gray-100"><IconUser className="w-6 h-6 text-gray-300" /></div>}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="px-4 pt-8 pb-4">
//                   <p className="text-sm font-bold text-gray-900 truncate">{vendorData?.vendor?.name || 'Your Brand'}</p>
//                   {vendorData?.vendor?.creator_title && (
//                     <p className="text-xs mt-0.5 truncate font-medium" style={{ color: BRAND.primary }}>{vendorData.vendor.creator_title}</p>
//                   )}
//                   {vendorData?.vendor?.creator_bio
//                     ? <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-3">{vendorData.vendor.creator_bio}</p>
//                     : <p className="mt-2 text-xs italic text-gray-300">Your bio will appear here...</p>}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="py-5 mt-8 border-t border-gray-100">
//         <p className="text-xs text-center text-gray-400">&copy; {new Date().getFullYear()} JUNOONI. All rights reserved.</p>
//       </div>

//       <ChatwootWidget />

//       <style>{`
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateX(56px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//         @keyframes slideInLeft {
//           from { opacity: 0; transform: translateX(-56px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//       `}</style>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import VendorHandleInput from "./VendorHandleInput";
import { useNavigate } from "@tanstack/react-router";
import ChatwootWidget from '@/components/ChatwootWidget'
import JunooniLogo from '../../../../assets/junooni_logo_brand_color.png'
import { Link } from "@tanstack/react-router";
import { IconShoppingBag, IconWorld } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  IconCircleCheck, IconAlertCircle, IconUser,
  IconFileText, IconCheckbox, IconChevronRight, IconHelpCircle,
  IconX, IconLogout,
  IconCamera, IconBrandInstagram, IconBrandYoutube, IconBrandTwitter, IconBrandFacebook,
  IconPhone, IconSparkles, IconCheck
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";


interface ApiVendorResponse {
  vendor: VendorData;
}

interface VendorData {
  id: string;
  handle: string;
  name: string;
  logo: string | null;
  coverphoto: string | null;
  youtube: string | null;
  instagram: string | null;
  xtwitter: string | null;
  facebook: string | null;
  othersocial: string | null;
  phonenumber: string | null;
  GSTIN: string | null;
  gst_verification_status: "pending" | "verified" | "failed";
  companyname: string | null;
  pan_number: string | null;
  city: string | null;
  pincode: string | null;
  state: string | null;
  address: string | null;
  tan_number: string | null;
  bank_account_holder_name: string | null;
  bank_account_number: string | null;
  bank_account_ifsc_code: string | null;
  bank_name: string | null;
  bank_account_type: "Saving" | "Current";
  cancelled_checkque: string | null;
  creator_bio: string | null;
  creator_title: string | null;
  creator_category: string | null;
  sell_on_marketplace: boolean;
  sell_on_own_store: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  admins: {
    email: string,
    first_name: string,
    last_name: string
  }[]
}

const STEPS = [
  {
    id: "basic-info",
    title: "Your identity",
    description: "Name, handle & contact",
    icon: IconUser,
    isSkippable: false,
    estimatedTime: "2 min",
  },
  // {
  //   id: "sell-type",
  //   title: "Where to sell",
  //   description: "Pick your storefront",
  //   icon: IconShoppingBag,
  //   isSkippable: false,
  //   estimatedTime: "1 min",
  // },
  {
    id: "creator-profile",
    title: "Your profile",
    description: "Brand details & bio",
    icon: IconFileText,
    isSkippable: true,
    estimatedTime: "2 min",
  },
];

const BRAND = {
  primary: "#e65100",
  secondary: "#ac1900",
  accent: "#581845",
  light: "#FFC300",
  background: "#FFEFD5",
  success: "#e65100",
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textLight: "#999999"
};

const checkTokenForActorId = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return { hasActorId: false, actorId: null };
    const payload = JSON.parse(atob(token.split('.')[1]));
    //const actorId = payload.actor_id || payload.sub || payload.id;
    const actorId = payload.actor_id ?? null;
    return { hasActorId: !!actorId, actorId };
  } catch {
    return { hasActorId: false, actorId: null };
  }
};

const getEmailFromToken = (): string => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || payload.app_metadata?.email || payload.entity_id || '';
  } catch {
    return '';
  }
};

const inputClass = "w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400";

const Field = ({ label, hint, required = false, error = '', children }: {
  label: any; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <label className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
    {error && <p className="flex items-center gap-1 text-xs text-red-500"><IconAlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// ── Social links collapsible ──
const SocialLinksSection = ({ vendorData, updateVendorData, brandColors }) => {
  const [open, setOpen] = useState(false);
  const hasSocial = vendorData.vendor.instagram || vendorData.vendor.youtube || vendorData.vendor.xtwitter || vendorData.vendor.facebook;

  return (
    <div className="overflow-hidden border border-gray-100 rounded-2xl">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 transition-colors bg-gray-50 hover:bg-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[IconBrandInstagram, IconBrandYoutube, IconBrandTwitter].map((Icon, i) => (
              <div key={i} className="flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-md">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700">Social Media Links</p>
            <p className="text-xs text-gray-400">{hasSocial ? 'Some accounts connected' : 'Optional — helps fans find you'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasSocial && <span className="w-2 h-2 bg-green-400 rounded-full" />}
          <IconChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-90")} />
        </div>
      </button>
      {open && (
        <div className="p-5 space-y-4 bg-white">
          {[
            { label: "Instagram", field: "instagram", icon: IconBrandInstagram, prefix: "instagram.com/", placeholder: "yourbrand", color: "#E1306C" },
            { label: "YouTube", field: "youtube", icon: IconBrandYoutube, prefix: "youtube.com/", placeholder: "@yourchannel", color: "#FF0000" },
            { label: "Twitter / X", field: "xtwitter", icon: IconBrandTwitter, prefix: "twitter.com/", placeholder: "@yourhandle", color: "#1DA1F2" },
            { label: "Facebook", field: "facebook", icon: IconBrandFacebook, prefix: "facebook.com/", placeholder: "@yourhandle", color: "#1877F2" },
          ].map(({ label, field, icon: Icon, prefix, placeholder, color }) => (
            <div key={field}>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
              </label>
              <div className="flex overflow-hidden border border-gray-200 rounded-xl bg-gray-50">
                <span className="flex items-center flex-shrink-0 px-3 text-xs text-gray-400 border-r border-gray-200 whitespace-nowrap bg-gray-50">{prefix}</span>
                <input type="text" value={vendorData.vendor[field] || ''} onChange={(e) => updateVendorData(field, e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder:text-gray-300" placeholder={placeholder} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Animated step wrapper ──
const AnimatedStep = ({ children, direction }: { children: React.ReactNode; direction: 'forward' | 'back' }) => (
  <div style={{ animation: direction === 'forward' ? 'slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) both' : 'slideInLeft 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
    {children}
  </div>
);

// ── STEP 1: Basic Info ──
const StepBasicInfo = ({ vendorData, updateVendorData, setVendorData, brandColors }) => (
  <div className="space-y-5">
    <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
          <IconUser className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
        </div>
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Your name</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required error={!vendorData.vendor.admins?.[0]?.first_name ? "Required" : ""}>
          <input type="text" value={vendorData.vendor.admins?.[0]?.first_name || ''}
            onChange={(e) => {
              const updated = { ...vendorData };
              if (!updated.vendor.admins?.length) updated.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
              updated.vendor.admins[0].first_name = e.target.value;
              setVendorData(updated);
            }}
            className={inputClass} placeholder="Priya" />
        </Field>
        <Field label="Last Name" required error={!vendorData.vendor.admins?.[0]?.last_name ? "Required" : ""}>
          <input type="text" value={vendorData.vendor.admins?.[0]?.last_name || ''}
            onChange={(e) => {
              const updated = { ...vendorData };
              if (!updated.vendor.admins?.length) updated.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
              updated.vendor.admins[0].last_name = e.target.value;
              setVendorData(updated);
            }}
            className={inputClass} placeholder="Sharma" />
        </Field>
      </div>
    </div>

    <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
          <IconSparkles className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
        </div>
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Handle & contact</span>
      </div>
      <VendorHandleInput vendorData={vendorData} updateVendorData={updateVendorData} brandColors={brandColors} />
      <Field label="Phone Number" hint="Optional — for support only">
        <div className="flex">
          <span className="flex items-center flex-shrink-0 px-3 text-sm text-gray-500 bg-white border border-r-0 border-gray-200 rounded-l-xl">
            <IconPhone className="w-4 h-4" />
          </span>
          <input type="tel" value={vendorData.vendor.phonenumber || ''} onChange={(e) => updateVendorData('phonenumber', e.target.value)}
            className="w-full px-4 py-3 text-sm transition-all bg-white border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 placeholder:text-gray-400"
            placeholder="+91 98765 43210" />
        </div>
      </Field>
    </div>
  </div>
);

// ── STEP 2: Sell Type ──
const StepSellType = ({ vendorData, updateVendorData }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Choose where your merch will appear. Pick one or both.</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      {/* Marketplace */}
      <button type="button" onClick={() => updateVendorData('sell_on_marketplace', !vendorData.vendor.sell_on_marketplace)}
        className={cn("relative text-left p-6 rounded-2xl border-2 transition-all duration-200",
          vendorData.vendor.sell_on_marketplace ? "border-orange-400 bg-orange-50/70 shadow-md" : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm")}>
        <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          vendorData.vendor.sell_on_marketplace ? "bg-[#e65100] border-[#e65100]" : "border-gray-300 bg-white")}>
          {vendorData.vendor.sell_on_marketplace && <IconCheck className="w-3 h-3 text-white" />}
        </div>
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl" style={{ background: "#fff0e8" }}>
          <IconShoppingBag style={{ color: BRAND.primary, width: 22, height: 22 }} />
        </div>
        <p className="mb-1 text-base font-bold text-gray-900 pr-7">JUNOONI Marketplace</p>
        <p className="mb-4 text-xs leading-relaxed text-gray-500">Your merch on junooni.com alongside other creators. Zero setup needed.</p>
        <div className="pt-3 space-y-2 border-t border-orange-100">
          {["Instant go-live", "Built-in fan discovery", "Zero extra setup"].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-4 h-4 rounded-full shrink-0" style={{ background: `${BRAND.primary}18` }}>
                <IconCheck className="w-2.5 h-2.5" style={{ color: BRAND.primary }} />
              </div>
              <span className="text-xs text-gray-600">{f}</span>
            </div>
          ))}
        </div>
      </button>

      {/* Own store */}
      <button type="button" onClick={() => updateVendorData('sell_on_own_store', !vendorData.vendor.sell_on_own_store)}
        className={cn("relative text-left p-6 rounded-2xl border-2 transition-all duration-200",
          vendorData.vendor.sell_on_own_store ? "border-emerald-400 bg-emerald-50/70 shadow-md" : "border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm")}>
        <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          vendorData.vendor.sell_on_own_store ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white")}>
          {vendorData.vendor.sell_on_own_store && <IconCheck className="w-3 h-3 text-white" />}
        </div>
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl" style={{ background: "#e8f5e9" }}>
          <IconWorld className="text-emerald-600" style={{ width: 22, height: 22 }} />
        </div>
        <p className="mb-1 text-base font-bold text-gray-900 pr-7">Your Own Store</p>
        <p className="mb-4 text-xs leading-relaxed text-gray-500">Sell from your own branded domain. We handle everything invisibly.</p>
        <div className="pt-3 space-y-2 border-t border-emerald-100">
          {["Custom domain", "100% your branding", "Full page builder"].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 shrink-0">
                <IconCheck className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-600">{f}</span>
            </div>
          ))}
        </div>
      </button>
    </div>

    {vendorData.vendor.sell_on_marketplace && vendorData.vendor.sell_on_own_store && (
      <div className="px-4 py-3 text-xs font-medium border rounded-xl text-amber-800 bg-amber-50 border-amber-100">
        🎯 Both selected — merch will appear on junooni.com AND your branded storefront simultaneously.
      </div>
    )}
    {vendorData.vendor.sell_on_own_store && !vendorData.vendor.sell_on_marketplace && (
      <div className="px-4 py-3 text-xs text-blue-700 border border-blue-100 rounded-xl bg-blue-50">
        🔧 Our team will help configure your domain and branded theme after you confirm.
      </div>
    )}
    {!vendorData.vendor.sell_on_marketplace && !vendorData.vendor.sell_on_own_store && (
      <div className="px-4 py-3 text-xs text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
        👆 Select at least one option to continue.
      </div>
    )}
  </div>
);

// ── STEP 3: Creator Profile (conditional) ──
const StepCreatorProfile = ({ vendorData, updateVendorData, handleFileUpload, isUploading, uploadType, brandColors }) => {
  const isMarketplace = vendorData.vendor.sell_on_marketplace;

  return (
    <div className="space-y-5">
      {/* Brand name + photos — marketplace only */}
      {isMarketplace && (
        <div className="p-5 space-y-4 border border-gray-100 rounded-2xl bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
              <IconSparkles className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
            </div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Brand</span>
          </div>
          <Field label="Brand Name" required hint="What customers will see" error={!vendorData.vendor.name ? "Required" : ""}>
            <input type="text" value={vendorData.vendor.name || ''} onChange={(e) => updateVendorData('name', e.target.value)}
              className={inputClass} placeholder="e.g. Priya's Art Studio" />
          </Field>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <p className="mb-2 text-xs font-medium text-center text-gray-600">Profile pic</p>
              <div className="relative w-20 h-20 overflow-hidden transition-all border-2 border-dashed cursor-pointer rounded-2xl group hover:border-orange-400"
                style={{ borderColor: vendorData.vendor.logo ? brandColors.success : '#e5e7eb' }}
                onClick={() => document.getElementById('logo-upload').click()}>
                {vendorData.vendor.logo ? (
                  <>
                    <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center transition-all opacity-0 bg-black/40 group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">Change</span>
                    </div>
                    <button className="absolute flex items-center justify-center w-5 h-5 transition-all bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); updateVendorData('logo', null); }}>
                      <IconX className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-white">
                    <IconCamera className="w-5 h-5 mb-1 text-gray-300" />
                    <span className="text-xs text-gray-400">Upload</span>
                  </div>
                )}
                <input id="logo-upload" type="file" accept="image/*" disabled={isUploading && uploadType === 'logo'} className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'logo'); e.target.value = ''; }} />
              </div>
              <p className="mt-1 text-xs text-center text-gray-400">400×400px</p>
            </div>
            <div className="flex-1">
              <p className="mb-2 text-xs font-medium text-gray-600">Cover Photo</p>
              <div className="relative h-20 overflow-hidden transition-all border-2 border-dashed cursor-pointer rounded-2xl group hover:border-orange-400"
                style={{ borderColor: vendorData.vendor.coverphoto ? brandColors.success : '#e5e7eb' }}
                onClick={() => document.getElementById('cover-upload').click()}>
                {vendorData.vendor.coverphoto ? (
                  <>
                    <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center transition-all opacity-0 bg-black/40 group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">Change</span>
                    </div>
                    <button className="absolute flex items-center justify-center w-5 h-5 transition-all bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); updateVendorData('coverphoto', null); }}>
                      <IconX className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-white">
                    <IconCamera className="w-4 h-4 mb-1 text-gray-300" />
                    <span className="text-xs text-gray-400">Click to upload a cover photo</span>
                    <span className="text-xs text-gray-300 mt-0.5">1200×400px</span>
                  </div>
                )}
                <input id="cover-upload" type="file" accept="image/jpeg,image/png" disabled={isUploading && uploadType === 'coverphoto'} className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'coverphoto'); e.target.value = ''; }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social links — both types */}
      <SocialLinksSection vendorData={vendorData} updateVendorData={updateVendorData} brandColors={brandColors} />

      {/* Creator info — both types */}
      <div className="p-5 space-y-5 border border-gray-100 rounded-2xl bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${brandColors.primary}18` }}>
            <IconFileText className="w-3.5 h-3.5" style={{ color: brandColors.primary }} />
          </div>
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">About you</span>
          <span className="ml-1 text-xs text-gray-400">(all optional)</span>
        </div>

        <Field label="What do you create" hint="Keep it short — one line">
          <input type="text" value={vendorData.vendor.creator_title || ''} onChange={(e) => updateVendorData('creator_title', e.target.value)}
            className={inputClass} placeholder="e.g. Bollywood music producer & composer" maxLength={60} />
        </Field>

        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "Music", emoji: "🎵" }, { value: "Cinema", emoji: "🎬" }, { value: "Art", emoji: "🎨" },
              { value: "Fashion", emoji: "👗" }, { value: "Sports", emoji: "⚽" }, { value: "Comedy", emoji: "😄" },
              { value: "Gaming", emoji: "🎮" }, { value: "Influencer", emoji: "✨" }, { value: "other", emoji: "🌟" },
            ].map(({ value, emoji }) => (
              <button key={value} type="button" onClick={() => updateVendorData('creator_category', value)}
                className={cn("flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all",
                  vendorData.vendor.creator_category === value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50")}>
                <span className="mb-1 text-lg">{emoji}</span>
                <span>{value === "other" ? "Other" : value}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Your Bio" hint={`${vendorData.vendor.creator_bio?.length || 0}/500`}>
          <textarea value={vendorData.vendor.creator_bio || ''} onChange={(e) => updateVendorData('creator_bio', e.target.value)}
            rows={4} maxLength={500} className={`${inputClass} resize-none`}
            placeholder="Tell fans what you do, what you've created, and why they should follow you." />
          <p className="text-xs text-gray-400">💡 2–3 sentences is enough. Mention your best work.</p>
        </Field>
      </div>
    </div>
  );
};

// ── STEP 4: Final Review ──
const StepFinalReview = ({ vendorData, stepCompletion, setCurrentStep, termsAgreed, setTermsAgreed, openDialog, setOpenDialog }) => (
  <div className="space-y-5">
    <div className="p-5 text-center rounded-2xl"
      style={{ background: `linear-gradient(135deg, ${BRAND.primary}08 0%, ${BRAND.light}12 100%)`, border: `1px solid ${BRAND.primary}18` }}>
      <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full" style={{ background: `${BRAND.success}18` }}>
        <IconCheck className="w-6 h-6" style={{ color: BRAND.success }} />
      </div>
      <h3 className="mb-1 font-bold text-gray-800">Almost there!</h3>
      <p className="text-sm text-gray-500">Review your details, then launch your store.</p>
    </div>

    <div className="space-y-3">
      {STEPS.filter(s => s.id !== "final-review").map((step) => {
        const isCompleted = stepCompletion[step.id];
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg w-7 h-7"
                  style={{ background: isCompleted ? `${BRAND.success}18` : `${BRAND.error}12` }}>
                  {isCompleted
                    ? <IconCircleCheck className="w-4 h-4" style={{ color: BRAND.success }} />
                    : <StepIcon className="w-4 h-4" style={{ color: BRAND.error }} />}
                </div>
                <span className="text-sm font-semibold text-gray-800">{step.title}</span>
                {!isCompleted && step.isSkippable && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg">Optional</span>}
                {!isCompleted && !step.isSkippable && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-lg">Incomplete</span>}
              </div>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: BRAND.primary }} onClick={() => setCurrentStep(step.id)}>
                {isCompleted ? 'Edit' : 'Fill in →'}
              </button>
            </div>
            <div className="px-4 py-3 text-sm">
              {step.id === "basic-info" && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <div><span className="text-xs text-gray-400">Name</span><p className="font-medium text-gray-800">{vendorData.vendor.admins?.[0]?.first_name ? `${vendorData.vendor.admins[0].first_name} ${vendorData.vendor.admins[0].last_name}` : '—'}</p></div>
                  <div><span className="text-xs text-gray-400">Phone</span><p className="font-medium text-gray-800">{vendorData.vendor.phonenumber || '—'}</p></div>
                </div>
              )}
              {step.id === "sell-type" && (
                <div className="flex gap-2">
                  {vendorData.vendor.sell_on_marketplace && <span className="px-2 py-1 text-xs font-medium text-orange-700 border border-orange-100 rounded-lg bg-orange-50">JUNOONI Marketplace</span>}
                  {vendorData.vendor.sell_on_own_store && <span className="px-2 py-1 text-xs font-medium border rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100">Own Store</span>}
                  {!vendorData.vendor.sell_on_marketplace && !vendorData.vendor.sell_on_own_store && <span className="text-xs text-gray-400">—</span>}
                </div>
              )}
              {step.id === "creator-profile" && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <div><span className="text-xs text-gray-400">Brand</span><p className="font-medium text-gray-800 truncate">{vendorData.vendor.name || '—'}</p></div>
                  <div><span className="text-xs text-gray-400">Category</span><p className="font-medium text-gray-800">{vendorData.vendor.creator_category || '—'}</p></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative flex-shrink-0 mt-0.5">
          <input type="checkbox" className="sr-only peer" checked={termsAgreed} onChange={() => setTermsAgreed(!termsAgreed)} />
          <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            termsAgreed ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white")}>
            {termsAgreed && <IconCheck className="w-3 h-3 text-white" />}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">Everything looks good — let's go!</p>
          <p className="text-xs text-gray-400 mt-0.5">
            By submitting you agree to our{' '}
            <button type="button" className="font-medium underline" style={{ color: BRAND.primary }}
              onClick={(e) => { e.preventDefault(); setOpenDialog('terms'); }}>Terms</button>
            {' '}and{' '}
            <button type="button" className="font-medium underline" style={{ color: BRAND.primary }}
              onClick={(e) => { e.preventDefault(); setOpenDialog('seller'); }}>Seller Policy</button>.
          </p>
        </div>
      </label>
    </div>

    <Dialog open={openDialog === 'terms'} onOpenChange={(open) => !open && setOpenDialog(null)}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: BRAND.primary }}>Terms of Service</DialogTitle>
          <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {[
            { title: "1. Acceptance of Terms", body: "By accessing and using Junooni's creator platform, you accept and agree to be bound by the terms and provision of this agreement." },
            { title: "2. Creator Responsibilities", body: "As a creator, you are responsible for the accuracy and legality of your product listings, fulfilling orders in a timely manner, providing excellent customer service, and complying with all applicable laws." },
            { title: "3. Intellectual Property", body: "You retain all rights to your intellectual property. By listing products on JUNOONI, you grant us a limited license to display, promote, and sell your products through our platform." },
            { title: "4. Payments and Fees", body: "Platform fees are deducted from each sale. Payments are processed according to our payment schedule. You are responsible for applicable taxes on your earnings." },
            { title: "5. Termination", body: "We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or at our discretion." },
            { title: "6. Contact", body: "For questions, please contact us at support@junooni.com." },
          ].map(({ title, body }) => (
            <section key={title}>
              <h3 className="mb-2 text-base font-semibold" style={{ color: BRAND.secondary }}>{title}</h3>
              <p className="text-gray-600">{body}</p>
            </section>
          ))}
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t">
          <Button onClick={() => setOpenDialog(null)} style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={openDialog === 'seller'} onOpenChange={(open) => !open && setOpenDialog(null)}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: BRAND.primary }}>Seller Policy</DialogTitle>
          <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {[
            { title: "1. Product Listings", body: "All listings must contain accurate descriptions, clear images of actual products, correct pricing, and comply with consumer protection laws." },
            { title: "2. Prohibited Items", body: "Counterfeit products, stolen goods, weapons, illegal substances, items promoting hate or violence, and IP-infringing items are strictly prohibited." },
            { title: "3. Order Fulfillment", body: "Ship orders within your stated processing time, provide tracking where available, package items securely, and respond to customers within 24 hours." },
            { title: "4. Returns and Refunds", body: "Establish clear return policies complying with consumer protection laws. Accept returns for defective or misrepresented items as a minimum." },
            { title: "5. Policy Violations", body: "Violations may result in warning notices, listing removal, account suspension, or permanent termination depending on severity." },
            { title: "6. Support", body: "Contact seller-support@junooni.com for assistance or to appeal policy decisions." },
          ].map(({ title, body }) => (
            <section key={title}>
              <h3 className="mb-2 text-base font-semibold" style={{ color: BRAND.secondary }}>{title}</h3>
              <p className="text-gray-600">{body}</p>
            </section>
          ))}
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t">
          <Button onClick={() => setOpenDialog(null)} style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);


// ══════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════
export default function ImprovedCreatorOnboarding() {
  const [currentStep, setCurrentStepState] = useState("basic-info");
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [openDialog, setOpenDialog] = useState<'terms' | 'seller' | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState({ logo: null, coverphoto: null, cancelled_checkque: null });
  const [vendorData, setVendorData] = useState<ApiVendorResponse | null>(null);
  const [localPayload, setLocalPayload] = useState(null);
  const [stepCompletion, setStepCompletion] = useState({
    "basic-info": false, "sell-type": false, "creator-profile": false
  });
  const [autoSaveIndicator, setAutoSaveIndicator] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const setCurrentStep = (newStep: string) => {
    const currentIdx = STEPS.findIndex(s => s.id === currentStep);
    const newIdx = STEPS.findIndex(s => s.id === newStep);
    setSlideDirection(newIdx >= currentIdx ? 'forward' : 'back');
    setAnimKey(k => k + 1);
    setCurrentStepState(newStep);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam && STEPS.some(s => s.id === stepParam)) setCurrentStepState(stepParam);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      toast({ title: "Authentication Required", description: "Please sign up or log in.", variant: "destructive" });
      navigate({ to: '/sign-up' });
    }
  }, [navigate]);

  useEffect(() => {
    let isActive = true;
    const setupInitialState = () => {
      const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
      const defaultData = {
        vendor: {
          handle: "", name: "", logo: null, coverphoto: null,
          youtube: null, instagram: null, xtwitter: null, facebook: null, othersocial: null,
          phonenumber: null, GSTIN: null, gst_verification_status: "pending",
          companyname: null, pan_number: null, city: null, pincode: null, state: null,
          address: null, tan_number: null, bank_account_holder_name: null,
          bank_account_number: null, bank_account_ifsc_code: null, bank_name: null,
          bank_account_type: "Saving", cancelled_checkque: null,
          creator_bio: null, creator_title: null, creator_category: "other",
          sell_on_marketplace: true, sell_on_own_store: false,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
          admins: [{ email: userEmail, first_name: '', last_name: '' }]
        }
      };
      if (isActive) { setVendorData(defaultData); setIsLoading(false); }
    };

    const initializeOnboarding = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('vendorToken');
        if (!token) { setupInitialState(); return; }
        const { hasActorId } = checkTokenForActorId();
        if (hasActorId) {
          try {
            const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (isActive) {
                setVendorData(data);
                setStepCompletion({
                  "basic-info": Boolean(data.vendor.admins?.[0]?.first_name && data.vendor.admins?.[0]?.last_name),
                  "sell-type": Boolean(data.vendor.sell_on_marketplace || data.vendor.sell_on_own_store),
                  "creator-profile": Boolean(data.vendor.creator_bio || data.vendor.name),
                });
              }
            } else { setupInitialState(); }
          } catch { setupInitialState(); }
        } else { setupInitialState(); }
        if (isActive) setIsLoading(false);
      } catch { if (isActive) setupInitialState(); }
    };

    initializeOnboarding();
    return () => { isActive = false; };
  }, [navigate, toast]);

  useEffect(() => {
    if (vendorData?.vendor && (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins))) {
      const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
      setVendorData(prev => ({ ...prev, vendor: { ...prev.vendor, admins: [{ email: userEmail, first_name: '', last_name: '' }] } }));
    }
  }, [vendorData]);

  useEffect(() => {
    if (vendorData?.vendor) {
      setStepCompletion({
        "basic-info": Boolean(vendorData.vendor.admins?.[0]?.first_name && vendorData.vendor.admins?.[0]?.last_name),
        "sell-type": Boolean(vendorData.vendor.sell_on_marketplace || vendorData.vendor.sell_on_own_store),
        "creator-profile": Boolean(vendorData.vendor.creator_bio || vendorData.vendor.name || vendorData.vendor.creator_category),
      });
    }
  }, [vendorData]);

  const handleLocalSave = () => {
    if (vendorData?.vendor) setLocalPayload({ ...vendorData.vendor, updated_at: new Date().toISOString() });
  };

  const handleServerUpdate = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token || !vendorData?.vendor) return;
      const uploadedUrls = await uploadPendingFiles();
      const updatePayload: Record<string, any> = {};
      const textFields = ['name', 'handle', 'phonenumber', 'youtube', 'instagram', 'xtwitter', 'facebook', 'othersocial',
        'GSTIN', 'gst_verification_status', 'companyname', 'pan_number', 'city', 'pincode', 'state',
        'address', 'tan_number', 'bank_account_holder_name', 'bank_account_number',
        'bank_account_ifsc_code', 'bank_name', 'bank_account_type', 'creator_bio', 'creator_title', 'creator_category'];
      textFields.forEach(f => { const v = vendorData.vendor[f]; if (v && !String(v).startsWith('data:')) updatePayload[f] = v; });
      const admin = vendorData.vendor.admins?.[0];
      if (admin) updatePayload.admins = { email: admin.email, first_name: admin.first_name || '', last_name: admin.last_name || '' };
      if (uploadedUrls.logo) updatePayload.logo = uploadedUrls.logo;
      if (uploadedUrls.coverphoto) updatePayload.coverphoto = uploadedUrls.coverphoto;
      if (uploadedUrls.cancelled_checkque) updatePayload.cancelled_checkque = uploadedUrls.cancelled_checkque;
      ['logo', 'coverphoto', 'cancelled_checkque'].forEach(f => {
        if (!uploadedUrls[f] && vendorData.vendor[f] && !vendorData.vendor[f].startsWith('data:')) updatePayload[f] = vendorData.vendor[f];
      });
      updatePayload.sell_on_marketplace = vendorData.vendor.sell_on_marketplace;
      updatePayload.sell_on_own_store = vendorData.vendor.sell_on_own_store;
      const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        const d = await res.json();
        if (d.vendor) setVendorData(prev => ({ ...prev, vendor: { ...prev.vendor, ...d.vendor } }));
      }
    } catch {}
  };

  const handleContinue = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (currentStep === "basic-info" && (!vendorData?.vendor?.admins?.[0]?.first_name || !vendorData?.vendor?.admins?.[0]?.last_name)) {
        toast({ title: "Name is required", description: "Please enter your first and last name.", variant: "destructive" }); return;
      }
      if (currentStep === "sell-type" && !vendorData?.vendor?.sell_on_marketplace && !vendorData?.vendor?.sell_on_own_store) {
        toast({ title: "Please select a store type", description: "Pick at least one option to continue.", variant: "destructive" }); return;
      }
      if (currentStep === "creator-profile") {
        const { hasActorId } = checkTokenForActorId();
        if (hasActorId) await handleServerUpdate(); else handleLocalSave();
        await handleFinalSubmission(); return;
      }
      const { hasActorId } = checkTokenForActorId();
      if (hasActorId) await handleServerUpdate(); else handleLocalSave();
      const idx = STEPS.findIndex(s => s.id === currentStep);
      if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleSaveAndExit = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) { toast({ title: "Authentication Required", variant: "destructive" }); return; }
      setAutoSaveIndicator("Saving...");
      const { hasActorId } = checkTokenForActorId();
      if (hasActorId) {
        await handleServerUpdate();
        toast({ title: "Profile saved!", description: "Taking you to your dashboard..." });
        setTimeout(() => { setAutoSaveIndicator(""); navigate({ to: '/dashboard' }); }, 1500);
      } else {
        await handleCreateNewVendor();
        toast({ title: "Profile created!", description: "Taking you to sign in..." });
        setTimeout(() => { setAutoSaveIndicator(""); navigate({ to: '/sign-in' }); }, 1500);
      }
    } catch (error) {
      toast({ title: "Save failed", description: error.message || "Please try again.", variant: "destructive" });
      setAutoSaveIndicator("");
    }
  };

  const handleCreateNewVendor = async () => {
    const token = localStorage.getItem('vendorToken');
    if (!token) throw new Error('Authentication token not found');
    const uploadedUrls = await uploadPendingFiles();
    const finalData = localPayload || vendorData.vendor;
    const payload = {
      name: finalData.name || 'New Vendor', handle: finalData.handle || 'new-vendor-handle',
      phonenumber: finalData.phonenumber || '', logo: uploadedUrls.logo || '',
      coverphoto: uploadedUrls.coverphoto || '', cancelled_checkque: uploadedUrls.cancelled_checkque || '',
      admin: { email: finalData.admins?.[0]?.email || localStorage.getItem('vendorEmail') || 'vendor@example.com',
        first_name: finalData.admins?.[0]?.first_name || '', last_name: finalData.admins?.[0]?.last_name || '' }
    };
    const textFields = ['youtube', 'instagram', 'xtwitter', 'facebook', 'GSTIN', 'companyname', 'pan_number',
      'city', 'pincode', 'state', 'address', 'bank_name', 'bank_account_holder_name',
      'bank_account_number', 'bank_account_ifsc_code', 'bank_account_type', 'creator_bio', 'creator_title', 'creator_category'];
    textFields.forEach(f => { if (finalData[f] && !finalData[f].startsWith('data:')) payload[f] = finalData[f]; });
    const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create vendor: ${res.status}`);
    const d = await res.json();
    if (d.vendor) { setVendorData(d); setLocalPayload(null); setPendingFiles({ logo: null, coverphoto: null, cancelled_checkque: null }); }
  };

  const handleFinalSubmission = async () => {
    const { hasActorId } = checkTokenForActorId();
    if (hasActorId) {
      await handleServerUpdate();
      toast({ title: "🎉 You're live on JUNOONI!", description: "Welcome to the creator family!" });
      setTimeout(() => navigate({ to: '/dashboard' }), 1000);
    } else {
      await handleCreateNewVendor();
      toast({ title: "🎉 Profile created!", description: "Your creator store is ready!" });
      setTimeout(() => navigate({ to: '/sign-in' }), 1000);
    }
  };

  const handleFileUpload = async (file: File, fileType: 'logo' | 'coverphoto' | 'cancelled_checkque') => {
    if (!file) return;
    try {
      if (!file.type.startsWith('image/') && fileType !== 'cancelled_checkque') throw new Error('Please select a valid image file');
      if (file.size > 10 * 1024 * 1024) throw new Error('File size must be less than 10MB');
      setPendingFiles(prev => ({ ...prev, [fileType]: file }));
      const reader = new FileReader();
      reader.onload = (e) => { updateVendorData(fileType, e.target?.result as string); toast({ title: "Photo selected!", description: "It will upload when you save." }); };
      reader.onerror = () => { throw new Error(`Failed to read ${fileType} file`); };
      reader.readAsDataURL(file);
    } catch (error) { toast({ title: "File error", description: error.message, variant: "destructive" }); }
  };

  const uploadPendingFiles = async () => {
    const token = localStorage.getItem('vendorToken');
    if (!token) throw new Error('Authentication token not found');
    const uploaded: Record<string, string> = {};
    const toUpload = Object.entries(pendingFiles).filter(([, f]) => f instanceof File);
    if (!toUpload.length) return uploaded;
    for (const [fileType, file] of toUpload) {
      try {
        const form = new FormData();
        form.append('files', file);
        const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/uploads`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: form
        });
        if (!res.ok) continue;
        const data = await res.json();
        const url = data.files?.[0]?.url || data.files?.[0]?.path || data.url || data.file_url ||
          (data.path ? (data.path.startsWith('http') ? data.path : `${import.meta.env.VITE_MEDUSA_BACKEND_URL}${data.path}`) : null);
        if (url) uploaded[fileType] = url;
      } catch (e) { toast({ title: "Upload failed", description: `Failed to upload ${fileType}: ${e.message}`, variant: "destructive" }); }
    }
    return uploaded;
  };

  const updateVendorData = (field: keyof VendorData, value: any) => {
    if (vendorData?.vendor) {
      setVendorData({ ...vendorData, vendor: { ...vendorData.vendor, [field]: value, updated_at: new Date().toISOString() } });
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
          <p className="text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ color: BRAND.textPrimary }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/dashboard"><img src={JunooniLogo} alt="Junooni Logo" className="h-8" /></Link>
            <div className="flex items-center gap-2">
              {autoSaveIndicator && <span className="text-xs font-medium text-green-500">{autoSaveIndicator}</span>}
              <Button variant="ghost" size="sm" onClick={handleSaveAndExit} className="text-xs text-gray-500 hover:text-gray-700">
                <IconLogout className="w-3.5 h-3.5 mr-1" />Save & Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Horizontal Step Tracker ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl px-4 py-3 mx-auto">
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((step, index) => {
              const isCompleted = stepCompletion[step.id];
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => { setCurrentStep(step.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-medium",
                      isCurrent ? "bg-orange-50 text-orange-700" : isCompleted ? "text-gray-500 hover:bg-gray-50" : "text-gray-400 hover:bg-gray-50")}>
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold rounded-lg"
                      style={isCompleted ? { background: `${BRAND.success}22`, color: BRAND.success } : isCurrent ? { background: `${BRAND.primary}15`, color: BRAND.primary } : { background: '#f3f4f6', color: '#9ca3af' }}>
                      {isCompleted ? <IconCircleCheck className="w-3.5 h-3.5" /> : <span>•</span>}
                    </div>
                    <span className="hidden sm:inline whitespace-nowrap">{step.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="w-6 h-px mx-1 transition-all rounded-full" style={{ background: isCompleted ? BRAND.success : '#e5e7eb' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-5xl px-4 py-8 mx-auto">
        <div className="mb-6">
          {/* <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            {STEPS.find(s => s.id === currentStep)?.estimatedTime && (
              <span className="text-xs text-gray-400">· {STEPS.find(s => s.id === currentStep)?.estimatedTime}</span>
            )}
          </div> */}
          <h1 className="text-2xl font-bold text-gray-900">{STEPS.find(s => s.id === currentStep)?.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{STEPS.find(s => s.id === currentStep)?.description}</p>
        </div>

        <div className="flex items-start gap-6">

          {/* ── Form with slide animation ── */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
              <AnimatedStep key={animKey} direction={slideDirection}>
                {currentStep === "basic-info" && (
                  <StepBasicInfo vendorData={vendorData} updateVendorData={updateVendorData} setVendorData={setVendorData} brandColors={BRAND} />
                )}
                {currentStep === "sell-type" && (
                  <StepSellType vendorData={vendorData} updateVendorData={updateVendorData} />
                )}
                {currentStep === "creator-profile" && (
                  <StepCreatorProfile vendorData={vendorData} updateVendorData={updateVendorData}
                    handleFileUpload={handleFileUpload} isUploading={isUploading} uploadType={uploadType} brandColors={BRAND} />
                )}

              </AnimatedStep>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" className="text-sm text-gray-400 hover:text-gray-600"
                onClick={() => { const i = STEPS.findIndex(s => s.id === currentStep); if (i > 0) setCurrentStep(STEPS[i - 1].id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                {STEPS.find(s => s.id === currentStep)?.isSkippable && (
                  <Button variant="ghost" className="text-sm text-gray-400 hover:text-gray-600"
                    onClick={() => { const i = STEPS.findIndex(s => s.id === currentStep); if (i < STEPS.length - 1) setCurrentStep(STEPS[i + 1].id); }}>
                    Skip for now
                  </Button>
                )}
                <Button onClick={handleContinue}
                  className="px-8 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: 'white' }}>
                  {currentStep === "creator-profile" ? "🚀 Launch My Store" : "Continue →"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 mt-6 bg-white border border-gray-100 rounded-xl">
                <IconHelpCircle className="flex-shrink-0 w-4 h-4 text-gray-400" />
                <p className="flex-1 text-xs text-gray-500">Need help with this step?</p>
                <Button onClick={() => { if (window.$chatwoot?.toggle) window.$chatwoot.toggle(); }}
                  variant="ghost" size="sm" className="px-3 text-xs h-7" style={{ color: BRAND.primary }}>
                  Chat with us
                </Button>
              </div>
          </div>

          {/* ── Live Preview (xl only, step 3 + marketplace only) ── */}
          {currentStep === "creator-profile" && vendorData?.vendor?.sell_on_marketplace && (
            <div className="hidden xl:block w-64 shrink-0 self-start sticky top-[100px]">
              <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Live Preview</p>
                </div>
                <div className="relative h-28 bg-gradient-to-r from-gray-100 to-gray-200">
                  {vendorData?.vendor?.coverphoto
                    ? <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
                    : <div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-gray-400">Cover photo</p></div>}
                  <div className="absolute -bottom-6 left-4">
                    <div className="w-12 h-12 overflow-hidden bg-white border-2 border-white shadow-md rounded-xl">
                      {vendorData?.vendor?.logo
                        ? <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
                        : <div className="flex items-center justify-center w-full h-full bg-gray-100"><IconUser className="w-6 h-6 text-gray-300" /></div>}
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-8 pb-4">
                  <p className="text-sm font-bold text-gray-900 truncate">{vendorData?.vendor?.name || 'Your Brand'}</p>
                  {vendorData?.vendor?.creator_title && (
                    <p className="text-xs mt-0.5 truncate font-medium" style={{ color: BRAND.primary }}>{vendorData.vendor.creator_title}</p>
                  )}
                  {vendorData?.vendor?.creator_bio
                    ? <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-3">{vendorData.vendor.creator_bio}</p>
                    : <p className="mt-2 text-xs italic text-gray-300">Your bio will appear here...</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-5 mt-8 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400">&copy; {new Date().getFullYear()} JUNOONI. All rights reserved.</p>
      </div>

      <ChatwootWidget />

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(56px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-56px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}