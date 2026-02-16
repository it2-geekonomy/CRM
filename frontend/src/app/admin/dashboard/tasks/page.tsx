"use client";

import { useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import type { SlotInfo } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// Dummy events across different months and years (calendar works for any month/year)
type Task = {
    id: number;
    title: string;
    assignedTo: string;
    department: string;
    start: Date;
    end: Date;
    status: "Pending" | "Completed" | "In Progress";
  };
  
  const tasks: Task[] = [
    {
      id: 1,
      title: "Report Preparation",
      assignedTo: "Sarah",
      department: "Marketing",
      start: new Date(2026, 1, 14, 10, 0),
      end: new Date(2026, 1, 14, 17, 0),
      status: "Pending",
    },
    {
      id: 2,
      title: "Client Call",
      assignedTo: "Alex",
      department: "Sales",
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 10, 0),
      status: "Completed",
    },
    {
      id: 3,
      title: "Bug Fixing",
      assignedTo: "John",
      department: "Development",
      start: new Date(2026, 1, 18, 9, 0),
      end: new Date(2026, 1, 18, 11, 0),
      status: "In Progress",
    },
  ];
  

export default function TaskCalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState(Views.MONTH);

  const tasksForSelectedDate = selectedDate
    ? tasks.filter((task) =>
        moment(task.start).isSame(selectedDate, "day")
      )
    : [];

  const handleNavigate = (newDate: Date) => setCurrentDate(newDate);
  const handleSelectSlot = (slotInfo: SlotInfo) => setSelectedDate(slotInfo.start);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const yearRange = 10;
  const years = Array.from(
    { length: yearRange * 2 + 1 },
    (_, i) => new Date().getFullYear() - yearRange + i
  );
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const goToMonthYear = (month: number, year: number) => {
    setCurrentDate(new Date(year, month, 1));
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Task Calendar
          </h1>

          <div className="flex gap-4">
            <select className="px-4 py-2 border border-[#69AE44] rounded-lg bg-[#69AE44]/5 focus:ring-2 focus:ring-[#69AE44] outline-none">
              <option>Admin View</option>
              <option>Employee</option>
            </select>

            <button className="px-5 py-2.5 rounded-xl bg-[#69AE44] text-white hover:bg-[#5a9a3a]">
              + Add Task
            </button>
          </div>
        </div>

        {/* CALENDAR CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Month & Year jump */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Go to:</span>
            <select
              value={currentMonth}
              onChange={(e) => goToMonthYear(Number(e.target.value), currentYear)}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/5 text-sm focus:ring-2 focus:ring-[#69AE44] outline-none"
            >
              {monthNames.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => goToMonthYear(currentMonth, Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/5 text-sm focus:ring-2 focus:ring-[#69AE44] outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/10 text-sm text-gray-700 hover:bg-[#69AE44]/20"
            >
              Today
            </button>
          </div>

          <Calendar
            localizer={localizer}
            events={tasks}
            startAccessor="start"
            endAccessor="end"
            style={{ height: selectedDate ? 350 : 600 }}
            date={currentDate}
            onNavigate={handleNavigate}
            view={view}
            onView={setView}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            selectable
            onSelectSlot={handleSelectSlot}
            popup
          />

        </div>

        {/* TASK TABLE */}
        {selectedDate && (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
    <h2 className="text-xl font-semibold mb-6">
      Tasks for {moment(selectedDate).format("MMMM DD, YYYY")}
    </h2>

    {tasksForSelectedDate.length === 0 ? (
      <p className="text-gray-500">No tasks assigned</p>
    ) : (
      <table className="w-full text-sm">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-3 text-left">Title</th>
            <th className="text-left">Assigned To</th>
            <th className="text-left">Department</th>
            <th className="text-left">Start</th>
            <th className="text-left">End</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasksForSelectedDate.map((task) => (
            <tr key={task.id} className="border-b">
              <td className="py-3">{task.title}</td>
              <td>{task.assignedTo}</td>
              <td>{task.department}</td>
              <td>{moment(task.start).format("hh:mm A")}</td>
              <td>{moment(task.end).format("hh:mm A")}</td>
              <td>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : task.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

      </div>
    </div>
  );
}
