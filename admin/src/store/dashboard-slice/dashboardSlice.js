import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/axios";
import toast from "react-hot-toast";

// Async thunk to fetch dashboard data
export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async () => {
    const res = await axiosInstance.get("admin/dashboard", { withCredentials: true, });
    return res.data;
  }
);


export const fetchUserUploadStats = createAsyncThunk("dashboard/fetchUserUploadStats", async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("admin/userdata", {  withCredentials: true });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);


export const deleteUser = createAsyncThunk("userStats/deleteUser", async (userId, { rejectWithValue ,dispatch}) => {
    try {
      await axiosInstance.delete(`admin/deleteuser/${userId}`);
      toast.success("User deleted successfully");
      dispatch(fetchDashboardStats());
      dispatch(fetchUserUploadStats());
      return userId;
    } catch (error) {
      toast.error("Failed to delete user");
      return rejectWithValue(error.response.data);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    totalUploads: 0,
    totalStorageUsedMB: 0,
    recentUser: null,
    userCreationTimeline: [],
    status: "idle",
    userUploadStats: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalUploads = action.payload.totalUploads;
        state.totalStorageUsedMB = action.payload.totalStorageUsedMB;
        state.recentUser = action.payload.recentUser;
        state.userCreationTimeline = action.payload.userCreationTimeline;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchUserUploadStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserUploadStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userUploadStats = action.payload;
      })
      .addCase(fetchUserUploadStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
