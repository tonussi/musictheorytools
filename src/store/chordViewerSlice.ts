import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChordViewerState {
  selectedRoot: string;
  selectedQuality: string;
  overlayOpen: boolean;
}

const initialState: ChordViewerState = {
  selectedRoot: 'C',
  selectedQuality: 'major',
  overlayOpen: false,
};

const chordViewerSlice = createSlice({
  name: 'chordViewer',
  initialState,
  reducers: {
    setSelectedRoot(state, action: PayloadAction<string>) {
      state.selectedRoot = action.payload;
    },
    setSelectedQuality(state, action: PayloadAction<string>) {
      state.selectedQuality = action.payload;
    },
    setOverlayOpen(state, action: PayloadAction<boolean>) {
      state.overlayOpen = action.payload;
    },
    toggleOverlay(state) {
      state.overlayOpen = !state.overlayOpen;
    },
  },
});

export const {
  setSelectedRoot,
  setSelectedQuality,
  setOverlayOpen,
  toggleOverlay,
} = chordViewerSlice.actions;

export default chordViewerSlice.reducer;
