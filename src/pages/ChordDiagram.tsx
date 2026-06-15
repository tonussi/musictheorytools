import React, { useMemo } from 'react';
import { ChordVoicing, getNoteAtFret } from './chordVoicings';



const STRING_COUNT = 6;
const STRING_GAP = 28;
const FRET_GAP = 34;
const PAD_TOP = 32;
const PAD_BOTTOM = 28;
const PAD_LEFT = 30;
const PAD_RIGHT = 14;
const DOT_RADIUS = 10;
const NUT_THICKNESS = 4;
const MIN_DISPLAY_FRETS = 4;

const ROOT_COLOR = '#ec4899';
const TONE_COLOR = '#818cf8';
const STRING_COLOR = 'rgba(255, 255, 255, 0.35)';
const FRET_COLOR = 'rgba(255, 255, 255, 0.2)';
const NUT_COLOR = 'rgba(255, 255, 255, 0.85)';
const MARKER_COLOR = 'rgba(255, 255, 255, 0.55)';
const LABEL_COLOR = 'rgba(255, 255, 255, 0.5)';
const FRET_NUM_COLOR = 'rgba(196, 181, 253, 0.6)';

interface ChordDiagramProps {
  voicing: ChordVoicing;
  rootNote: string;
}



function isRootNote(stringIdx: number, fret: number, rootNote: string): boolean {
  if (fret < 0) return false;
  const noteAtPos = getNoteAtFret(stringIdx, fret);
  return noteAtPos === rootNote;
}

function detectBarre(voicing: ChordVoicing): { fret: number; fromString: number; toString: number } | null {
  const finger1Entries = voicing.fingers
    .map((f, i) => ({ finger: f, string: i, fret: voicing.frets[i] }))
    .filter(p => p.finger === 1 && p.fret > 0);

  if (finger1Entries.length < 2) return null;

  const fret = finger1Entries[0].fret;
  if (!finger1Entries.every(p => p.fret === fret)) return null;

  const strings = finger1Entries.map(p => p.string);
  return {
    fret,
    fromString: Math.min(...strings),
    toString: Math.max(...strings),
  };
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ voicing, rootNote }) => {
  const { frets, fingers, startFret } = voicing;

  const displayFrets = useMemo(() => {
    const fretted = frets.filter(f => f > 0);
    if (fretted.length === 0) return MIN_DISPLAY_FRETS;
    const maxFret = Math.max(...fretted);
    return Math.max(MIN_DISPLAY_FRETS, maxFret - startFret + 2);
  }, [frets, startFret]);

  const barre = useMemo(() => detectBarre(voicing), [voicing]);

  const showNut = startFret <= 1;

  const width = PAD_LEFT + (STRING_COUNT - 1) * STRING_GAP + PAD_RIGHT;
  const height = PAD_TOP + displayFrets * FRET_GAP + PAD_BOTTOM;

  const stringX = (i: number) => PAD_LEFT + i * STRING_GAP;
  const fretY = (fretIndex: number) => PAD_TOP + fretIndex * FRET_GAP;
  const dotY = (actualFret: number) => PAD_TOP + (actualFret - startFret + 0.5) * FRET_GAP;

  const fretDots = [3, 5, 7, 9, 12, 15, 17, 19, 21];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="chord-diagram-svg"
    >
      {/* Nut or top fret line */}
      {showNut ? (
        <rect
          x={stringX(0) - 1}
          y={fretY(0) - NUT_THICKNESS}
          width={(STRING_COUNT - 1) * STRING_GAP + 2}
          height={NUT_THICKNESS}
          fill={NUT_COLOR}
          rx={1}
        />
      ) : (
        <line
          x1={stringX(0)}
          y1={fretY(0)}
          x2={stringX(STRING_COUNT - 1)}
          y2={fretY(0)}
          stroke={FRET_COLOR}
          strokeWidth={1.5}
        />
      )}

      {/* Fret lines */}
      {Array.from({ length: displayFrets }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={stringX(0)}
          y1={fretY(i + 1)}
          x2={stringX(STRING_COUNT - 1)}
          y2={fretY(i + 1)}
          stroke={FRET_COLOR}
          strokeWidth={1}
        />
      ))}

      {/* Fret position dots (3, 5, 7, 9, 12...) */}
      {Array.from({ length: displayFrets }, (_, i) => {
        const actualFret = startFret + i;
        if (!fretDots.includes(actualFret)) return null;
        const cy = dotY(actualFret);
        const cx = width / 2;
        return (
          <circle
            key={`fdot-${i}`}
            cx={cx}
            cy={cy}
            r={3}
            fill="rgba(255, 255, 255, 0.06)"
          />
        );
      })}

      {/* String lines */}
      {Array.from({ length: STRING_COUNT }, (_, i) => (
        <line
          key={`str-${i}`}
          x1={stringX(i)}
          y1={fretY(0)}
          x2={stringX(i)}
          y2={fretY(displayFrets)}
          stroke={STRING_COLOR}
          strokeWidth={i >= 4 ? 1 : i >= 2 ? 1.3 : 1.6}
        />
      ))}

      {/* X / O markers above */}
      {frets.map((f, i) => {
        const cx = stringX(i);
        const cy = PAD_TOP - 14;

        if (f === -1) {
          return (
            <text
              key={`mark-${i}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill={MARKER_COLOR}
              fontSize="13"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              ×
            </text>
          );
        }

        if (f === 0) {
          return (
            <circle
              key={`mark-${i}`}
              cx={cx}
              cy={cy}
              r={5.5}
              fill="none"
              stroke={isRootNote(i, 0, rootNote) ? ROOT_COLOR : MARKER_COLOR}
              strokeWidth={1.8}
            />
          );
        }

        return null;
      })}

      {/* Barre bar */}
      {barre && (
        <rect
          x={stringX(barre.fromString) - DOT_RADIUS}
          y={dotY(barre.fret) - DOT_RADIUS * 0.55}
          width={(barre.toString - barre.fromString) * STRING_GAP + DOT_RADIUS * 2}
          height={DOT_RADIUS * 1.1}
          rx={DOT_RADIUS * 0.55}
          fill={isRootNote(barre.fromString, barre.fret, rootNote) ? ROOT_COLOR : TONE_COLOR}
          opacity={0.7}
        />
      )}

      {/* Finger dots */}
      {frets.map((f, i) => {
        if (f <= 0) return null;

        const cx = stringX(i);
        const cy = dotY(f);
        const isRoot = isRootNote(i, f, rootNote);

        const isBarrePosition = barre
          && f === barre.fret
          && fingers[i] === 1
          && i >= barre.fromString
          && i <= barre.toString;

        if (isBarrePosition) return null;

        return (
          <g key={`dot-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r={DOT_RADIUS}
              fill={isRoot ? ROOT_COLOR : TONE_COLOR}
            />
            {fingers[i] > 0 && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize="11"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
              >
                {fingers[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* Note labels below */}
      {frets.map((f, i) => {
        if (f === -1) return null;
        const noteName = getNoteAtFret(i, f);
        const isRoot = noteName === rootNote;
        return (
          <text
            key={`note-${i}`}
            x={stringX(i)}
            y={fretY(displayFrets) + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isRoot ? ROOT_COLOR : LABEL_COLOR}
            fontSize="11"
            fontWeight={isRoot ? '700' : '500'}
            fontFamily="Inter, sans-serif"
          >
            {noteName}
          </text>
        );
      })}

      {/* Fret number indicator (for non-open chords) */}
      {!showNut && (
        <text
          x={PAD_LEFT - 16}
          y={dotY(startFret)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={FRET_NUM_COLOR}
          fontSize="11"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {startFret}
        </text>
      )}
    </svg>
  );
};

export default ChordDiagram;
