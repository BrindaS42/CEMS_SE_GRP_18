import { configureStore } from "@reduxjs/toolkit";
import mapAnnotatorReducer from "./map_annotator.slice.js";

const store = configureStore({
  reducer: {
    mapAnnotator: mapAnnotatorReducer,
  },
});

export default store;

