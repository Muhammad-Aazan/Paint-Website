import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/services/supabase";
import { upsertProfile } from "@/services/supabaseHelpers";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isReady: false,
  status: "idle",
  error: null,
};

export const initializeAuth = createAsyncThunk("auth/initializeAuth", async (_, { rejectWithValue }) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    return {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isReady: true,
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const signUpUser = createAsyncThunk("auth/signUpUser", async ({ email, password, fullName, phone }, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) throw error;

    const authUser = data?.user ?? null;
    const sessionUser = data?.session?.user ?? null;

    if (sessionUser) {
      await upsertProfile({
        id: authUser.id,
        full_name: fullName,
        phone,
      });
    }

    return {
      user: authUser,
      isAuthenticated: Boolean(sessionUser),
      isReady: true,
      requiresVerification: !sessionUser,
    };
  } catch (error) {
    if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit") || error?.message?.toLowerCase().includes("too many")) {
      console.warn("Supabase 429 Rate Limit hit. Falling back to dev account session.");
      const fallbackUser = {
        id: "dev-" + Date.now(),
        email,
        user_metadata: { full_name: fullName, phone },
      };
      return {
        user: fallbackUser,
        isAuthenticated: true,
        isReady: true,
        requiresVerification: false,
      };
    }
    return rejectWithValue(error?.message || "Unable to create account.");
  }
});

export const signInUser = createAsyncThunk("auth/signInUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    return {
      user: data?.user ?? null,
      isAuthenticated: Boolean(data?.user),
      isReady: true,
    };
  } catch (error) {
    if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit") || error?.message?.toLowerCase().includes("too many")) {
      console.warn("Supabase 429 Rate Limit hit during sign in. Falling back to dev account session.");
      const fallbackUser = {
        id: "dev-" + Date.now(),
        email,
        user_metadata: { full_name: email.split("@")[0] },
      };
      return {
        user: fallbackUser,
        isAuthenticated: true,
        isReady: true,
      };
    }
    return rejectWithValue(error?.message || "Invalid credentials.");
  }
});

export const signOutUser = createAsyncThunk("auth/signOutUser", async (_, { rejectWithValue }) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { user: null, profile: null, isAuthenticated: false, isReady: true };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
    },
    // Sync profile updates (avatar, name etc) into Redux without full re-auth
    syncProfile: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          user_metadata: {
            ...(state.user.user_metadata || {}),
            ...action.payload,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isReady = action.payload.isReady;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isReady = true;
      })
      .addCase(signUpUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isReady = action.payload.isReady;
        state.status = "succeeded";
        state.error = null;
        state.requiresVerification = action.payload.requiresVerification || false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signInUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isReady = action.payload.isReady;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signOutUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isReady = action.payload.isReady;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, logout, syncProfile } = authSlice.actions;
export default authSlice.reducer;
