"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Employee = {
  id: string;
  name: string;
  title?: string;
  department?: string;
  status?: "active" | "inactive" | "onleave" | "terminated";
  avatar?: string;
};

const DUMMY_EMPLOYEES: Employee[] = [
  { id: "1",  name: "Sarah Johnson",    title: "Senior Engineer",       department: "Engineering",      status: "active"     },
  { id: "2",  name: "Marcus Lee",       title: "Product Manager",       department: "Product",          status: "active"     },
  { id: "3",  name: "Priya Patel",      title: "UX Designer",           department: "Design",           status: "active"     },
  { id: "4",  name: "James Okonkwo",    title: "DevOps Engineer",       department: "Engineering",      status: "active"     },
  { id: "5",  name: "Aisha Rahman",     title: "Marketing Lead",        department: "Marketing",        status: "active"     },
  { id: "6",  name: "Tom Eriksson",     title: "Sales Executive",       department: "Sales",            status: "active"     },
  { id: "7",  name: "Nina Castillo",    title: "HR Specialist",         department: "HR",               status: "onleave"    },
  { id: "8",  name: "David Kim",        title: "Frontend Engineer",     department: "Engineering",      status: "active"     },
  { id: "9",  name: "Olivia Turner",    title: "Finance Analyst",       department: "Finance",          status: "active"     },
  { id: "10", name: "Rajan Mehta",      title: "Backend Engineer",      department: "Engineering",      status: "active"     },
  { id: "11", name: "Chloe Dupont",     title: "Content Strategist",    department: "Marketing",        status: "inactive"   },
  { id: "12", name: "Ethan Brooks",     title: "QA Engineer",           department: "Engineering",      status: "active"     },
  { id: "13", name: "Sofia Andersen",   title: "Legal Counsel",         department: "Legal",            status: "active"     },
  { id: "14", name: "Lucas Ferreira",   title: "Customer Success",      department: "Customer Support", status: "onleave"    },
  { id: "15", name: "Hannah Müller",    title: "Operations Manager",    department: "Operations",       status: "active"     },
  { id: "16", name: "Kevin Zhao",       title: "Data Scientist",        department: "Engineering",      status: "active"     },
  { id: "17", name: "Fatima Al-Hassan", title: "Recruiter",             department: "HR",               status: "active"     },
  { id: "18", name: "Daniel Park",      title: "Account Executive",     department: "Sales",            status: "terminated" },
  { id: "19", name: "Elena Russo",      title: "Brand Designer",        department: "Design",           status: "active"     },
  { id: "20", name: "Chris Nwosu",      title: "Support Specialist",    department: "Customer Support", status: "active"     },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(DUMMY_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "onleave" | "terminated" | "all">("active");

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data: Employee[]) => {
        if (data?.length) setEmployees(data);
        setLoading(false);
      })
      .catch(() => {
        // API unavailable — dummy data already loaded, no error shown
        setLoading(false);
      });
  }, []);

  const filtered = employees
    .filter((e) => (filter === "all" ? true : filter === e.status))
    .filter((e) =>
      `${e.name} ${e.title ?? ""} ${e.department ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

  const stats = {
    active: employees.filter((e) => e.status === "active").length,
    onleave: employees.filter((e) => e.status === "onleave").length,
    total: employees.length,
    departments: Array.from(new Set(employees.map((e) => e.department).filter(Boolean))).length,
  };

  return (
    <div style={styles.page}>
      {/* Top KPI cards */}
      <div style={styles.topGrid}>
        <StatCard title="Active Employees" value="284" note="↑ 2 from last week" />
        <StatCard title="New Hires This Month" value="13" note="↑ 5 from last month" />
        <StatCard title="Avg. Tenure" value="3.2y" note="↑ 0.1y from last year" />
        <StatCard title="Departments" value="11" note="No change" />
      </div>

      {/* Main panel */}
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Employees</h2>
          <div style={styles.headerRight}>
            <div style={styles.searchWrap}>
              <input
                aria-label="Search employees"
                placeholder="Search employees..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button style={styles.searchBtn}>Search</button>
            </div>
            {/* ← Navigates to /employees/new */}
            <Link href="/employees/new">
              <button style={styles.newBtn}>+ New Employee</button>
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={styles.tabs}>
          {(["active", "inactive", "onleave", "terminated", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{ ...styles.tab, ...(filter === t ? styles.tabActive : {}) }}
            >
              {t === "active" ? "Active" : t === "inactive" ? "Inactive" : t === "onleave" ? "On Leave" : t === "terminated" ? "Terminated" : "All"}
            </button>
          ))}
        </div>

        {/* Inner stats */}
        <div style={styles.statsRow}>
          <SmallStat title="Active Employees" value={String(stats.active || 0)} />
          <SmallStat title="On Leave" value={String(stats.onleave || 0)} />
          <SmallStat title="Total Employees" value={String(stats.total || 0)} />
          <SmallStat title="Departments" value={String(stats.departments || 0)} />
        </div>

        {/* Employee cards */}
        <div style={{ marginTop: 18 }}>
          {loading ? (
            <div style={{ padding: 24 }}>Loading...</div>
          ) : (
            <>
              {filtered.length === 0 && !error && (
                <div style={{ padding: 24, color: "#666" }}>No employees found.</div>
              )}
              {filtered.length > 0 && (
                <div style={styles.grid}>
                  {filtered.map((emp) => (
                    <div key={emp.id} style={styles.card}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={styles.avatar}>{emp.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                          <div style={{ fontSize: 13, color: "#6b7280" }}>
                            {emp.title ?? "—"} · {emp.department ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StatusBadge status={emp.status} />
                        <button style={styles.smallBtn}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div style={{ color: "#c0392b", marginTop: 18, fontSize: 14, fontWeight: 500 }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value}</div>
      {note && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>{note}</div>}
    </div>
  );
}

function SmallStat({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.smallStat}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active:     { label: "Active",     color: "#059669", bg: "#ecfdf5" },
    inactive:   { label: "Inactive",   color: "#6b7280", bg: "#f3f4f6" },
    onleave:    { label: "On Leave",   color: "#d97706", bg: "#fffbeb" },
    terminated: { label: "Terminated", color: "#dc2626", bg: "#fef2f2" },
  };
  const s = map[status ?? ""] ?? { label: status ?? "—", color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 999 }}>
      {s.label}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  topGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 },
  statCard: {
    background: "#fff",
    padding: "22px 22px 20px",
    borderRadius: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  panel: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 24px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  panelTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  searchWrap: { display: "flex" },
  searchInput: {
    padding: "10px 14px",
    fontSize: 14,
    border: "1px solid #e5e7eb",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    outline: "none",
    width: 320,
    color: "#374151",
    background: "#fff",
    boxSizing: "border-box",
  },
  searchBtn: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
  },
  newBtn: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    display: "inline-block",
  },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: {
    padding: "7px 16px",
    fontSize: 14,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    color: "#374151",
    fontWeight: 500,
  },
  tabActive: { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a", fontWeight: 600 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 4 },
  smallStat: { background: "#fff", padding: "16px 18px", borderRadius: 10, border: "1px solid #f1f5f9" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 },
  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #f3f4f6",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 120,
    boxSizing: "border-box",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    color: "#166534",
    flexShrink: 0,
  },
  smallBtn: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    padding: "5px 12px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
  },
};