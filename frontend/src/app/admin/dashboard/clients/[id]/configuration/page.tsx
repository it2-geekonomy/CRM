"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  type ClientContact,
} from "@/store/api/clientApiSlice";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import Link from "next/link";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Other",
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
];

const PAYMENT_TERMS = ["Net 30", "Net 15", "Net 60", "Due on Receipt", "Custom"];

const CURRENCIES = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
];

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Credit Card",
  "PayPal",
  "Check",
  "Wire Transfer",
];

const CONTACT_TYPES = ["Primary", "Billing", "Technical"];

// Common CSS classes
const INPUT_CLASS = "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#69AE44] focus:ring-2 focus:ring-[#69AE44]/10";
const LABEL_CLASS = "block text-sm font-semibold text-gray-700 mb-2";
const SECTION_HEADER_CLASS = "text-base sm:text-lg font-semibold text-gray-800";
const CARD_CLASS = "bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-7 mb-6";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string | undefined;
  const isNewClient = clientId === "new" || !clientId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId!, {
    skip: isNewClient,
  });

  // Use employees instead of admins - salesManagerId must reference employee_profiles
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100 });
  const employees = employeesData?.data || [];

  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [currency, setCurrency] = useState("INR - Indian Rupee");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [creditLimit, setCreditLimit] = useState("");
  const [billingNotes, setBillingNotes] = useState("");

  const [clientSince, setClientSince] = useState("");
  const [accountManagerId, setAccountManagerId] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load client data if editing
  useEffect(() => {
    if (!client || isNewClient) return;
    
    setCompanyName(client.name || "");
    setClientCode(client.clientCode || "");
    setIndustry(client.industry || "");
    setCompanySize(client.companySize || "");
    setWebsite(client.website || "");
    setTaxId(client.taxId || "");
    setLogoUrl(client.logo || client.logoUrl || null);
    setStreetAddress(client.streetAddress || "");
    setCity(client.city || "");
    setState(client.state || "");
    setPostalCode(client.postalCode || "");
    setCountry(client.country || "India");
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setPaymentTerms(client.paymentTerms || "Net 30");
    setCurrency(client.currency || "INR - Indian Rupee");
    setPaymentMethod(client.paymentMethod || "Bank Transfer");
    setCreditLimit(client.creditLimit?.toString() || "");
    setBillingNotes(client.billingNotes || "");
    setClientSince(client.clientSince ? client.clientSince.split("T")[0] : "");
    setAccountManagerId((client as any).salesManagerId || (client as any).accountManagerId || "");
    setInternalNotes(client.internalNotes || "");
    setContacts((client.contacts || []).map((c) => ({ name: c.name || "", title: c.title, email: c.email, phone: c.phone, role: c.role })));
  }, [client, isNewClient]);

  const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > height && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Could not get canvas context"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    try {
      const compressedBase64 = await compressImage(file, 400, 400, 0.7);
      if (compressedBase64.length > 500 * 1024) {
        setLogoUrl(await compressImage(file, 300, 300, 0.6));
        toast.info("Image compressed to reduce size");
      } else {
        setLogoUrl(compressedBase64);
      }
    } catch (error) {
      toast.error("Failed to process image");
      console.error("Image compression error:", error);
    }
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: "", email: "", phone: "", title: "", role: "Primary" }]);
    setEditingContactIndex(contacts.length);
  };

  const handleUpdateContact = (index: number, field: keyof ClientContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleDeleteContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = async (saveAsDraft: boolean = false) => {
    setError(null);
    
    if (!saveAsDraft && !companyName.trim()) {
      const msg = "Company Name is required";
      setError(msg);
      toast.error(msg);
      return;
    }
    
    if (!email.trim()) {
      const msg = "Email is required";
      setError(msg);
      toast.error(msg);
      return;
    }
    
    if (!EMAIL_REGEX.test(email.trim())) {
      const msg = "Please enter a valid email address";
      setError(msg);
      toast.error(msg);
      return;
    }

    const finalLogoUrl = logoUrl && logoUrl.length > 500 * 1024 ? (toast.warning("Logo is too large and will not be saved. Please use a smaller image."), undefined) : logoUrl || undefined;
    
    const preparedContacts = contacts
      .filter((c) => c.name.trim())
      .map((c) => ({ name: c.name.trim(), title: c.title?.trim(), email: c.email?.trim(), phone: c.phone?.trim(), role: c.role?.trim() }))
      .filter((c) => !c.email || EMAIL_REGEX.test(c.email));

    const trimOrUndef = (val: string) => val.trim() || undefined;
    const clientData: any = {
      name: companyName.trim(),
      email: email.trim(),
      phone: trimOrUndef(phone),
      logo: finalLogoUrl,
      clientCode: trimOrUndef(clientCode),
      industry: industry || undefined,
      companySize: companySize || undefined,
      website: trimOrUndef(website),
      taxId: trimOrUndef(taxId),
      streetAddress: trimOrUndef(streetAddress),
      city: trimOrUndef(city),
      state: trimOrUndef(state),
      postalCode: trimOrUndef(postalCode),
      country: country || undefined,
      paymentTerms: paymentTerms || undefined,
      currency: currency || undefined,
      paymentMethod: paymentMethod || undefined,
      creditLimit: creditLimit.trim() ? parseFloat(creditLimit.trim()) : undefined,
      billingNotes: trimOrUndef(billingNotes),
      clientSince: clientSince || undefined,
      salesManagerId: accountManagerId.trim() || undefined,
      internalNotes: trimOrUndef(internalNotes),
      status: !saveAsDraft,
      contacts: preparedContacts.length > 0 ? preparedContacts : undefined,
    };
    
    Object.keys(clientData).forEach((key) => {
      if (clientData[key] === undefined || clientData[key] === "") delete clientData[key];
    });

    try {
      if (isNewClient) {
        const result = await createClient(clientData).unwrap();
        toast.success("Client created successfully");
        router.push(`/admin/dashboard/clients/${result.id}/configuration`);
      } else {
        await updateClient({ id: clientId!, data: clientData }).unwrap();
        toast.success(saveAsDraft ? "Client saved as draft" : "Client updated successfully");
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || "Failed to save client. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const getContactAvatarColor = (index: number) => ["#69AE44", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"][index % 5];

  if (!isNewClient && isLoadingClient) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading client...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="text-xs sm:text-sm text-gray-500">
            <Link href="/admin/dashboard" className="text-[#69AE44] hover:underline">
              Dashboard
            </Link>{" "}
            /{" "}
            <Link href="/admin/dashboard/clients" className="text-[#69AE44] hover:underline">
              Clients
            </Link>{" "}
            / Configuration
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Client Configuration</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Manage client information, contacts, and billing details
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Company Information */}
        <div className={CARD_CLASS}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <h2 className={SECTION_HEADER_CLASS}>Company Information</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md w-fit">
              Active
            </span>
          </div>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className={LABEL_CLASS}>Company Logo</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#69AE44] hover:bg-green-50/5 transition-colors"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <>
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-xs text-gray-500">Upload Logo</div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">Recommended size: 200x200px, PNG or JPG</p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Company Name <span className="text-red-500">*</span></label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., ABC Corporation" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Client Code</label>
              <input type="text" value={clientCode} onChange={(e) => setClientCode(e.target.value)} placeholder="e.g., ABC-001" className={INPUT_CLASS} />
              <p className="text-xs text-gray-500 mt-1">Auto-generated if left blank</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={INPUT_CLASS}>
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Company Size</label>
              <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={INPUT_CLASS}>
                <option value="">Select Size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={LABEL_CLASS}>Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.example.com" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax ID / Registration Number
              </label>
              <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="e.g., 12-3456789" className={INPUT_CLASS} />
            </div>
          </div>
        </div>

        {/* Address & Contact */}
        <div className={CARD_CLASS}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className={SECTION_HEADER_CLASS}>Address & Contact</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Street Address</label>
              <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street address" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>State / Province</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Postal Code</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT_CLASS}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={LABEL_CLASS}>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>General Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@company.com" className={INPUT_CLASS} />
            </div>
          </div>
        </div>

        {/* Primary Contacts */}
        <div className={CARD_CLASS}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <h2 className={SECTION_HEADER_CLASS}>Primary Contacts</h2>
            <button
              onClick={handleAddContact}
              className="px-4 sm:px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
            >
              + Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No contacts added yet</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, index) => {
                const isEditing = editingContactIndex === index || !contact.name.trim();
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                        style={{ backgroundColor: getContactAvatarColor(index) }}
                      >
                        {getInitials(contact.name || "CN")}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleUpdateContact(index, "name", e.target.value)}
                              placeholder="Contact Name"
                              className="text-sm font-semibold text-gray-800 mb-1 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#69AE44]"
                              autoFocus
                            />
                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                              <input
                                type="text"
                                value={contact.title || ""}
                                onChange={(e) => handleUpdateContact(index, "title", e.target.value)}
                                placeholder="Title (e.g., CEO)"
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#69AE44]"
                              />
                              <input
                                type="email"
                                value={contact.email || ""}
                                onChange={(e) => handleUpdateContact(index, "email", e.target.value)}
                                placeholder="Email"
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#69AE44]"
                              />
                              <input
                                type="tel"
                                value={contact.phone || ""}
                                onChange={(e) => handleUpdateContact(index, "phone", e.target.value)}
                                placeholder="Phone"
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#69AE44]"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-semibold text-gray-800 mb-1 truncate">
                              {contact.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {[contact.title, contact.email, contact.phone]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <select
                        value={contact.role || "Primary"}
                        onChange={(e) => handleUpdateContact(index, "role", e.target.value)}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs font-semibold text-gray-700"
                      >
                        {CONTACT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingContactIndex(null);
                            } else {
                              setEditingContactIndex(index);
                            }
                          }}
                          className="w-8 h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center text-sm transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteContact(index);
                            if (editingContactIndex === index) {
                              setEditingContactIndex(null);
                            }
                          }}
                          className="w-8 h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center text-sm transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Billing Information */}
        <div className={CARD_CLASS}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className={SECTION_HEADER_CLASS}>Billing Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Payment Terms</label>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={INPUT_CLASS}>
                {PAYMENT_TERMS.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT_CLASS}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={INPUT_CLASS}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Credit Limit</label>
              <input type="text" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="e.g., $50,000" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={LABEL_CLASS}>Billing Notes</label>
              <textarea value={billingNotes} onChange={(e) => setBillingNotes(e.target.value)} placeholder="Add any special billing instructions or notes..." rows={4} className={INPUT_CLASS + " resize-y"} />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={CARD_CLASS}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className={SECTION_HEADER_CLASS}>Additional Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div>
              <label className={LABEL_CLASS}>Client Since</label>
              <input type="date" value={clientSince} onChange={(e) => setClientSince(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Account Manager <span className="text-gray-400 text-xs">(Optional)</span></label>
              <select value={accountManagerId} onChange={(e) => setAccountManagerId(e.target.value)} className={INPUT_CLASS}>
                <option value="">-- Select Account Manager --</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name} {employee.designation ? `(${employee.designation})` : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={LABEL_CLASS}>Internal Notes</label>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Add internal notes about this client (not visible to client)..." rows={4} className={INPUT_CLASS + " resize-y"} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isCreating || isUpdating}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 w-full sm:w-auto"
          >
            {isCreating || isUpdating ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isCreating || isUpdating}
            className="px-5 py-2.5 bg-[#69AE44] text-white text-sm font-semibold rounded-lg hover:bg-[#538935] transition disabled:opacity-50 w-full sm:w-auto"
          >
            {isCreating || isUpdating ? "Saving..." : isNewClient ? "Create Client" : "Save Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
