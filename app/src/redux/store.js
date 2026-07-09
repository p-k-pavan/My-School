import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import authReducer from "./reducer/authReducer";
import { authApi } from "./api/auth";
import { parentApi } from "./api/parent";
import { timetableApi } from "./api/timetable";
import { homeworkApi } from "./api/homework";
import { studentApi } from "./api/student";
import { teacherApi } from "./api/teacher";
import { feesApi } from "./api/fees";
import { attendanceApi } from "./api/attendance";
import { feedApi } from "./api/feed"

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [parentApi.reducerPath]: parentApi.reducer,
  [timetableApi.reducerPath]: timetableApi.reducer,
  [homeworkApi.reducerPath]: homeworkApi.reducer,
  [studentApi.reducerPath]: studentApi.reducer,
  [teacherApi.reducerPath]: teacherApi.reducer,
  [feesApi.reducerPath]: feesApi.reducer,
  [attendanceApi.reducerPath]: attendanceApi.reducer,
  [feedApi.reducerPath]: feedApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
        ],
      },
    }).concat(authApi.middleware)
      .concat(parentApi.middleware)
      .concat(timetableApi.middleware)
      .concat(homeworkApi.middleware)
      .concat(studentApi.middleware)
      .concat(teacherApi.middleware)
      .concat(feesApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(feedApi.middleware)

});

export const persistor = persistStore(store);