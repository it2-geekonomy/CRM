"use client";

export default function TeamConfigurationPage() {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Team Configuration
          </h1>
          <p className="text-gray-500 mt-2">
            Add and manage team members, roles, and resource allocation
          </p>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* Profile Photo */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Profile Photo
            </p>

            <label
              htmlFor="profile-photo"
              className="
                w-28 h-28 rounded-full border-2 border-dashed border-gray-300
                flex flex-col items-center justify-center
                text-center cursor-pointer
                hover:border-green-500 transition
              "
            >
              <div className="text-2xl mb-1">👤</div>
              <span className="text-xs text-gray-500">
                Upload Photo
              </span>

              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-400 mt-3">
              Recommended size: 200×200px, PNG or JPG
            </p>
          </div>

          {/* FORM */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue="Rajesh"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue="Kumar"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                defaultValue="rajesh.kumar@geekonomy.com"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                type="text"
                defaultValue="EMP-001"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-generated if left blank
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Date of Joining
              </label>
              <input
                type="date"
                defaultValue="2024-01-15"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

          </div>
        </div>

{/* ROLE & DEPARTMENT */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">

  {/* Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Role & Department
    </h2>
  </div>

  {/* FORM */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Department */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Department <span className="text-red-500">*</span>
      </label>
      <select
        defaultValue="Design"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Design</option>
        <option>Engineering</option>
        <option>Marketing</option>
        <option>Sales</option>
      </select>
    </div>

    {/* Job Title */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Job Title <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        defaultValue="Lead Designer"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                   focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* Role Type */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Role Type
      </label>
      <select
        defaultValue="Full-time"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
        <option>Intern</option>
      </select>
    </div>

    {/* Reporting Manager */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Reporting Manager
      </label>
      <select
        defaultValue="Arjun Sindhia"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Arjun Sindhia</option>
        <option>Sanketh M</option>
        <option>Sumukh B</option>
      </select>
    </div>

    {/* Experience Level */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Experience Level
      </label>
      <select
        defaultValue="Senior (5–10 years)"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Junior (0–2 years)</option>
        <option>Mid (2–5 years)</option>
        <option>Senior (5–10 years)</option>
        <option>Lead (10+ years)</option>
      </select>
    </div>

    {/* Location */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Location
      </label>
      <select
        defaultValue="Mumbai Office"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Mumbai Office</option>
        <option>Bangalore Office</option>
        <option>Remote</option>
      </select>
    </div>

  </div>
</div>
{/* SKILLS & EXPERTISE */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">

  {/* Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Skills & Expertise
    </h2>
  </div>

  <div className="mt-6 space-y-6">

    {/* Primary Skills */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Primary Skills
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-gray-300">
        {["UI/UX Design", "Figma", "Adobe XD", "Prototyping"].map((skill) => (
          <span
            key={skill}
            className="
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-sm text-gray-700
              bg-gray-100 border border-gray-200
            "
          >
            {skill}
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder="Add skill..."
          className="flex-1 min-w-[120px] outline-none text-sm text-gray-700"
        />
      </div>
    </div>

    {/* Secondary Skills */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Secondary Skills
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-gray-300">
        {["HTML/CSS", "JavaScript", "Illustration"].map((skill) => (
          <span
            key={skill}
            className="
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-sm text-gray-700
              bg-gray-100 border border-gray-200
            "
          >
            {skill}
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder="Add skill..."
          className="flex-1 min-w-[120px] outline-none text-sm text-gray-700"
        />
      </div>
    </div>

  </div>
</div>
{/* WORK CAPACITY & AVAILABILITY */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">

  {/* Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Work Capacity & Availability
    </h2>
  </div>

  {/* FORM */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Working Hours per Week */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Working Hours per Week
      </label>
      <input
        type="number"
        defaultValue="40"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                   focus:ring-2 focus:ring-green-500 outline-none"
      />
      <p className="text-xs text-gray-400 mt-1">
        Standard full-time is 40 hours
      </p>
    </div>

    {/* Hourly Rate */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Hourly Rate
      </label>
      <input
        type="text"
 className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                   focus:ring-2 focus:ring-green-500 outline-none"
        defaultValue="₹2000"
      />
      <p className="text-xs text-gray-400 mt-1">
        For internal cost calculation
      </p>
    </div>

    {/* Max Concurrent Projects */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Maximum Concurrent Projects
      </label>
      <input
        type="number"
        defaultValue="3"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                   focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* Current Workload */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Current Workload
      </label>
      <select
        defaultValue="Moderate (50–75%)"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>Low (0–25%)</option>
        <option>Light (25–50%)</option>
        <option>Moderate (50–75%)</option>
        <option>Heavy (75–100%)</option>
      </select>
    </div>

    {/* Working Days */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Working Days
      </label>

      <div className="mt-3 flex flex-wrap gap-3">
        {[
          { label: "Mon", checked: true },
          { label: "Tue", checked: true },
          { label: "Wed", checked: true },
          { label: "Thu", checked: true },
          { label: "Fri", checked: true },
          { label: "Sat", checked: false },
          { label: "Sun", checked: false },
        ].map((day) => (
          <label
            key={day.label}
            className="
              flex items-center gap-2 px-3 py-2
              rounded-lg border border-gray-300
              text-sm cursor-pointer
            "
          >
            <input
              type="checkbox"
              defaultChecked={day.checked}
              className="accent-green-600"
            />
            {day.label}
          </label>
        ))}
      </div>
    </div>

    {/* Time Zone */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Time Zone
      </label>
      <select
        defaultValue="IST (UTC+5:30)"
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                   focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option>IST (UTC+5:30)</option>
        <option>UTC</option>
        <option>EST (UTC−5)</option>
        <option>PST (UTC−8)</option>
      </select>
    </div>

  </div>
</div>
{/* ACCESS & PERMISSIONS */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">

  {/* Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Access & Permissions
    </h2>
  </div>

  {/* User Role */}
  <div className="mt-6">
    <label className="text-sm font-medium text-gray-700">
      User Role
    </label>
    <select
      defaultValue="Team Member"
      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                 focus:ring-2 focus:ring-green-500 outline-none"
    >
      <option>Admin</option>
      <option>Project Manager</option>
      <option>Team Member</option>
      <option>Viewer</option>
    </select>
    <p className="text-xs text-gray-400 mt-1">
      Determines access level and permissions
    </p>
  </div>

  {/* Permissions */}
  <div className="mt-6 space-y-3">

    {[
      { label: "Can Create Projects", checked: true },
      { label: "Can Manage Clients", checked: true },
      { label: "Can Track Time", checked: true },
      { label: "Can View Reports", checked: true },
      { label: "Can Access Billing", checked: false },
    ].map((perm) => (
      <label
        key={perm.label}
        className="
          flex items-center gap-3
          px-4 py-3 rounded-xl
          border border-gray-200
          cursor-pointer
        "
      >
        <input
          type="checkbox"
          defaultChecked={perm.checked}
          className="accent-green-600 w-4 h-4"
        />
        <span className="text-sm text-gray-800">
          {perm.label}
        </span>
      </label>
    ))}

  </div>
</div>
{/* ADDITIONAL INFORMATION */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">

  {/* Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Additional Information
    </h2>
  </div>

  {/* Emergency Contact */}
  <div className="mt-6">
    <label className="text-sm font-medium text-gray-700">
      Emergency Contact
    </label>
    <input
      type="text"
      defaultValue="Priya Kumar - +91 98765 12345"
      className="
        mt-2 w-full px-4 py-3 rounded-xl
        border border-gray-300
        focus:ring-2 focus:ring-green-500 outline-none
      "
    />
  </div>

  {/* Notes */}
  <div className="mt-6">
    <label className="text-sm font-medium text-gray-700">
      Notes
    </label>
    <textarea
      rows={4}
      defaultValue="Expert in design systems and branding projects. Prefers morning meetings. Available for international client calls."
      className="
        mt-2 w-full px-4 py-3 rounded-xl
        border border-gray-300
        focus:ring-2 focus:ring-green-500 outline-none
        resize-none
      "
    />
  </div>

</div>
{/* ACTION BUTTONS */}
<div className="mt-12 pt-6 border-t border-gray-200 flex justify-end gap-4">

  {/* Cancel */}
  <button
    type="button"
    className="
      px-6 py-2.5 rounded-xl
      border border-gray-300
      bg-white text-gray-700
      hover:bg-gray-50 transition
    "
  >
    Cancel
  </button>

  {/* Save as Draft */}
  <button
    type="button"
    className="
      px-6 py-2.5 rounded-xl
      border border-gray-300
      bg-white text-gray-700
      hover:bg-gray-50 transition
    "
  >
    Save as Draft
  </button>

  {/* Save Team Member */}
  <button
    type="button"
    className="
      px-6 py-2.5 rounded-xl
      bg-green-600 text-white font-medium
      hover:bg-green-700 transition
    "
  >
    Save Team Member
  </button>

</div>


      </div>
    </div>
  );
}
