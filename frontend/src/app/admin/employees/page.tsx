"use client";

import React, { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  title?: string;
  department?: string;
  status?: "active" | "inactive" | "onleave" | "terminated";
};

const DUMMY_EMPLOYEES: Employee[] = [
  { id: "1",  name: "Sarah Johnson",    title: "Senior Engineer",    department: "Engineering",      status: "active"     },
  { id: "2",  name: "Marcus Lee",       title: "Product Manager",    department: "Product",          status: "active"     },
  { id: "3",  name: "Priya Patel",      title: "UX Designer",        department: "Design",           status: "active"     },
  { id: "4",  name: "James Okonkwo",    title: "DevOps Engineer",    department: "Engineering",      status: "active"     },
  { id: "5",  name: "Aisha Rahman",     title: "Marketing Lead",     department: "Marketing",        status: "active"     },
  { id: "6",  name: "Tom Eriksson",     title: "Sales Executive",    department: "Sales",            status: "active"     },
  { id: "7",  name: "Nina Castillo",    title: "HR Specialist",      department: "HR",               status: "onleave"    },
  { id: "8",  name: "David Kim",        title: "Frontend Engineer",  department: "Engineering",      status: "active"     },
  { id: "9",  name: "Olivia Turner",    title: "Finance Analyst",    department: "Finance",          status: "active"     },
  { id: "10", name: "Rajan Mehta",      title: "Backend Engineer",   department: "Engineering",      status: "active"     },
  { id: "11", name: "Chloe Dupont",     title: "Content Strategist", department: "Marketing",        status: "inactive"   },
  { id: "12", name: "Ethan Brooks",     title: "QA Engineer",        department: "Engineering",      status: "active"     },
  { id: "13", name: "Sofia Andersen",   title: "Legal Counsel",      department: "Legal",            status: "active"     },
  { id: "14", name: "Lucas Ferreira",   title: "Customer Success",   department: "Customer Support", status: "onleave"    },
  { id: "15", name: "Hannah Müller",    title: "Ops Manager",        department: "Operations",       status: "active"     },
  { id: "16", name: "Kevin Zhao",       title: "Data Scientist",     department: "Engineering",      status: "active"     },
  { id: "17", name: "Fatima Al-Hassan", title: "Recruiter",          department: "HR",               status: "active"     },
  { id: "18", name: "Daniel Park",      title: "Account Executive",  department: "Sales",            status: "terminated" },
  { id: "19", name: "Elena Russo",      title: "Brand Designer",     department: "Design",           status: "active"     },
  { id: "20", name: "Chris Nwosu",      title: "Support Specialist", department: "Customer Support", status: "active"     },
];

type FilterType = "active" | "inactive" | "onleave" | "terminated" | "all";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "active",     label: "Active"     },
  { key: "inactive",   label: "Inactive"   },
  { key: "onleave",    label: "On Leave"   },
  { key: "terminated", label: "Terminated" },
  { key: "all",        label: "All"        },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(DUMMY_EMPLOYEES);
  const [loading, setLoading]     = useState(false);
  const [query, setQuery]         = useState("");
  const [filter, setFilter]       = useState<FilterType>("active");
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Employee[]) => { if (data?.length) setEmployees(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = employees
    .filter((e) => filter === "all" || e.status === filter)
    .filter((e) =>
      `${e.name} ${e.title ?? ""} ${e.department ?? ""}`
        .toLowerCase().includes(query.toLowerCase())
    );

  const stats = {
    active:      employees.filter((e) => e.status === "active").length,
    onleave:     employees.filter((e) => e.status === "onleave").length,
    total:       employees.length,
    departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 space-y-3 sm:space-y-4">

        {/* ── KPI CARDS: 2×2 on mobile, 4×1 on desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <KpiCard title="Active Employees"  value="284"  note="↑ 2 this week"    />
          <KpiCard title="New Hires"         value="13"   note="↑ 5 this month"   />
          <KpiCard title="Avg. Tenure"       value="3.2y" note="↑ 0.1y this year" />
          <KpiCard title="Departments"       value="11"   note="No change"        />
        </div>

        {/* ── MAIN PANEL ── */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04]">

          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 border-b border-gray-100">

            {/* Row 1: Title + New button */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Employees</h2>
              <button
                onClick={() => { if (typeof window !== "undefined") window.location.href = "/employees/new"; }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors cursor-pointer sm:px-4 sm:text-sm"
              >
                <span className="text-base leading-none">+</span>
                <span>New Employee</span>
              </button>
            </div>

            {/* Row 2: Search bar — full width */}
            <div className="flex">
              <input
                aria-label="Search employees"
                placeholder="Search employees..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 min-w-0 px-3.5 py-2.5 text-sm border border-gray-200 border-r-0 rounded-l-xl outline-none text-gray-700 placeholder-gray-400 bg-white focus:border-green-400 transition-colors"
              />
              <button className="px-4 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-r-xl transition-colors whitespace-nowrap cursor-pointer">
                Search
              </button>
            </div>
          </div>

          {/* Filter tabs — scroll on mobile */}
          <div className="px-4 sm:px-5 pt-3 pb-0">
            <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={[
                    "shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer whitespace-nowrap sm:text-sm",
                    filter === key
                      ? "bg-green-50 border-green-200 text-green-700 font-semibold"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Inner stat boxes: 2×2 always, tiny on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 pb-4 sm:px-5 sm:gap-3 sm:pb-4">
            <InnerStat title="Active"      value={String(stats.active)}      />
            <InnerStat title="On Leave"    value={String(stats.onleave)}     />
            <InnerStat title="Total"       value={String(stats.total)}       />
            <InnerStat title="Departments" value={String(stats.departments)} />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mx-4 sm:mx-5" />

          {/* Employee list */}
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No employees found.</p>
            ) : (
              // 2-col on mobile, 3-col on md, 4-col on xl
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {filtered.map((emp) => <EmployeeCard key={emp.id} emp={emp} />)}
              </div>
            )}
            {error && <p className="mt-3 text-xs text-red-600 font-medium">{error}</p>}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── KPI card — compact on mobile ── */
function KpiCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl px-3.5 py-3 sm:px-5 sm:py-4 shadow-sm ring-1 ring-black/[0.04]">
      <p className="text-xs text-gray-500 mb-1.5 leading-tight sm:text-sm sm:mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none sm:text-3xl">{value}</p>
      <p className="text-xs text-gray-400 mt-1.5 sm:mt-2">{note}</p>
    </div>
  );
}

/* ── Inner stat box ── */
function InnerStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="text-xs text-gray-500 mb-1 leading-tight">{title}</p>
      <p className="text-lg font-bold text-gray-900 sm:text-2xl">{value}</p>
    </div>
  );
}

/* ── Employee card — 2-col grid friendly ── */
function EmployeeCard({ emp }: { emp: Employee }) {
  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2.5 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center font-bold text-xs text-green-800 shrink-0 select-none">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate sm:text-sm">{emp.name}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5 leading-tight">{emp.title ?? "—"}</p>
        </div>
      </div>

      {/* Department tag */}
      <p className="text-xs text-gray-400 truncate leading-tight">{emp.department ?? "—"}</p>

      {/* Status + View */}
      <div className="flex items-center justify-between pt-0.5">
        <StatusBadge status={emp.status} />
        <button className="text-xs font-medium text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          View
        </button>
      </div>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:     { label: "Active",     cls: "bg-emerald-50 text-emerald-700" },
    inactive:   { label: "Inactive",   cls: "bg-gray-100 text-gray-500"     },
    onleave:    { label: "On Leave",   cls: "bg-amber-50 text-amber-600"    },
    terminated: { label: "Terminated", cls: "bg-red-50 text-red-600"        },
  };
  const { label, cls } = map[status ?? ""] ?? { label: "—", cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  );
}