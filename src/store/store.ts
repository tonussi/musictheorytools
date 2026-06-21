import { configureStore, combineReducers } from '@reduxjs/toolkit';
import chordViewerReducer from './chordViewerSlice';
import circleOfFifthsReducer from './circleOfFifthsSlice';
import harmonicFieldReducer from './harmonicFieldSlice';
import rhythmTrainerReducer from './rhythmTrainerSlice';
import { loadState, saveState } from './persistence';

const SAVE_DEBOUNCE_MS = 300;

const rootReducer = combineReducers({
  chordViewer: chordViewerReducer,
  circleOfFifths: circleOfFifthsReducer,
  harmonicField: harmonicFieldReducer,
  rhythmTrainer: rhythmTrainerReducer,
});

const preloadedState = loadState() as any;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: preloadedState || undefined,
});

let saveTimeout: ReturnType<typeof setTimeout>;

store.subscribe(() => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveState(store.getState());
  }, SAVE_DEBOUNCE_MS);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
