/**
 * Data for "Page Link" in SideBar and other UI elements
 */
export type LinkToPage = {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  title?: string;
  subtitle?: string;
  children?: Array<LinkToPage>;
};
