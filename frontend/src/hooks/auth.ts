import { useAppSelector } from "@/store/hooks";

export function useIsAuthenticated(): boolean {
  return useAppSelector((s) => s.auth.isAuthenticated);
}
