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
  });

export const persistor = persistStore(store);