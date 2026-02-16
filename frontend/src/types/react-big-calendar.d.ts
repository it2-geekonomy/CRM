declare module "react-big-calendar" {
  import type { ComponentType } from "react";

  export interface Event {
    id?: string | number;
    title?: string;
    start?: Date;
    end?: Date;
    resource?: unknown;
  }

  export interface SlotInfo {
    start: Date;
    end: Date;
    action: "select" | "click" | "doubleClick";
  }

  export type View = "month" | "week" | "day" | "agenda" | "work_week";

  export const Calendar: ComponentType<{
    localizer: unknown;
    events?: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    style?: React.CSSProperties;
    views?: View[] | unknown[];
    view?: View | unknown;
    defaultView?: View | unknown;
    date?: Date;
    onNavigate?: (date: Date, view: View, action: string) => void;
    onView?: (view: View) => void;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    onSelectEvent?: (event: Event) => void;
    selectable?: boolean;
    popup?: boolean;
  }>;

  export const momentLocalizer: (moment: unknown) => unknown;
  export const Views: Record<string, string>;
}
