import React, { useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  setSelectedIndex,
  setWheelRotation,
  setStripRoot,
} from '../store/circleOfFifthsSlice';
import './CircleOfFifths.css';

/* ═══════════════════════════════════════════
   Music theory data
   ═══════════════════════════════════════════ */

/** Circle of fifths order — 12 major keys, clockwise from 12 o'clock */
const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F'] as const;

/** Relative minor for each major key (same index) */
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'] as const;

/** Diminished chord for each position (vii° of the major key) */
const DIM_KEYS = ['B°', 'F♯°', 'C♯°', 'G♯°', 'D♯°', 'A♯°', 'E♯°', 'C°', 'G°', 'D°', 'A°', 'E°'] as const;

/** Number of sharps / flats for each key */
const KEY_SIGNATURES: Record<string, string> = {
  'C': '0', 'G': '1♯', 'D': '2♯', 'A': '3♯', 'E': '4♯', 'B': '5♯',
  'F♯': '6♯/6♭', 'D♭': '5♭', 'A♭': '4♭', 'E♭': '3♭', 'B♭': '2♭', 'F': '1♭',
};

/* ═══════════════════════════════════════════
   Chromatic strip data
   ═══════════════════════════════════════════ */

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const TWO_OCTAVES = [...CHROMATIC, ...CHROMATIC];
/** Major scale: W-W-H-W-W-W-H  →  cumulative semitones from root */
const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11];
/** Step labels between consecutive degrees */
const STEP_LABELS = ['W', 'W', 'H', 'W', 'W', 'W', 'H'];
const CELL_W = 52; // px width of each strip cell

/* ═══════════════════════════════════════════
   SVG geometry helpers
   ═══════════════════════════════════════════ */

const CX = 260;                 // center X
const CY = 260;                 // center Y
const R_OUTER = 240;            // outer ring outer radius
const R_OUTER_INNER = 180;      // outer ring inner radius (= inner ring outer)
const R_INNER_INNER = 130;      // inner ring inner radius (= dim ring outer)
const R_DIM_INNER = 90;         // dim ring inner radius
const R_CENTER = 70;            // center decorative circle
const SEGMENT_ANGLE = 360 / 12; // 30°
const HALF_SEG = SEGMENT_ANGLE / 2; // 15° — offset so each key is CENTERED on its position

/** Build an SVG arc path for a ring segment (annular sector). */
function arcPath(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  startDeg: number, endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180; // -90 so 0° = top
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  const osx = cx + rOuter * Math.cos(toRad(startDeg));
  const osy = cy + rOuter * Math.sin(toRad(startDeg));
  const oex = cx + rOuter * Math.cos(toRad(endDeg));
  const oey = cy + rOuter * Math.sin(toRad(endDeg));

  const isx = cx + rInner * Math.cos(toRad(endDeg));
  const isy = cy + rInner * Math.sin(toRad(endDeg));
  const iex = cx + rInner * Math.cos(toRad(startDeg));
  const iey = cy + rInner * Math.sin(toRad(startDeg));

  return [
    `M ${osx} ${osy}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oex} ${oey}`,
    `L ${isx} ${isy}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iex} ${iey}`,
    'Z',
  ].join(' ');
}

/** Get X,Y for a label placed at (midAngle, radius). */
function labelPos(index: number, radius: number): { x: number; y: number } {
  const angle = ((index * SEGMENT_ANGLE) - 90) * (Math.PI / 180);
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  };
}

/** Convert page mouse/touch coords to angle relative to center (0° = top, clockwise). */
function coordsToAngle(clientX: number, clientY: number, svgRect: DOMRect): number {
  const x = clientX - svgRect.left - CX * (svgRect.width / 520);
  const y = clientY - svgRect.top - CY * (svgRect.height / 520);
  let deg = (Math.atan2(x, -y) * 180) / Math.PI; // 0° at top, clockwise
  if (deg < 0) deg += 360;
  return deg;
}

/** Snap an angle to the nearest segment center. */
function snapToSegment(deg: number): number {
  const adjusted = (deg + 360) % 360;
  const idx = Math.round(adjusted / SEGMENT_ANGLE) % 12;
  return idx;
}

/* ═══════════════════════════════════════════
   Diatonic chord helpers
   ═══════════════════════════════════════════ */

interface DiatonicChord {
  numeral: string;
  name: string;
  cardClass: string;
}

function getDiatonicChords(keyIndex: number): DiatonicChord[] {

  // In circle of fifths: going CCW = up a 4th, CW = up a 5th
  // For key at index i:  IV = i-1, V = i+1, ii = i-2, vi = i (minor), iii = i+1 (minor), vii° = i (dim)
  const iiIdx  = (keyIndex + 10) % 12; // 2 steps CCW
  const iiiIdx = (keyIndex + 1) % 12;  // 1 step CW (minor of V)
  const IVIdx  = (keyIndex + 11) % 12; // 1 step CCW
  const VIdx   = (keyIndex + 1) % 12;  // 1 step CW
  const viIdx  = keyIndex;             // same position

  return [
    { numeral: 'I',    name: MAJOR_KEYS[keyIndex], cardClass: 'tonic' },
    { numeral: 'ii',   name: MINOR_KEYS[iiIdx],    cardClass: 'minor-card' },
    { numeral: 'iii',  name: MINOR_KEYS[iiiIdx],   cardClass: 'minor-card' },
    { numeral: 'IV',   name: MAJOR_KEYS[IVIdx],    cardClass: 'subdominant' },
    { numeral: 'V',    name: MAJOR_KEYS[VIdx],     cardClass: 'dominant' },
    { numeral: 'vi',   name: MINOR_KEYS[viIdx],    cardClass: 'minor-card' },
    { numeral: 'vii°', name: DIM_KEYS[keyIndex],   cardClass: 'dim-card' },
  ];
}

/** Return indices that should be highlighted given the selected key. */
function getHighlightedIndices(keyIndex: number): {
  majorHighlighted: Set<number>;
  minorHighlighted: Set<number>;
  dimHighlighted: Set<number>;
} {
  const IVIdx = (keyIndex + 11) % 12;
  const VIdx  = (keyIndex + 1) % 12;
  const iiIdx = (keyIndex + 10) % 12;
  const iiiIdx = (keyIndex + 1) % 12;
  const viIdx = keyIndex;

  return {
    majorHighlighted: new Set([keyIndex, IVIdx, VIdx]),
    minorHighlighted: new Set([viIdx, iiIdx, iiiIdx]),
    dimHighlighted: new Set([keyIndex]),
  };
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

const CircleOfFifths: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedIndex = useSelector((state: RootState) => state.circleOfFifths.selectedIndex);
  // wheelRotation: cumulative degrees the ring group is rotated (not clamped to 0-360
  // so CSS transition always picks the shortest path)
  const wheelRotation = useSelector((state: RootState) => state.circleOfFifths.wheelRotation);
  const isDragging = useRef(false);
  const dragStartAngle = useRef(0);

  /* ── Chromatic strip state ── */
  const stripRoot = useSelector((state: RootState) => state.circleOfFifths.stripRoot);

  const stripRootIdx = stripRoot ? CHROMATIC.indexOf(stripRoot as any) : -1;

  /** Map: chromatic position (0-23) → scale degree index (0-6) */
  const stripScalePositions = useMemo(() => {
    if (stripRootIdx < 0) return new Map<number, number>();
    const map = new Map<number, number>();
    MAJOR_SCALE_STEPS.forEach((semitones, degIdx) => {
      map.set(stripRootIdx + semitones, degIdx);
    });
    return map;
  }, [stripRootIdx]);
  const wheelStartRotation = useRef(0);

  /* Derived data */
  const highlights = useMemo(() => getHighlightedIndices(selectedIndex), [selectedIndex]);
  const diatonicChords = useMemo(() => getDiatonicChords(selectedIndex), [selectedIndex]);

  /** Rotate the wheel so key at `index` is at the top. Uses shortest-path delta. */
  const rotateToIndex = useCallback((index: number) => {
    const targetAngle = -index * SEGMENT_ANGLE; // negative = counter-clockwise
    let delta = (targetAngle - wheelRotation) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    dispatch(setWheelRotation(wheelRotation + delta));
    dispatch(setSelectedIndex(index));
  }, [wheelRotation, dispatch]);

  /* ── Wheel drag handlers ── */
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return;
    isDragging.current = true;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartAngle.current = coordsToAngle(clientX, clientY, rect);
    wheelStartRotation.current = wheelRotation;
  }, [wheelRotation]);

  const onDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentAngle = coordsToAngle(clientX, clientY, rect);
    let delta = currentAngle - dragStartAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    // Wheel rotates opposite to drag direction (drag CW → wheel goes CW under fixed overlay)
    dispatch(setWheelRotation(wheelStartRotation.current - delta));
  }, [dispatch]);

  const endDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Find which key is now closest to the top and snap there
    // Current effective angle at top = -wheelRotation mod 360
    const effectiveAngle = ((-wheelRotation % 360) + 360) % 360;
    const snappedIdx = snapToSegment(effectiveAngle);
    rotateToIndex(snappedIdx);
  }, [wheelRotation, rotateToIndex]);

  /** Click on a specific segment to jump there */
  const selectKey = useCallback((index: number) => {
    rotateToIndex(index);
  }, [rotateToIndex]);

  /* Build the overlay wedge — covers 3 segments (IV–I–V), FIXED at top */
  const overlayWedgePath = useMemo(() => {
    return arcPath(CX, CY, R_OUTER + 4, R_DIM_INNER - 4,
      -SEGMENT_ANGLE * 1.5, SEGMENT_ANGLE * 1.5);
  }, []);

  return (
    <div className="circle-of-fifths-page">
      {/* Header */}
      <header className="cof-header">
        <button className="cof-back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Circle of Fifths</h1>
        <div style={{ width: 90 }} />
      </header>

      {/* Body */}
      <div className="cof-body">
        <p className="cof-hint">
          <span>Drag</span> the overlay or <span>click</span> a key to explore
        </p>

        <div className="cof-main">
          {/* SVG Wheel */}
          <div className="cof-wheel-wrapper">
            <svg
              ref={svgRef}
              className="cof-svg"
              viewBox="0 0 520 520"
              onMouseDown={startDrag}
              onMouseMove={onDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={startDrag}
              onTouchMove={onDrag}
              onTouchEnd={endDrag}
            >
              {/* ── Rotating rings group ── */}
              <g
                className="cof-rings"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transformOrigin: `${CX}px ${CY}px`,
                  transition: isDragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* ── Outer ring: major keys ── */}
                {MAJOR_KEYS.map((key, i) => {
                  const startDeg = i * SEGMENT_ANGLE - HALF_SEG;
                  const endDeg = startDeg + SEGMENT_ANGLE;
                  const isSelected = i === selectedIndex;
                  const isHighlighted = highlights.majorHighlighted.has(i);
                  const pos = labelPos(i, (R_OUTER + R_OUTER_INNER) / 2);

                  return (
                    <g key={`major-${i}`} onClick={() => selectKey(i)}>
                      <path
                        d={arcPath(CX, CY, R_OUTER, R_OUTER_INNER, startDeg, endDeg)}
                        className={`cof-segment-outer ${isSelected ? 'selected' : ''} ${isHighlighted && !isSelected ? 'highlighted' : ''}`}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        className={`cof-label-major ${isSelected ? 'selected' : ''} ${isHighlighted && !isSelected ? 'highlighted' : ''}`}
                        style={{ transform: `rotate(${-wheelRotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* ── Inner ring: minor keys ── */}
                {MINOR_KEYS.map((key, i) => {
                  const startDeg = i * SEGMENT_ANGLE - HALF_SEG;
                  const endDeg = startDeg + SEGMENT_ANGLE;
                  const isSelected = i === selectedIndex;
                  const isHighlighted = highlights.minorHighlighted.has(i);
                  const pos = labelPos(i, (R_OUTER_INNER + R_INNER_INNER) / 2);

                  return (
                    <g key={`minor-${i}`} onClick={() => selectKey(i)}>
                      <path
                        d={arcPath(CX, CY, R_OUTER_INNER, R_INNER_INNER, startDeg, endDeg)}
                        className={`cof-segment-inner ${isSelected ? 'selected' : ''} ${isHighlighted && !isSelected ? 'highlighted' : ''}`}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        className={`cof-label-minor ${isSelected ? 'selected' : ''} ${isHighlighted && !isSelected ? 'highlighted' : ''}`}
                        style={{ transform: `rotate(${-wheelRotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* ── Center ring: diminished ── */}
                {DIM_KEYS.map((key, i) => {
                  const startDeg = i * SEGMENT_ANGLE - HALF_SEG;
                  const endDeg = startDeg + SEGMENT_ANGLE;
                  const isHighlighted = highlights.dimHighlighted.has(i);
                  const pos = labelPos(i, (R_INNER_INNER + R_DIM_INNER) / 2);

                  return (
                    <g key={`dim-${i}`} onClick={() => selectKey(i)}>
                      <path
                        d={arcPath(CX, CY, R_INNER_INNER, R_DIM_INNER, startDeg, endDeg)}
                        className={`cof-segment-dim ${isHighlighted ? 'highlighted' : ''}`}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        className={`cof-label-dim ${isHighlighted ? 'highlighted' : ''}`}
                        style={{ transform: `rotate(${-wheelRotation}deg)`, transformOrigin: `${pos.x}px ${pos.y}px` }}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* ── Fixed overlay wedge (stays at top) ── */}
              <path d={overlayWedgePath} className="cof-overlay-wedge" />

              {/* ── Roman numeral labels on overlay (fixed, not rotating) ── */}
              {/* Outer ring: IV  I  V */}
              {(() => {
                const rOuter = (R_OUTER + R_OUTER_INNER) / 2; // ~210
                const rInner = (R_OUTER_INNER + R_INNER_INNER) / 2; // ~155
                const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
                // positions: left=-30° (IV), center=0° (I), right=+30° (V)
                const outerLabels = [
                  { label: 'IV', angle: -SEGMENT_ANGLE },
                  { label: 'I',  angle: 0 },
                  { label: 'V',  angle: SEGMENT_ANGLE },
                ];
                const innerLabels = [
                  { label: 'ii',  angle: -SEGMENT_ANGLE },
                  { label: 'vi',  angle: 0 },
                  { label: 'iii', angle: SEGMENT_ANGLE },
                ];
                return (
                  <>
                    {outerLabels.map(({ label, angle }) => (
                      <text
                        key={`overlay-${label}`}
                        x={CX + rOuter * Math.cos(toRad(angle))}
                        y={CY + rOuter * Math.sin(toRad(angle))}
                        className="cof-overlay-numeral cof-overlay-numeral-major"
                      >
                        {label}
                      </text>
                    ))}
                    {innerLabels.map(({ label, angle }) => (
                      <text
                        key={`overlay-${label}`}
                        x={CX + rInner * Math.cos(toRad(angle))}
                        y={CY + rInner * Math.sin(toRad(angle))}
                        className="cof-overlay-numeral cof-overlay-numeral-minor"
                      >
                        {label}
                      </text>
                    ))}
                  </>
                );
              })()}

              {/* ── Center decorative circle ── */}
              <circle cx={CX} cy={CY} r={R_CENTER} className="cof-center-circle" />
              <text x={CX} y={CY - 8} className="cof-center-text">
                {MAJOR_KEYS[selectedIndex]}
              </text>
              <text x={CX} y={CY + 14} className="cof-center-subtext">
                {KEY_SIGNATURES[MAJOR_KEYS[selectedIndex]]}
              </text>
            </svg>
          </div>

          {/* Info panel */}
          <div className="cof-info-panel" key={selectedIndex}>
            <h2>{MAJOR_KEYS[selectedIndex]} Major</h2>
            <p className="key-subtitle">
              Relative minor: {MINOR_KEYS[selectedIndex]} · Signature: {KEY_SIGNATURES[MAJOR_KEYS[selectedIndex]]}
            </p>

            <div className="info-section">
              <h3>Diatonic Chords</h3>
              <div className="chord-cards">
                {diatonicChords.map(ch => (
                  <div key={ch.numeral} className={`chord-card ${ch.cardClass}`}>
                    <span>{ch.name}</span>
                    <span className="numeral">{ch.numeral}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-section">
              <h3>Key Relationships</h3>
              <div className="key-relations">
                <div className="relation-row">
                  <span className="relation-label">Tonic (I)</span>
                  <span className="relation-value rel-tonic">{MAJOR_KEYS[selectedIndex]}</span>
                </div>
                <div className="relation-row">
                  <span className="relation-label">Dominant (V)</span>
                  <span className="relation-value rel-dominant">{MAJOR_KEYS[(selectedIndex + 1) % 12]}</span>
                </div>
                <div className="relation-row">
                  <span className="relation-label">Subdominant (IV)</span>
                  <span className="relation-value rel-subdominant">{MAJOR_KEYS[(selectedIndex + 11) % 12]}</span>
                </div>
                <div className="relation-row">
                  <span className="relation-label">Rel. Minor (vi)</span>
                  <span className="relation-value rel-minor">{MINOR_KEYS[selectedIndex]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            Chromatic Scale Strip
            ═══════════════════════════════════════════ */}
        <div className="cof-chromatic-section">
          <h3>Chromatic Scale — Major Scale Jumps</h3>
          <p className="cof-hint">
            <span>Click</span> a note to see the 7 jumps that build the major scale
          </p>

          <div className="cof-strip-wrapper">
            {/* Jump arcs (drawn above the strip) */}
            {stripRoot && stripRootIdx >= 0 && (
              <svg
                className="cof-jump-arcs-svg"
                style={{ width: TWO_OCTAVES.length * CELL_W }}
                key={stripRoot}
              >
                {MAJOR_SCALE_STEPS.slice(0, 7).map((fromSemitone, i) => {
                  const toSemitone = i < 6 ? MAJOR_SCALE_STEPS[i + 1] : 12; // last jump wraps to octave
                  const gap = toSemitone - fromSemitone; // 1 = half, 2 = whole
                  const x1 = (stripRootIdx + fromSemitone) * CELL_W + CELL_W / 2;
                  const x2 = (stripRootIdx + toSemitone) * CELL_W + CELL_W / 2;
                  const midX = (x1 + x2) / 2;
                  const arcH = gap === 1 ? 14 : 22;
                  const isHalf = gap === 1;

                  return (
                    <g key={i}>
                      <path
                        d={`M ${x1} 40 Q ${midX} ${40 - arcH} ${x2} 40`}
                        className={`cof-jump-arc ${isHalf ? 'half-step' : ''}`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                      />
                      <text
                        x={midX}
                        y={40 - arcH - 4}
                        className={`cof-step-label ${isHalf ? 'half' : 'whole'}`}
                      >
                        {STEP_LABELS[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Chromatic cells (2 octaves) */}
            <div className="cof-chromatic-strip">
              {TWO_OCTAVES.map((note, i) => {
                const isSharp = note.includes('#');
                const isSelectedRoot = stripRoot === note && i === stripRootIdx;
                const degIdx = stripScalePositions.get(i);
                const isScaleNote = degIdx !== undefined;

                return (
                  <div
                    key={i}
                    className={[
                      'cof-strip-cell',
                      isSharp ? 'cs-sharp' : 'cs-natural',
                      isSelectedRoot ? 'cs-selected-root' : '',
                      isScaleNote ? 'cs-scale-note' : '',
                    ].join(' ')}
                    onClick={() => dispatch(setStripRoot(note))}
                  >
                    <span className="cs-note-label">{note}</span>
                    {isScaleNote && (
                      <span className="cs-degree-badge">{degIdx + 1}°</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleOfFifths;
