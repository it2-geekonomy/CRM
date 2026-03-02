"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetClientsQuery } from "@/store/api/clientApiSlice";
import { useState } from "react";

export default function ClientsPage() {
  const router = useRouter();
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients?.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading clients...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error loading clients</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Clients</h1>
          <p className="text-gray-500 text-sm">Manage your client relationships</p>
        </div>
        <Link
          href="/admin/dashboard/clients/new/configuration"
          className="px-4 py-2.5 sm:px-5 bg-[#69AE44] text-white text-sm font-semibold rounded-lg hover:bg-[#538935] transition text-center inline-block w-full sm:w-auto"
        >
          + Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search clients by name, company, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#69AE44] focus:ring-2 focus:ring-[#69AE44]/10"
        />
      </div>

      {/* Clients List - Desktop Table View */}
      {filteredClients && filteredClients.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{client.company || "—"}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {client.email || "—"}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{client.phone || "—"}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            client.status
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/dashboard/clients/${client.id}/configuration`}
                          className="text-[#69AE44] hover:text-[#538935]"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredClients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/dashboard/clients/${client.id}/configuration`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#69AE44] transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{client.name}</h3>
                    {client.company && (
                      <p className="text-sm text-gray-500 mb-2">{client.company}</p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ml-2 ${
                      client.status
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {client.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-16 text-gray-500">Email:</span>
                      <span className="flex-1 truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-16 text-gray-500">Phone:</span>
                      <span className="flex-1">{client.phone}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-[#69AE44] font-medium">Tap to edit →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No clients found matching your search" : "No clients yet"}
          </p>
          {!searchTerm && (
            <Link
              href="/admin/dashboard/clients/new/configuration"
              className="inline-block px-5 py-2.5 bg-[#69AE44] text-white text-sm font-semibold rounded-lg hover:bg-[#538935] transition"
            >
              + Add Your First Client
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
