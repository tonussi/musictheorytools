import { NoteDuration, NoteType } from '../../store/rhythmTrainerSlice';

export interface PaletteItem {
  duration: NoteDuration;
  type: NoteType;
  label: string;
  symbol: string;
}

export const NOTE_PALETTE_ITEMS: PaletteItem[] = [
  { duration: 'whole', type: 'note', label: 'Whole', symbol: '𝅝' },
  { duration: 'half', type: 'note', label: 'Half', symbol: '𝅗𝅥' },
  { duration: 'quarter', type: 'note', label: 'Quarter', symbol: '♩' },
  { duration: 'eighth', type: 'note', label: 'Eighth', symbol: '♪' },
  { duration: 'sixteenth', type: 'note', label: '16th', symbol: '𝅘𝅥𝅯' },
];

export const REST_PALETTE_ITEMS: PaletteItem[] = [
  { duration: 'whole', type: 'rest', label: 'Whole', symbol: '𝄻' },
  { duration: 'half', type: 'rest', label: 'Half', symbol: '𝄼' },
  { duration: 'quarter', type: 'rest', label: 'Quarter', symbol: '𝄽' },
  { duration: 'eighth', type: 'rest', label: 'Eighth', symbol: '𝄾' },
  { duration: 'sixteenth', type: 'rest', label: '16th', symbol: '𝄿' },
];

export const TREBLE_STAFF_PITCHES = [
  'F5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4',
] as const;

export const STAFF_LINE_PITCHES = ['F5', 'D5', 'B4', 'G4', 'E4'] as const;

export const STAFF_SPACE_PITCHES = ['E5', 'C5', 'A4', 'F4'] as const;

export const LEDGER_LINE_PITCHES_ABOVE = ['A5', 'G5'] as const;
export const LEDGER_LINE_PITCHES_BELOW = ['D4', 'C4'] as const;

const PITCH_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export function pitchToStaffPosition(pitch: string): number {
  const noteName = pitch.slice(0, -1);
  const octave = parseInt(pitch.slice(-1), 10);

  const noteIndex = PITCH_NAMES.indexOf(noteName as typeof PITCH_NAMES[number]);
  if (noteIndex === -1) return 0;

  const middleCPosition = 10;
  const stepsFromC4 = (octave - 4) * 7 + noteIndex;

  return middleCPosition - stepsFromC4;
}

export function staffPositionToPitch(position: number): string {
  const middleCPosition = 10;
  const stepsFromC4 = middleCPosition - position;

  const octave = 4 + Math.floor(stepsFromC4 / 7);
  const noteIndex = ((stepsFromC4 % 7) + 7) % 7;

  return `${PITCH_NAMES[noteIndex]}${octave}`;
}

export const GUITAR_STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;
export const GUITAR_STRING_COUNT = 6;

export const STAFF_LINE_SPACING = 10;
export const STAFF_TOP_PADDING = 30;
export const STAFF_HEIGHT = STAFF_LINE_SPACING * 4 + STAFF_TOP_PADDING * 2;
export const TAB_LINE_SPACING = 12;
export const TAB_TOP_PADDING = 20;
export const TAB_HEIGHT = TAB_LINE_SPACING * 5 + TAB_TOP_PADDING * 2;
export const NOTE_SLOT_WIDTH = 40;
export const MEASURE_MIN_WIDTH = 180;
export const CLEF_WIDTH = 40;
export const TIME_SIG_WIDTH = 30;

export const DURATION_BEAT_VALUES: Record<NoteDuration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};
