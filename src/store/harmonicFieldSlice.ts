import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HarmonicFieldState {
  selectedRoot: string | null;
  highlightedNote: string | null;
}

const initialState: HarmonicFieldState = {
  selectedRoot: null,
  highlightedNote: null,
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
  },
});

export const {
  setSelectedRoot,
  setHighlightedNote,
} = harmonicFieldSlice.actions;

export default harmonicFieldSlice.reducer;
