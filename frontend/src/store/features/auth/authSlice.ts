import type { LoginResponse } from "@/store/api/authApiSlice";
import { localStorageDelete, localStorageGet, localStorageSet } from "@/utils/localStorage";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const CURRENT_USER_KEY = "currentUser";
const IS_AUTHENTICATED_KEY = "isAuthenticated";
const PROFILE_ID_KEY = "profileId";

const storedUser =
  typeof window !== "undefined" ? (localStorageGet(CURRENT_USER_KEY) as LoginResponse | null) : null;
const storedIsAuthenticated =
  typeof window !== "undefined" ? localStorageGet(IS_AUTHENTICATED_KEY) : null;
const storedProfileId =
  typeof window !== "undefined" ? (localStorageGet(PROFILE_ID_KEY) as string | null) : null;

export type CurrentUser = LoginResponse | null;

interface AuthState {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  /** Set when user has a student/teacher profile; used to show sidebar. Admin always sees sidebar. */
  profileId: string | null;
}

const initialState: AuthState = {
  currentUser: storedUser || null,
  isAuthenticated: !!storedIsAuthenticated,
  profileId: storedProfileId || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ currentUser: CurrentUser; isAuthenticated: boolean; profileId?: string | null }>) => {
      state.currentUser = action.payload.currentUser;
      state.isAuthenticated = action.payload.isAuthenticated;
      if (action.payload.profileId !== undefined) {
        state.profileId = action.payload.profileId;
      } else {
        state.profileId = null;
      }
      if (typeof window !== "undefined") {
        localStorageSet(CURRENT_USER_KEY, action.payload.currentUser);
        localStorageSet(IS_AUTHENTICATED_KEY, action.payload.isAuthenticated);
        if (action.payload.profileId !== undefined) {
          if (action.payload.profileId) {
            localStorageSet(PROFILE_ID_KEY, action.payload.profileId);
          } else {
            localStorageDelete(PROFILE_ID_KEY);
          }
        } else {
          localStorageDelete(PROFILE_ID_KEY);
        }
      }
    },
    setProfileId: (state, action: PayloadAction<string>) => {
      state.profileId = action.payload;
      if (typeof window !== "undefined") {
        localStorageSet(PROFILE_ID_KEY, action.payload);
      }
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.profileId = null;
      if (typeof window !== "undefined") {
        localStorageDelete(CURRENT_USER_KEY);
        localStorageDelete(IS_AUTHENTICATED_KEY);
        localStorageDelete(PROFILE_ID_KEY);
      }
    },
  },
});

export default authSlice.reducer;
export const { loginSuccess, logoutUser, setProfileId } = authSlice.actions;
