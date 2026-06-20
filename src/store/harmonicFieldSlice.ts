import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScaleMode = 'major' | 'minor';

interface HarmonicFieldState {
  selectedRoot: string | null;
  highlightedNote: string | null;
  scaleMode: ScaleMode;
}

const initialState: HarmonicFieldState = {
  selectedRoot: null,
  highlightedNote: null,
  scaleMode: 'major',
};

const harmonicFieldSlice = createSlice({
  name: 'harmonicField',
  initialState,
  reducers: {
    setSelectedRoot(state, action: PayloadAction<string | null>) {
      state.selectedRoot = action.payload;
    },
    setHighlightedNote(state, action: PayloadAction<string | null>) {
      state.highlightedNote = action.payload;
    },
    setScaleMode(state, action: PayloadAction<ScaleMode>) {
      state.scaleMode = action.payload;
    },
  },
});

export const {
  setSelectedRoot,
  setHighlightedNote,
  setScaleMode,
} = harmonicFieldSlice.actions;

export type { ScaleMode };

export default harmonicFieldSlice.reducer;
