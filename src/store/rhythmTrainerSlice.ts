import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

export type NoteType = 'note' | 'rest';

export interface PlacedNote {
  id: string;
  type: NoteType;
  duration: NoteDuration;
  pitch: string;
  tabString: number | null;
  tabFret: number | null;
}

export interface Measure {
  id: string;
  notes: PlacedNote[];
}

export interface StaffRow {
  id: string;
  measures: Measure[];
}

export interface RhythmTrainerState {
  rows: StaffRow[];
  timeSignature: [number, number];
  tempo: number;
}

const MEASURES_PER_ROW = 4;

function createId(): string {
  return crypto.randomUUID();
}

function createEmptyMeasure(): Measure {
  return { id: createId(), notes: [] };
}

function createEmptyRow(): StaffRow {
  return {
    id: createId(),
    measures: Array.from({ length: MEASURES_PER_ROW }, createEmptyMeasure),
  };
}

const initialState: RhythmTrainerState = {
  rows: [createEmptyRow()],
  timeSignature: [4, 4],
  tempo: 60,
};

function findMeasure(state: RhythmTrainerState, measureId: string): Measure | undefined {
  for (const row of state.rows) {
    const measure = row.measures.find(m => m.id === measureId);
    if (measure) return measure;
  }
  return undefined;
}

const rhythmTrainerSlice = createSlice({
  name: 'rhythmTrainer',
  initialState,
  reducers: {
    addRow(state) {
      state.rows.push(createEmptyRow());
    },

    removeRow(state, action: PayloadAction<string>) {
      if (state.rows.length <= 1) return;
      state.rows = state.rows.filter(r => r.id !== action.payload);
    },

    addNoteToMeasure(state, action: PayloadAction<{
      measureId: string;
      note: Omit<PlacedNote, 'id'>;
    }>) {
      const measure = findMeasure(state, action.payload.measureId);
      if (!measure) return;
      measure.notes.push({ id: createId(), ...action.payload.note });
    },

    removeNoteFromMeasure(state, action: PayloadAction<{
      measureId: string;
      noteId: string;
    }>) {
      const measure = findMeasure(state, action.payload.measureId);
      if (!measure) return;
      measure.notes = measure.notes.filter(n => n.id !== action.payload.noteId);
    },

    updateNote(state, action: PayloadAction<{
      measureId: string;
      noteId: string;
      changes: Partial<Pick<PlacedNote, 'duration' | 'pitch' | 'type'>>;
    }>) {
      const measure = findMeasure(state, action.payload.measureId);
      if (!measure) return;
      const note = measure.notes.find(n => n.id === action.payload.noteId);
      if (!note) return;
      Object.assign(note, action.payload.changes);
    },

    updateTabInfo(state, action: PayloadAction<{
      measureId: string;
      noteId: string;
      tabString: number | null;
      tabFret: number | null;
    }>) {
      const measure = findMeasure(state, action.payload.measureId);
      if (!measure) return;
      const note = measure.notes.find(n => n.id === action.payload.noteId);
      if (!note) return;
      note.tabString = action.payload.tabString;
      note.tabFret = action.payload.tabFret;
    },

    reorderNotes(state, action: PayloadAction<{
      measureId: string;
      noteIds: string[];
    }>) {
      const measure = findMeasure(state, action.payload.measureId);
      if (!measure) return;
      const ordered: PlacedNote[] = [];
      for (const id of action.payload.noteIds) {
        const note = measure.notes.find(n => n.id === id);
        if (note) ordered.push(note);
      }
      measure.notes = ordered;
    },

    setTempo(state, action: PayloadAction<number>) {
      state.tempo = action.payload;
    },

    resetPartiture(state) {
      state.rows = [createEmptyRow()];
      state.tempo = 60;
    },
  },
});

export const {
  addRow,
  removeRow,
  addNoteToMeasure,
  removeNoteFromMeasure,
  updateNote,
  updateTabInfo,
  reorderNotes,
  setTempo,
  resetPartiture,
} = rhythmTrainerSlice.actions;

export default rhythmTrainerSlice.reducer;
