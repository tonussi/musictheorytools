import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedRoot, setHighlightedNote } from '../store/harmonicFieldSlice';
import './HarmonicField.css';

/* ── Music theory data ── */

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Two full octaves of chromatic notes for the strip
const TWO_OCTAVES = [...CHROMATIC, ...CHROMATIC];

// Major scale intervals in semitones from root
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Degree info
const DEGREES: Array<{
  degree: number;
  qualityLabel: string;
  qualityPt: string;
  type: 'major' | 'minor' | 'diminished';
  triadIntervals: number[]; // semitones from degree root
  roman: string;
}> = [
  { degree: 1, qualityLabel: 'MAJOR',  qualityPt: 'MAIOR',  type: 'major',      triadIntervals: [0, 4, 7], roman: 'I' },
  { degree: 2, qualityLabel: 'MINOR',  qualityPt: 'MENOR',  type: 'minor',      triadIntervals: [0, 3, 7], roman: 'ii' },
  { degree: 3, qualityLabel: 'MINOR',  qualityPt: 'MENOR',  type: 'minor',      triadIntervals: [0, 3, 7], roman: 'iii' },
  { degree: 4, qualityLabel: 'MAJOR',  qualityPt: 'MAIOR',  type: 'major',      triadIntervals: [0, 4, 7], roman: 'IV' },
  { degree: 5, qualityLabel: 'MAJOR',  qualityPt: 'MAIOR',  type: 'major',      triadIntervals: [0, 4, 7], roman: 'V' },
  { degree: 6, qualityLabel: 'MINOR',  qualityPt: 'MENOR',  type: 'minor',      triadIntervals: [0, 3, 7], roman: 'vi' },
  { degree: 7, qualityLabel: 'm(♭5)', qualityPt: 'm(♭5)',  type: 'diminished', triadIntervals: [0, 3, 6], roman: 'vii°' },
];

// Harmonic function colors for degree headers
// 1°=Tonic(red), 4°=Subdominant(green), 5°=Dominant(green)
// Others get neutral colors; the "skip" colors match your picture
const DEGREE_HEADER_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#22c55e', text: '#fff', label: 'TOM' },
  2: { bg: '#ef4444', text: '#fff', label: '' },
  3: { bg: '#ef4444', text: '#fff', label: '' },
  4: { bg: '#22c55e', text: '#fff', label: 'SUBDOMINANTE' },
  5: { bg: '#22c55e', text: '#fff', label: 'DOMINANTE' },
  6: { bg: '#ef4444', text: '#fff', label: '' },
  7: { bg: 'rgba(255,255,255,0.08)', text: '#a1a1aa', label: '' },
};

// Guitar standard tuning: string name and open note index
const GUITAR_STRINGS = [
  { label: 'E', openNote: 4 },  // 1st string (highest)
  { label: 'B', openNote: 11 },
  { label: 'G', openNote: 7 },
  { label: 'D', openNote: 2 },
  { label: 'A', openNote: 9 },
  { label: 'E', openNote: 4 },  // 6th string (lowest)
];

const NUM_FRETS = 16;

/* ── Helpers ── */

function noteIndex(note: string): number {
  return CHROMATIC.indexOf(note as typeof CHROMATIC[number]);
}

function getNote(index: number): string {
  return CHROMATIC[((index % 12) + 12) % 12];
}

function getMajorScale(root: string): string[] {
  const rootIdx = noteIndex(root);
  return MAJOR_SCALE_INTERVALS.map(interval => getNote(rootIdx + interval));
}

function getTriadNotes(root: string, intervals: number[]): string[] {
  const rootIdx = noteIndex(root);
  return intervals.map(i => getNote(rootIdx + i));
}

/* ── Component ── */

const HarmonicField: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedRoot = useSelector((state: RootState) => state.harmonicField.selectedRoot);
  const highlightedNote = useSelector((state: RootState) => state.harmonicField.highlightedNote);

  // Sequence mode: record a shape on the fretboard, then find all matches
  const [sequenceMode, setSequenceMode] = useState(false);
  const [seqCells, setSeqCells] = useState<Array<{ si: number; fret: number; note: string }>>([]);

  // Compute relative offsets from first cell → shape template
  const seqShape = useMemo(() => {
    if (seqCells.length === 0) return [];
    const origin = seqCells[0];
    return seqCells.map(c => ({
      ds: c.si - origin.si,   // string offset
      df: c.fret - origin.fret, // fret offset
      note: c.note,
    }));
  }, [seqCells]);

  // After recording stops, find all positions where the shape matches
  const sequenceMatches = useMemo(() => {
    const map = new Map<string, number>(); // "si-fret" → position (1-based)
    if (sequenceMode || seqShape.length === 0) return map;

    for (let startS = 0; startS < GUITAR_STRINGS.length; startS++) {
      for (let startF = 0; startF < NUM_FRETS; startF++) {
        let allMatch = true;
        for (const entry of seqShape) {
          const s = startS + entry.ds;
          const f = startF + entry.df;
          if (s < 0 || s >= GUITAR_STRINGS.length || f < 0 || f >= NUM_FRETS) {
            allMatch = false;
            break;
          }
          const noteIdx = (GUITAR_STRINGS[s].openNote + f) % 12;
          if (CHROMATIC[noteIdx] !== entry.note) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          seqShape.forEach((entry, i) => {
            map.set(`${startS + entry.ds}-${startF + entry.df}`, i + 1);
          });
        }
      }
    }
    return map;
  }, [seqShape, sequenceMode]);

  const toggleSequenceMode = () => {
    if (sequenceMode) {
      // stop recording — keep shape so matches show
      setSequenceMode(false);
    } else {
      setSequenceMode(true);
      setSeqCells([]);
      dispatch(setHighlightedNote(null));
    }
  };

  const rootIdx = selectedRoot ? noteIndex(selectedRoot) : -1;

  const scale = useMemo(() => {
    if (!selectedRoot) return [];
    return getMajorScale(selectedRoot);
  }, [selectedRoot]);

  // Which chromatic indices (0-23) are scale degrees?
  const scalePositions = useMemo(() => {
    if (rootIdx < 0) return new Map<number, number>();
    const map = new Map<number, number>(); // chromatic position -> degree (0-based)
    MAJOR_SCALE_INTERVALS.forEach((interval, degreeIdx) => {
      const chromaticPos = rootIdx + interval;
      map.set(chromaticPos, degreeIdx);
    });
    return map;
  }, [rootIdx]);

  // Degree data with triads
  const degreeData = useMemo(() => {
    if (scale.length === 0) return [];
    return DEGREES.map((deg, i) => {
      const degRoot = scale[i];
      const triad = getTriadNotes(degRoot, deg.triadIntervals);
      return { ...deg, root: degRoot, triad };
    });
  }, [scale]);

  return (
    <div className="harmonic-field">
      {/* Header */}
      <header className="hf-header">
        <button className="hf-back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Harmonic Field</h1>
        <div style={{ width: 90 }} />
      </header>

      <div className="hf-body">
        {/* Subtitle */}
        <p className="hf-subtitle">
          Click a note on the chromatic strip to build the <strong>Major Harmonic Field</strong>
        </p>

        {/* ═══ Unified strip container ═══ */}
        <div className="chromatic-strip-container">
          {/* Chromatic strip (2 octaves) */}
          <div className="chromatic-strip">
            {TWO_OCTAVES.map((note, i) => {
              const isSharp = note.includes('#');
              const isSelected = selectedRoot === note && i === rootIdx;
              const degreeIdx = scalePositions.get(i);
              const isScaleNote = degreeIdx !== undefined;

              return (
                <div
                  key={i}
                  className={`strip-cell ${isSharp ? 'sharp' : 'natural'} ${isSelected ? 'selected-root' : ''} ${isScaleNote ? `scale-note degree-${degreeIdx}` : ''}`}
                  onClick={() => dispatch(setSelectedRoot(note))}
                >
                  <span className="strip-note">{note}</span>
                  {isScaleNote && (
                    <span className="strip-degree-badge">{(degreeIdx + 1)}°</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Shape strip — slides under the chromatic strip */}
          {selectedRoot && degreeData.length > 0 && (
            <>
              {/* Arcs showing whole-tone jumps between consecutive degrees */}
              <svg
                className="hf-arcs-svg"
                style={{ marginLeft: rootIdx * 52 }}
              >
                {(() => {
                  const positions = MAJOR_SCALE_INTERVALS;
                  const cellW = 52;
                  const arcs = [];
                  // Connect consecutive degrees: 1→2, 2→3, 3→4, 4→5, 5→6, 6→7
                  // Only draw arc when they skip a note (whole tone)
                  for (let d = 0; d < 6; d++) {
                    const gap = positions[d + 1] - positions[d];
                    if (gap <= 1) continue; // half tone (3→4), no arc
                    const x1 = positions[d] * cellW + cellW / 2;
                    const x2 = positions[d + 1] * cellW + cellW / 2;
                    const midX = (x1 + x2) / 2;
                    const height = 22;
                    arcs.push(
                      <path
                        key={d}
                        d={`M ${x1} 38 Q ${midX} ${38 - height} ${x2} 38`}
                        className="hf-arc"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    );
                  }
                  return arcs;
                })()}
              </svg>

              {/* The 12-cell shape strip */}
              <div
                className="hf-strip"
                style={{ marginLeft: rootIdx * 52 }}
              >
                {Array.from({ length: 12 }, (_, chromIdx) => {
                  const degIdx = MAJOR_SCALE_INTERVALS.indexOf(chromIdx);
                  const isDegree = degIdx !== -1;
                  const d = isDegree ? degreeData[degIdx] : null;
                  const hdr = d ? DEGREE_HEADER_COLORS[d.degree] : null;

                  if (!isDegree) {
                    return <div key={chromIdx} className="hf-strip-cell hf-strip-gap" />;
                  }

                  return (
                    <div key={chromIdx} className={`hf-strip-cell hf-strip-degree ${d!.type}`}>
                      <div
                        className="hf-strip-header"
                        style={{ backgroundColor: hdr!.bg, color: hdr!.text }}
                      >
                        {d!.degree}°
                      </div>
                      <div className="hf-strip-symbol">
                        {d!.type === 'major' ? '+' : d!.type === 'minor' ? '−' : 'm5b'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {/* end chromatic-strip-container */}

        {/* Function legend */}
        {selectedRoot && degreeData.length > 0 && (
          <div className="hf-functions-legend">
            <div className="hf-fn-item">
              <div className="hf-fn-dot" style={{ backgroundColor: '#ef4444' }} />
              <span className="hf-fn-label" style={{ color: '#ef4444' }}>TOM (Tônica)</span>
              <span className="hf-fn-value">{degreeData[0]?.root} — {degreeData[0]?.triad.join(' – ')}</span>
            </div>
            <div className="hf-fn-item">
              <div className="hf-fn-dot" style={{ backgroundColor: '#22c55e' }} />
              <span className="hf-fn-label" style={{ color: '#22c55e' }}>Subdominante (IV)</span>
              <span className="hf-fn-value">{degreeData[3]?.root} — {degreeData[3]?.triad.join(' – ')}</span>
            </div>
            <div className="hf-fn-item">
              <div className="hf-fn-dot" style={{ backgroundColor: '#22c55e' }} />
              <span className="hf-fn-label" style={{ color: '#22c55e' }}>Dominante (V)</span>
              <span className="hf-fn-value">{degreeData[4]?.root} — {degreeData[4]?.triad.join(' – ')}</span>
            </div>
          </div>
        )}

        {/* ═══ Guitar Fretboard Grid ═══ */}
        <div className="fretboard-section">
          <h2 className="fretboard-title">Fretboard</h2>

          {/* Sequence mode controls */}
          <div className="fb-seq-controls">
            <button
              className={`fb-seq-toggle ${sequenceMode ? 'active' : ''}`}
              onClick={toggleSequenceMode}
            >
              {sequenceMode ? '⏹ Stop' : '🔴 Record Sequence'}
            </button>
            {seqCells.length > 0 && (
              <div className="fb-seq-chips">
                {seqCells.map((c, i) => (
                  <span key={i} className="fb-seq-chip">{c.note}</span>
                ))}
                <button
                  className="fb-seq-clear"
                  onClick={() => setSeqCells([])}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="fretboard-scroll">
            <table className="fretboard-grid">
              <thead>
                <tr>
                  <th className="fretboard-corner"></th>
                  {Array.from({ length: NUM_FRETS }, (_, f) => (
                    <th key={f} className="fretboard-fret-num">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GUITAR_STRINGS.map((gs, si) => (
                  <tr key={si}>
                    <td className="fretboard-string-label">{gs.label}</td>
                    {Array.from({ length: NUM_FRETS }, (_, fret) => {
                      const noteIdx = (gs.openNote + fret) % 12;
                      const noteName = CHROMATIC[noteIdx];
                      const isHighlighted = !sequenceMode && highlightedNote === noteName;
                      const seqPos = sequenceMatches.get(`${si}-${fret}`);
                      const isSeqMatch = seqPos !== undefined;
                      const isRecording = sequenceMode && seqCells.some(c => c.si === si && c.fret === fret);
                      return (
                        <td
                          key={fret}
                          className={`fretboard-cell${isHighlighted ? ' fb-highlighted' : ''}${isSeqMatch ? ' fb-seq-match' : ''}${isRecording ? ' fb-recording' : ''}${fret === 0 ? ' fb-open' : ''}`}
                          onClick={() => {
                            if (sequenceMode) {
                              setSeqCells(prev => [...prev, { si, fret, note: noteName }]);
                            } else {
                              dispatch(setHighlightedNote(isHighlighted ? null : noteName));
                            }
                          }}
                        >
                          {noteName}
                          {isSeqMatch && (
                            <span className="fb-seq-pos">{seqPos}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {!selectedRoot && (
          <div className="hf-empty-state">
            <div className="hf-empty-icon">🎹</div>
            <p>Click a note on the strip to build the harmonic field</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HarmonicField;
