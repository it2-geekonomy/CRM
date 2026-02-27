export interface ConfigFormData {
  name: string;
  description: string;
  departmentId: string;
  billable: boolean;
  slaHours: string;
  status: "Active" | "Inactive";
  tasks: string;
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  billable: boolean;
  slaHours: string;
  status: "Active" | "Inactive";
  tasks: string;
}

export interface Department {
  id: string;
  name: string;
  configurations: Configuration[];
}