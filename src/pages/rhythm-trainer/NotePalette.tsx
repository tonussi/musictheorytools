import React from 'react';
import { NOTE_PALETTE_ITEMS, REST_PALETTE_ITEMS, PaletteItem } from './musicConstants';

const DRAG_DATA_KEY = 'application/rhythm-note';

interface DragPayload {
  duration: string;
  type: string;
}

const NotePalette: React.FC = () => {
  const handleDragStart = (event: React.DragEvent, item: PaletteItem) => {
    const payload: DragPayload = { duration: item.duration, type: item.type };
    event.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="rt-palette" id="note-palette">
      <h3 className="rt-palette-title">Notes</h3>
      <div className="rt-palette-group">
        {NOTE_PALETTE_ITEMS.map(item => (
          <div
            key={`note-${item.duration}`}
            id={`palette-note-${item.duration}`}
            className="rt-palette-item"
            draggable
            onDragStart={e => handleDragStart(e, item)}
          >
            <span className="rt-palette-symbol">{item.symbol}</span>
            <span className="rt-palette-label">{item.label}</span>
          </div>
        ))}
      </div>

      <h3 className="rt-palette-title">Rests</h3>
      <div className="rt-palette-group">
        {REST_PALETTE_ITEMS.map(item => (
          <div
            key={`rest-${item.duration}`}
            id={`palette-rest-${item.duration}`}
            className="rt-palette-item rt-palette-item--rest"
            draggable
            onDragStart={e => handleDragStart(e, item)}
          >
            <span className="rt-palette-symbol">{item.symbol}</span>
            <span className="rt-palette-label">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export { DRAG_DATA_KEY };
export default NotePalette;
