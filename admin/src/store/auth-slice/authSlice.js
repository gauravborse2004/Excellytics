import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/axios';
import { fetchDashboardStats, fetchUserUploadStats } from '../dashboard-slice/dashboardSlice';
import toast from 'react-hot-toast';
// BASE URL
const BASE_URL = "http://localhost:5001";

// Async Thunks

export const checkAuth = createAsyncThunk('admin/checkAuth', async (_, { rejectWithValue, dispatch}) => {
  try {
    const res = await axiosInstance.get("/admin/check");
    dispatch(fetchDashboardStats());
    dispatch(fetchUserUploadStats());
    return res.data;
  } catch (error) {
    console.error("Error in checkAuth: ", error);
    return rejectWithValue(null);
  }
});

export const login = createAsyncThunk('admin/login', async (data, { rejectWithValue, dispatch}) => {
  try {
    const res = await axiosInstance.post("/admin/login", data);
    dispatch(fetchDashboardStats());
    dispatch(fetchUserUploadStats());
    toast.success("Logged in successfully");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return rejectWithValue(error.response?.data);
  }
});

export const logout = createAsyncThunk('admin/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post("/admin/logout");
    toast.success("Logout successful");
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Logout failed");
    return rejectWithValue(error.response?.data);
  }
});



// Initial State

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
};

// Slice

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.authUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })

  },
});

export const { resetAuthState } = authSlice.actions;

export default authSlice.reducer;
