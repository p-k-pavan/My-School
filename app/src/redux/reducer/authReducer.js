import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    selectedStudentId: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        login: (state, action) => {
            if (action.payload && typeof action.payload === "object" && "token" in action.payload) {
                state.user = action.payload.user;
                state.token = action.payload.token;
            } else {
                state.user = action.payload;
                state.token = null;
            }
            state.isAuthenticated = true;
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.selectedStudentId = null;
        },

        setSelectedStudentId: (state, action) => {
            state.selectedStudentId = action.payload;
        },
    },
});

export const { login, logout, setSelectedStudentId } = authSlice.actions;
export default authSlice.reducer;