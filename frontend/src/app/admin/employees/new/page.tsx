"use client";

import React, { useState, useRef } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  employeeId: string;
  startDate: string;
  employmentType: string;
  salary: string;
  reportingTo: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  documents: File[];
};

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  title: "", department: "", employeeId: "", startDate: "",
  employmentType: "Full-time", salary: "", reportingTo: "",
  dob: "", gender: "", address: "", city: "", state: "", zip: "",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  documents: [],
};

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing",
  "Sales", "HR", "Finance", "Operations", "Legal", "Customer Support",
];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function NewEmployeePage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeFile = (i: number) =>
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const goBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const sections = ["Basic Info", "Job Details", "Personal Details", "Documents"];

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Employee Added!</h2>
          <p style={{ color: "#6b7280", margin: "0 0 28px" }}>
            {form.firstName} {form.lastName} has been successfully added to the system.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={styles.newBtn} onClick={goBack}>← Back to Employees</button>
            <button style={styles.outlineBtn} onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setActiveSection(0); }}>
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main page ── */
  return (
    <div style={styles.page}>

      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.breadcrumb}>
            <button onClick={goBack} style={styles.breadcrumbLink}>Employees</button>
            <span style={{ color: "#9ca3af", margin: "0 6px" }}>›</span>
            <span style={{ color: "#374151" }}>New Employee</span>
          </div>
          <h1 style={styles.pageTitle}>Add New Employee</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.outlineBtn} onClick={goBack}>Cancel</button>
          <button
            style={{ ...styles.newBtn, opacity: submitting ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </div>

      {/* Layout: sidebar + form */}
      <div style={styles.layout}>

        {/* Sidebar steps */}
        <div style={styles.sidebar}>
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSection(i)}
              style={{ ...styles.sidebarItem, ...(activeSection === i ? styles.sidebarItemActive : {}) }}
            >
              <span style={{ ...styles.sidebarNum, ...(activeSection === i ? styles.sidebarNumActive : {}) }}>
                {i + 1}
              </span>
              {s}
            </button>
          ))}
        </div>

        {/* Form panel */}
        <div style={styles.formPanel}>

          {/* Step 0 — Basic Info */}
          {activeSection === 0 && (
            <div>
              <SectionHeader title="Basic Information" desc="Personal contact details for this employee." />
              <div style={styles.grid2}>
                <Field label="First Name" required>
                  <input style={styles.input} placeholder="e.g. Jane" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last Name" required>
                  <input style={styles.input} placeholder="e.g. Smith" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
              </div>
              <div style={styles.grid2}>
                <Field label="Work Email" required>
                  <input style={styles.input} type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Phone Number">
                  <input style={styles.input} placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
              </div>
              <NavRow right={<button style={styles.newBtn} onClick={() => setActiveSection(1)}>Next: Job Details →</button>} />
            </div>
          )}

          {/* Step 1 — Job Details */}
          {activeSection === 1 && (
            <div>
              <SectionHeader title="Job Details" desc="Role, department, and compensation information." />
              <div style={styles.grid2}>
                <Field label="Job Title" required>
                  <input style={styles.input} placeholder="e.g. Senior Engineer" value={form.title} onChange={(e) => set("title", e.target.value)} />
                </Field>
                <Field label="Department" required>
                  <select style={styles.input} value={form.department} onChange={(e) => set("department", e.target.value)}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div style={styles.grid2}>
                <Field label="Employee ID">
                  <input style={styles.input} placeholder="e.g. EMP-0042" value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} />
                </Field>
                <Field label="Start Date" required>
                  <input style={styles.input} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </Field>
              </div>
              <div style={styles.grid2}>
                <Field label="Employment Type">
                  <select style={styles.input} value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Annual Salary (USD)">
                  <input style={styles.input} placeholder="e.g. 95000" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
                </Field>
              </div>
              <Field label="Reporting To">
                <input style={styles.input} placeholder="Manager name" value={form.reportingTo} onChange={(e) => set("reportingTo", e.target.value)} />
              </Field>
              <NavRow
                left={<button style={styles.outlineBtn} onClick={() => setActiveSection(0)}>← Basic Info</button>}
                right={<button style={styles.newBtn} onClick={() => setActiveSection(2)}>Next: Personal Details →</button>}
              />
            </div>
          )}

          {/* Step 2 — Personal Details */}
          {activeSection === 2 && (
            <div>
              <SectionHeader title="Personal Details" desc="Address, date of birth, and emergency contact." />
              <div style={styles.grid2}>
                <Field label="Date of Birth">
                  <input style={styles.input} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select style={styles.input} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="">Select</option>
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Street Address">
                <input style={styles.input} placeholder="123 Main St" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <div style={styles.grid3}>
                <Field label="City">
                  <input style={styles.input} placeholder="New York" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
                <Field label="State">
                  <input style={styles.input} placeholder="NY" value={form.state} onChange={(e) => set("state", e.target.value)} />
                </Field>
                <Field label="ZIP Code">
                  <input style={styles.input} placeholder="10001" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                </Field>
              </div>

              <div style={styles.divider} />
              <SectionHeader title="Emergency Contact" desc="Who to contact in case of an emergency." />
              <div style={styles.grid2}>
                <Field label="Contact Name">
                  <input style={styles.input} placeholder="Full name" value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} />
                </Field>
                <Field label="Relationship">
                  <input style={styles.input} placeholder="e.g. Spouse, Parent" value={form.emergencyRelation} onChange={(e) => set("emergencyRelation", e.target.value)} />
                </Field>
              </div>
              <Field label="Contact Phone">
                <input style={styles.input} placeholder="+1 (555) 000-0000" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} />
              </Field>
              <NavRow
                left={<button style={styles.outlineBtn} onClick={() => setActiveSection(1)}>← Job Details</button>}
                right={<button style={styles.newBtn} onClick={() => setActiveSection(3)}>Next: Documents →</button>}
              />
            </div>
          )}

          {/* Step 3 — Documents */}
          {activeSection === 3 && (
            <div>
              <SectionHeader title="Documents" desc="Upload ID, contracts, or any onboarding files." />
              <div
                style={styles.dropZone}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setForm((prev) => ({
                    ...prev,
                    documents: [...prev.documents, ...Array.from(e.dataTransfer.files)],
                  }));
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>📎</div>
                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>PDF, DOC, DOCX, JPG, PNG — up to 10MB each</div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFiles}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              {form.documents.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  {form.documents.map((f, i) => (
                    <div key={i} style={styles.fileRow}>
                      <span style={{ fontSize: 20, marginRight: 10 }}>
                        {f.name.match(/\.pdf$/i) ? "📄" : f.name.match(/\.(jpg|jpeg|png)$/i) ? "🖼️" : "📝"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button onClick={() => removeFile(i)} style={styles.removeBtn}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <NavRow
                left={<button style={styles.outlineBtn} onClick={() => setActiveSection(2)}>← Personal Details</button>}
                right={
                  <button
                    style={{ ...styles.newBtn, opacity: submitting ? 0.7 : 1 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "✓ Save Employee"}
                  </button>
                }
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</h3>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{desc}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={styles.label}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function NavRow({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={styles.navRow}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/* ── Styles ── */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  breadcrumb: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
  },
  breadcrumbLink: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#16a34a",
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
  },
  layout: {
    display: "flex",
    gap: 18,
    alignItems: "flex-start",
  },
  sidebar: {
    width: 200,
    background: "#fff",
    borderRadius: 14,
    padding: "12px 8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
    flexShrink: 0,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    textAlign: "left" as const,
    marginBottom: 2,
    fontFamily: "inherit",
  },
  sidebarItemActive: {
    background: "#f0fdf4",
    color: "#16a34a",
    fontWeight: 600,
  },
  sidebarNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    flexShrink: 0,
  },
  sidebarNumActive: {
    background: "#16a34a",
    color: "#fff",
  },
  formPanel: {
    flex: 1,
    background: "#fff",
    borderRadius: 14,
    padding: "28px 28px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    outline: "none",
    color: "#111827",
    background: "#fff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #f3f4f6",
  },
  newBtn: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  outlineBtn: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    background: "#fff",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  divider: {
    borderTop: "1px solid #f3f4f6",
    margin: "24px 0",
  },
  dropZone: {
    border: "2px dashed #d1fae5",
    borderRadius: 12,
    padding: "44px 20px",
    textAlign: "center" as const,
    cursor: "pointer",
    background: "#f9fafb",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    border: "1px solid #f1f5f9",
    borderRadius: 8,
    marginBottom: 8,
    background: "#fff",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: 14,
    padding: 4,
    borderRadius: 4,
    fontFamily: "inherit",
  },
  successCard: {
    background: "#fff",
    borderRadius: 14,
    padding: 48,
    maxWidth: 520,
    margin: "80px auto",
    textAlign: "center" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    fontSize: 28,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
};