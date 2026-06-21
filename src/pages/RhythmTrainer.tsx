import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import NotePalette from './rhythm-trainer/NotePalette';
import StaffRow from './rhythm-trainer/StaffRow';
import AddRowButton from './rhythm-trainer/AddRowButton';
import './RhythmTrainer.css';

const RhythmTrainer: React.FC = () => {
  const navigate = useNavigate();
  const { rows, timeSignature, tempo } = useSelector(
    (state: RootState) => state.rhythmTrainer
  );

  return (
    <div className="rhythm-trainer" id="rhythm-trainer-page">
      <header className="rt-header">
        <button className="rt-back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="rt-title">Rhythm Trainer</h1>
        <div className="rt-header-meta">
          <span className="rt-tempo-badge">♩ = {tempo}</span>
          <span className="rt-time-sig-badge">
            {timeSignature[0]}/{timeSignature[1]}
          </span>
        </div>
      </header>

      <div className="rt-layout">
        <NotePalette />

        <main className="rt-sheet">
          <div className="rt-sheet-info">
            <span className="rt-tuning-label">Standard tuning</span>
          </div>

          <div className="rt-rows-container">
            {rows.map((row, index) => (
              <StaffRow
                key={row.id}
                row={row}
                rowIndex={index}
                timeSignature={timeSignature}
                isOnly={rows.length === 1}
              />
            ))}
          </div>

          <AddRowButton />
        </main>
      </div>
    </div>
  );
};

export default RhythmTrainer;
