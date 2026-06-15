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
// import themeReducer from "./reducer/themeReducer";


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
//   theme: themeReducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
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
      .concat(authApi.middleware),
  });

export const persistor = persistStore(store);