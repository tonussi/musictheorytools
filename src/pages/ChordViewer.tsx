import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedRoot, setSelectedQuality, toggleOverlay, setOverlayOpen } from '../store/chordViewerSlice';
import ChordDiagram from './ChordDiagram';
import { getChordVoicing } from './chordVoicings';
import './ChordViewer.css';

/* ── Music theory data ── */

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const CHORD_QUALITIES: Record<string, { intervals: number[]; label: string; formula: string; description: string }> = {
  major:    { intervals: [0, 4, 7],       label: '',      formula: '1 – 3 – 5',       description: 'Bright, happy, stable. The most fundamental chord.' },
  minor:    { intervals: [0, 3, 7],       label: 'm',     formula: '1 – ♭3 – 5',      description: 'Sad, dark, introspective. Flat third gives it a melancholy feel.' },
  '7':      { intervals: [0, 4, 7, 10],   label: '7',     formula: '1 – 3 – 5 – ♭7',  description: 'Dominant seventh. Tension-filled, wants to resolve. Backbone of blues.' },
  maj7:     { intervals: [0, 4, 7, 11],   label: 'maj7',  formula: '1 – 3 – 5 – 7',   description: 'Dreamy, jazzy, lush. Natural seventh gives a smooth sophisticated sound.' },
  min7:     { intervals: [0, 3, 7, 10],   label: 'm7',    formula: '1 – ♭3 – 5 – ♭7', description: 'Smooth, mellow minor. Common in jazz, R&B, and neo-soul.' },
  dim:      { intervals: [0, 3, 6],       label: 'dim',   formula: '1 – ♭3 – ♭5',     description: 'Tense, unstable, dissonant. Often used as a passing chord.' },
  aug:      { intervals: [0, 4, 8],       label: 'aug',   formula: '1 – 3 – ♯5',      description: 'Mysterious, unresolved. Sharp fifth creates an eerie, floating quality.' },
  sus2:     { intervals: [0, 2, 7],       label: 'sus2',  formula: '1 – 2 – 5',       description: 'Open, airy. No third — neither major nor minor.' },
  sus4:     { intervals: [0, 5, 7],       label: 'sus4',  formula: '1 – 4 – 5',       description: 'Suspended, wants to resolve to major or minor.' },
  add9:     { intervals: [0, 4, 7, 14],   label: 'add9',  formula: '1 – 3 – 5 – 9',   description: 'A major chord with an added 9th. Sparkly, modern pop sound.' },
  '6':      { intervals: [0, 4, 7, 9],    label: '6',     formula: '1 – 3 – 5 – 6',   description: 'Sweet, retro. Classic jazz and vintage pop feel.' },
  min6:     { intervals: [0, 3, 7, 9],    label: 'm6',    formula: '1 – ♭3 – 5 – 6',  description: 'Dark and mysterious. Used in jazz and film noir soundtracks.' },
  '9':      { intervals: [0, 4, 7, 10, 14], label: '9',   formula: '1 – 3 – 5 – ♭7 – 9', description: 'Rich, funky dominant. Essential for funk, soul, and jazz.' },
  dim7:     { intervals: [0, 3, 6, 9],    label: 'dim7',  formula: '1 – ♭3 – ♭5 – ♭♭7', description: 'Fully diminished. Extreme tension, symmetrical construction.' },
  '7#9':    { intervals: [0, 4, 7, 10, 15], label: '7♯9', formula: '1 – 3 – 5 – ♭7 – ♯9', description: 'The "Hendrix chord". Aggressive, bluesy, iconic.' },
};

const INTERVAL_NAMES: Record<number, string> = {
  0: 'R',   1: '♭2',  2: '2',   3: '♭3',  4: '3',   5: '4',
  6: '♭5',  7: '5',   8: '♯5',  9: '6',   10: '♭7', 11: '7',
  12: '8',  13: '♭9', 14: '9',  15: '♯9',
};



/* ── Helpers ── */

function noteIndex(note: string): number {
  return CHROMATIC.indexOf(note as typeof CHROMATIC[number]);
}

function getChordNotes(root: string, intervals: number[]): string[] {
  const rootIdx = noteIndex(root);
  return intervals.map(i => CHROMATIC[(rootIdx + i) % 12]);
}



/* ── Component ── */

const ChordViewer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedRoot = useSelector((state: RootState) => state.chordViewer.selectedRoot);
  const selectedQuality = useSelector((state: RootState) => state.chordViewer.selectedQuality);
  const overlayOpen = useSelector((state: RootState) => state.chordViewer.overlayOpen);

  const quality = CHORD_QUALITIES[selectedQuality];
  const chordNotes = useMemo(
    () => getChordNotes(selectedRoot, quality.intervals),
    [selectedRoot, quality.intervals]
  );

  const voicing = useMemo(
    () => getChordVoicing(selectedRoot, selectedQuality),
    [selectedRoot, selectedQuality]
  );

  const chordName = `${selectedRoot}${quality.label}`;

  const handleToggleOverlay = useCallback(() => dispatch(toggleOverlay()), [dispatch]);
  const closeOverlay = useCallback(() => dispatch(setOverlayOpen(false)), [dispatch]);

  return (
    <div className="chord-viewer">
      {/* Header */}
      <header className="chord-viewer-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Chord Viewer</h1>
        <div style={{ width: 90 }} />
      </header>

      {/* Body */}
      <div className="chord-viewer-body">
        {/* Controls */}
        <div className="chord-controls">
          <div className="control-group">
            <h3>Root Note</h3>
            <div className="note-buttons">
              {CHROMATIC.map(n => (
                <button
                  key={n}
                  className={`note-btn ${selectedRoot === n ? 'active' : ''}`}
                  onClick={() => dispatch(setSelectedRoot(n))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <h3>Quality</h3>
            <div className="quality-buttons">
              {Object.entries(CHORD_QUALITIES).map(([key, q]) => (
                <button
                  key={key}
                  className={`quality-btn ${selectedQuality === key ? 'active' : ''}`}
                  onClick={() => dispatch(setSelectedQuality(key))}
                >
                  {q.label || 'Maj'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chord Name */}
        <div className="chord-display">
          <span className="chord-name-badge" key={chordName}>{chordName}</span>
        </div>

        {/* Formula toggle */}
        <button className="formula-toggle-btn" onClick={handleToggleOverlay}>
          🎵 View Formula &amp; Details
        </button>

        {/* Legend */}
        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot root-legend" />
            Root
          </span>
          <span className="legend-item">
            <span className="legend-dot tone-legend" />
            Chord Tone
          </span>
          <span className="legend-item">
            <span className="legend-marker">×</span>
            Muted
          </span>
          <span className="legend-item">
            <span className="legend-marker legend-open">○</span>
            Open
          </span>
        </div>

        {/* Chord Diagram */}
        <div className="chord-diagram-section">
          <ChordDiagram
            voicing={voicing}
            rootNote={selectedRoot}
          />
        </div>
      </div>

      {/* Overlay backdrop */}
      <div
        className={`overlay-backdrop ${overlayOpen ? 'open' : ''}`}
        onClick={closeOverlay}
      />

      {/* Sliding formula overlay */}
      <div className={`formula-overlay ${overlayOpen ? 'open' : ''}`}>
        <button className="overlay-close" onClick={closeOverlay}>✕</button>
        <h2>{chordName}</h2>
        <div className="formula-content">
          <h3>Formula</h3>
          <p>{quality.formula}</p>

          <h3>Intervals</h3>
          <div className="formula-intervals">
            {quality.intervals.map((interval, i) => (
              <span
                key={i}
                className={`interval-chip ${interval === 0 ? 'root-chip' : ''}`}
              >
                {INTERVAL_NAMES[interval] || interval}
              </span>
            ))}
          </div>

          <h3>Notes</h3>
          <div className="notes-list">
            {chordNotes.map((n, i) => (
              <span key={i} className={`note-chip ${i === 0 ? 'root-note' : ''}`}>
                {n}
              </span>
            ))}
          </div>

          <h3>Character</h3>
          <p>{quality.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ChordViewer;
