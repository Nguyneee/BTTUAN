import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";

/**
 * Redux store — single source of truth for application state.
 * Currently contains: products (list, loading, error, selectedProduct)
 */
const store = configureStore({
  reducer: {
    products: productReducer,
  },
});

export default store;
