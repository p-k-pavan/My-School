import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: null,
    email: null,
    role: null,
};

const authReducer = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.department = action.payload.department;
        },
        logout: (state) => {
            state.name = null;
            state.email = null;
            state.role = null;
        },
    },
});

export const { login, logout } = authReducer.actions;
export default authReducer.reducer;
