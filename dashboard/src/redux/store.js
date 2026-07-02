import { configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
} from "redux-persist";
import storageModule from "redux-persist/lib/storage";

const storage = storageModule.default;
import { combineReducers } from "redux";

import authReducer from "./reducer/authReducer";
import { authApi } from "./api/auth";
import { admissionApi } from "./api/admissions";
import { classApi } from "./api/class";
import { teacherApi } from "./api/teacher";
import { parentApi } from "./api/parent";
import { studentApi } from "./api/student";
import { attendanceApi } from "./api/attendance";
import { subjectApi } from "./api/subject";
import { timetableApi } from "./api/timetable";
import { homeworkApi } from "./api/homework";
import { feeStructureApi } from "./api/feeStructure";
import { feeApi } from "./api/fee";
import { paymentApi } from "./api/payment";
import { feedApi } from "./api/feed";
import { dashboardApi } from "./api/dashboard";


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [admissionApi.reducerPath]:admissionApi.reducer,
  [classApi.reducerPath]:classApi.reducer,
  [teacherApi.reducerPath]:teacherApi.reducer,
  [parentApi.reducerPath]: parentApi.reducer,
  [studentApi.reducerPath]:studentApi.reducer,
  [attendanceApi.reducerPath]: attendanceApi.reducer,
  [subjectApi.reducerPath]: subjectApi.reducer,
  [timetableApi.reducerPath]: timetableApi.reducer,
  [homeworkApi.reducerPath]: homeworkApi.reducer,
  [feeStructureApi.reducerPath]: feeStructureApi.reducer,
  [feeApi.reducerPath]: feeApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [feedApi.reducerPath]: feedApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
});

const persistedReducer = persistReducer( persistConfig,rootReducer );

export const store =
  configureStore({
    reducer: persistedReducer,

    middleware: (
      getDefaultMiddleware
    ) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
          ],
        },
      })
      .concat(authApi.middleware)
      .concat(admissionApi.middleware)
      .concat(classApi.middleware)
      .concat(teacherApi.middleware)
      .concat(parentApi.middleware)
      .concat(studentApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(subjectApi.middleware)
      .concat(timetableApi.middleware)
      .concat(homeworkApi.middleware)
      .concat(feeStructureApi.middleware)
      .concat(feeApi.middleware)
      .concat(paymentApi.middleware)
      .concat(feedApi.middleware)
      .concat(dashboardApi.middleware)
  });

export const persistor = persistStore(store);