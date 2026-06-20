const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const GUITAR_OPEN_NOTES = [4, 9, 2, 7, 11, 4];

export interface ChordVoicing {
  frets: number[];
  fingers: number[];
  startFret: number;
}

function noteIdx(note: string): number {
  return CHROMATIC.indexOf(note as typeof CHROMATIC[number]);
}

function rootFretOnString(root: string, stringOpenNote: number): number {
  return (noteIdx(root) - stringOpenNote + 12) % 12;
}

export function getNoteAtFret(stringIndex: number, fret: number): string {
  return CHROMATIC[(GUITAR_OPEN_NOTES[stringIndex] + fret) % 12];
}

interface ShapeTemplate {
  stringRoot: 5 | 6;
  offsets: number[];
  fingers: number[];
}

interface QualityConfig {
  shapes: ShapeTemplate[];
  overrides?: Record<string, { frets: number[]; fingers: number[] }>;
}

const QUALITY_CONFIGS: Record<string, QualityConfig> = {
  major: {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1] },
    ],
    overrides: {
      'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
      'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
      'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
      'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
      'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 2, 3, 4, 0] },
    },
  },
  minor: {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1] },
    ],
    overrides: {
      'D': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
      'E': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
      'A': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    },
  },
  '7': {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 0, 2, 0], fingers: [0, 1, 3, 1, 4, 1] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
      'B': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
      'C': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
      'D': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
      'E': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
      'G': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    },
  },
  maj7: {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 1, 1, 0, 0], fingers: [1, 3, 2, 2, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 1, 2, 0], fingers: [0, 1, 3, 2, 4, 1] },
    ],
    overrides: {
      'C': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
      'D': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },
      'E': { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
      'G': { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
      'A': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
    },
  },
  min7: {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
      'D': { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
      'E': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    },
  },
  dim: {
    shapes: [
      { stringRoot: 5, offsets: [-1, 0, 1, 2, 1, -1], fingers: [0, 1, 2, 4, 3, 0] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0] },
    },
  },
  aug: {
    shapes: [
      { stringRoot: 6, offsets: [0, 3, 2, 1, 1, 0], fingers: [1, 4, 3, 2, 1, 1] },
    ],
    overrides: {
      'E': { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 2, 1, 0] },
    },
  },
  sus2: {
    shapes: [
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 0, 0], fingers: [0, 1, 3, 4, 1, 1] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
      'D': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
      'E': { frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0] },
    },
  },
  sus4: {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1] },
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 3, 0], fingers: [0, 1, 2, 3, 4, 1] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 4, 0] },
      'D': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
      'E': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },
    },
  },
  add9: {
    shapes: [
      { stringRoot: 6, offsets: [0, -1, 2, 1, 0, 2], fingers: [1, 0, 3, 2, 1, 4] },
    ],
    overrides: {
      'C': { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
      'E': { frets: [0, -1, 2, 1, 0, 2], fingers: [0, 0, 3, 2, 0, 4] },
      'G': { frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3] },
    },
  },
  '6': {
    shapes: [
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 2, 2], fingers: [0, 1, 3, 3, 3, 3] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1] },
      'C': { frets: [-1, 3, 2, 2, 1, 0], fingers: [0, 4, 3, 2, 1, 0] },
      'D': { frets: [-1, -1, 0, 2, 0, 2], fingers: [0, 0, 0, 2, 0, 1] },
      'E': { frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0] },
      'G': { frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0] },
    },
  },
  min6: {
    shapes: [
      { stringRoot: 5, offsets: [-1, 0, 2, 2, 1, 2], fingers: [0, 1, 2, 3, 1, 4] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 2, 1, 2], fingers: [0, 0, 2, 3, 1, 4] },
      'D': { frets: [-1, -1, 0, 2, 0, 1], fingers: [0, 0, 0, 2, 0, 1] },
      'E': { frets: [0, 2, 2, 0, 2, 0], fingers: [0, 2, 3, 0, 4, 0] },
    },
  },
  '9': {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 1, 0, 2], fingers: [1, 3, 1, 2, 1, 4] },
    ],
    overrides: {
      'E': { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
    },
  },
  dim7: {
    shapes: [],
  },
  '7#9': {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 1, 3, 3], fingers: [1, 3, 1, 2, 4, 4] },
    ],
    overrides: {
      'E': { frets: [0, 2, 0, 1, 3, 3], fingers: [0, 2, 0, 1, 3, 4] },
    },
  },
  '7(13)': {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 1, 0, 2], fingers: [1, 3, 1, 2, 1, 4] },
    ],
    overrides: {
      'E': { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
      'G': { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2] },
      'A': { frets: [-1, 0, 2, 0, 2, 2], fingers: [0, 0, 2, 0, 3, 4] },
    },
  },
  '13': {
    shapes: [
      { stringRoot: 6, offsets: [0, -1, 0, 1, 2, 2], fingers: [1, 0, 1, 2, 3, 4] },
    ],
    overrides: {
      'G': { frets: [3, -1, 0, 0, 0, 0], fingers: [2, 0, 0, 0, 0, 0] },
      'A': { frets: [-1, 0, 2, 0, 2, 2], fingers: [0, 0, 1, 0, 2, 3] },
    },
  },
  '6(9)': {
    shapes: [
      { stringRoot: 5, offsets: [-1, 0, 2, 1, 2, 2], fingers: [0, 1, 3, 2, 4, 4] },
    ],
    overrides: {
      'C': { frets: [-1, 3, 2, 2, 3, 0], fingers: [0, 2, 1, 1, 3, 0] },
      'A': { frets: [-1, 0, 4, 4, 2, 2], fingers: [0, 0, 3, 4, 1, 1] },
    },
  },
  '7(11)': {
    shapes: [
      { stringRoot: 6, offsets: [0, 2, 0, 1, 0, 1], fingers: [1, 3, 1, 2, 1, 1] },
    ],
    overrides: {
      'A': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    },
  },
};

function getDim7Voicing(root: string): ChordVoicing {
  const rootOnString2 = (noteIdx(root) - 11 + 12) % 12;
  const n = rootOnString2;
  const frets = [-1, -1, n, n + 1, n, n + 1];
  const hasOpen = n === 0;
  const fingers = hasOpen
    ? [0, 0, 0, 2, 0, 1]
    : [0, 0, 1, 3, 2, 4];
  return { frets, fingers, startFret: computeStartFret(frets) };
}

function computeStartFret(frets: number[]): number {
  const hasOpen = frets.some(f => f === 0);
  if (hasOpen) return 1;
  const fretted = frets.filter(f => f > 0);
  if (fretted.length === 0) return 1;
  const minFret = Math.min(...fretted);
  const maxFret = Math.max(...fretted);
  if (maxFret <= 5) return 1;
  return minFret;
}

export function getChordVoicing(root: string, quality: string): ChordVoicing {
  if (quality === 'dim7') {
    return getDim7Voicing(root);
  }

  const config = QUALITY_CONFIGS[quality];
  if (!config) {
    return getChordVoicing(root, 'major');
  }

  if (config.overrides?.[root]) {
    const ov = config.overrides[root];
    return {
      frets: ov.frets,
      fingers: ov.fingers,
      startFret: computeStartFret(ov.frets),
    };
  }

  let bestVoicing: ChordVoicing | null = null;
  let bestRootFret = Infinity;

  for (const shape of config.shapes) {
    const openNote = shape.stringRoot === 6 ? 4 : 9;
    const rFret = rootFretOnString(root, openNote);
    if (rFret === 0) continue;

    const frets = shape.offsets.map(o => o === -1 ? -1 : o + rFret);

    if (rFret < bestRootFret) {
      bestRootFret = rFret;
      bestVoicing = {
        frets,
        fingers: shape.fingers,
        startFret: rFret,
      };
    }
  }

  if (bestVoicing) return bestVoicing;

  const rFret = rootFretOnString(root, 4);
  return {
    frets: [rFret, rFret + 2, rFret + 2, rFret + 1, rFret, rFret],
    fingers: [1, 3, 4, 2, 1, 1],
    startFret: rFret || 1,
  };
}
