"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useGetClientQuery } from "@/store/api/clientApiSlice";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export default function EmployeeClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params?.id as string | undefined;

  // Get timestamp from URL to force fresh fetch
  const timestamp = searchParams.get('t');
  
  const { data: client, isLoading, isError, refetch } = useGetClientQuery(clientId!, {
    skip: !clientId,
    refetchOnMountOrArgChange: true, // Force refetch when component mounts or clientId changes
  });

  // Force refetch when timestamp changes (after update)
  useEffect(() => {
    if (timestamp && clientId) {
      refetch();
    }
  }, [timestamp, clientId, refetch]);

  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({ limit: 100 }, {
    refetchOnMountOrArgChange: true, // Force refetch to get latest employee data
  });
  const employees = employeesData?.data || [];
  
  // Try to get salesManager from client response first (if backend includes it), otherwise find from employees list
  const salesManager = useMemo(() => {
    if (client?.salesManager) {
      // Backend returned the salesManager relation
      return { name: client.salesManager.name, designation: client.salesManager.designation };
    } else if (client?.salesManagerId && employees.length > 0) {
      // Find from employees list
      const found = employees.find((emp) => emp.id === client.salesManagerId);
      return found || null;
    }
    return null;
  }, [client?.salesManager, client?.salesManagerId, employees]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load client details.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="text-xs sm:text-sm text-gray-500">
            <Link href="/employee/dashboard" className="text-[#69AE44] hover:underline">
              Dashboard
            </Link>{" "}
            /{" "}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const savedFilter = sessionStorage.getItem("dashboardFilter");
                  if (savedFilter === "Clients") {
                    router.push("/employee/dashboard");
                    return;
                  }
                }
                router.push("/employee/dashboard");
              }}
              className="text-[#69AE44] hover:underline"
            >
              Clients
            </button>{" "}
            / Details
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Client Configuration
            </h1>
          </div>
          <p className="text-sm text-gray-500">Manage client information, contacts, and billing details</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">Company Information</h2>
            <div className="space-y-6">
              {/* Status */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Active</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${
                    client.status
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.status ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Logo */}
              {client.logoUrl && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Company Logo</p>
                  <div className="mt-2">
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Company Name */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Company Name *</p>
                <p className="text-base text-gray-900">{client.name}</p>
              </div>

              {/* Client Code */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Client Code</p>
                <p className="text-base text-gray-900">{client.clientCode || "—"}</p>
              </div>

              {/* Industry */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Industry</p>
                <p className="text-base text-gray-900">{client.industry || "—"}</p>
              </div>

              {/* Company Size */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Company Size</p>
                <p className="text-base text-gray-900">{client.companySize || "—"}</p>
              </div>

              {/* Website */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Website</p>
                {client.website ? (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-[#69AE44] hover:underline"
                  >
                    {client.website}
                  </a>
                ) : (
                  <p className="text-base text-gray-900">—</p>
                )}
              </div>

              {/* Tax ID */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Tax ID / Registration Number</p>
                <p className="text-base text-gray-900">{client.taxId || "—"}</p>
              </div>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">Address & Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Street Address</p>
                <p className="text-base text-gray-900">{client.streetAddress || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">City</p>
                <p className="text-base text-gray-900">{client.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">State / Province</p>
                <p className="text-base text-gray-900">{client.state || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Postal Code</p>
                <p className="text-base text-gray-900">{client.postalCode || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Country</p>
                <p className="text-base text-gray-900">{client.country || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Phone Number</p>
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-base text-[#69AE44] hover:underline"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <p className="text-base text-gray-900">—</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">General Email</p>
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-base text-[#69AE44] hover:underline"
                  >
                    {client.email}
                  </a>
                ) : (
                  <p className="text-base text-gray-900">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Primary Contacts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">Primary Contacts</h2>
            {client.contacts && client.contacts.length > 0 ? (
              <div className="space-y-4">
                {client.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Name</p>
                        <p className="text-base text-gray-900">{contact.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Title</p>
                        <p className="text-base text-gray-900">{contact.title || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-base text-[#69AE44] hover:underline"
                          >
                            {contact.email}
                          </a>
                        ) : (
                          <p className="text-base text-gray-900">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-base text-[#69AE44] hover:underline"
                          >
                            {contact.phone}
                          </a>
                        ) : (
                          <p className="text-base text-gray-900">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Role</p>
                        {contact.role ? (
                          <span className="inline-block px-2 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                            {contact.role}
                          </span>
                        ) : (
                          <p className="text-base text-gray-900">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No contacts added</p>
            )}
          </div>

          {/* Billing Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">Billing Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Terms</p>
                <p className="text-base text-gray-900">{client.paymentTerms || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Currency</p>
                <p className="text-base text-gray-900">{client.currency || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <p className="text-base text-gray-900">{client.paymentMethod || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Credit Limit</p>
                <p className="text-base text-gray-900">
                  {client.creditLimit
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: client.currency?.split(" - ")[0] || "USD",
                      }).format(client.creditLimit)
                    : "—"}
                </p>
              </div>
              {client.billingNotes && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Billing Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.billingNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Client Since</p>
                <p className="text-base text-gray-900">
                  {client.clientSince
                    ? new Date(client.clientSince).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Account Manager (Optional)</p>
                <p className="text-base text-gray-900">
                  {isLoadingEmployees ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : salesManager ? (
                    `${salesManager.name}${salesManager.designation ? ` (${salesManager.designation})` : ""}`
                  ) : client?.salesManagerId ? (
                    <span className="text-gray-400">Manager not found</span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              {client.internalNotes && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
