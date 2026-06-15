import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CircleOfFifthsState {
  selectedIndex: number;
  wheelRotation: number;
  stripRoot: string | null;
}

const initialState: CircleOfFifthsState = {
  selectedIndex: 0,
  wheelRotation: 0,
  stripRoot: null,
};

const circleOfFifthsSlice = createSlice({
  name: 'circleOfFifths',
  initialState,
  reducers: {
    setSelectedIndex(state, action: PayloadAction<number>) {
      state.selectedIndex = action.payload;
    },
    setWheelRotation(state, action: PayloadAction<number>) {
      state.wheelRotation = action.payload;
    },
    setStripRoot(state, action: PayloadAction<string | null>) {
      state.stripRoot = action.payload;
    },
  },
});

export const {
  setSelectedIndex,
  setWheelRotation,
  setStripRoot,
} = circleOfFifthsSlice.actions;

export default circleOfFifthsSlice.reducer;
