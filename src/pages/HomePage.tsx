import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

interface Tool {
  id: number;
  icon: string;
  title: string;
  description: string;
  route: string;
  accent: string;
  comingSoon: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 1,
    icon: '🎸',
    title: 'Chord Viewer',
    description: 'View guitar chord formulas with sliding overlays',
    route: '/chord-viewer',
    accent: '#22c55e',
    comingSoon: false,
  },
  {
    id: 2,
    icon: '🎵',
    title: 'Circle of Fifths',
    description: 'Rotate the overlay to explore keys and chord relationships',
    route: '/circle-of-fifths',
    accent: '#fbbf24',
    comingSoon: false,
  },
  {
    id: 3,
    icon: '🎹',
    title: 'Harmonic Field',
    description: 'Build the major harmonic field — Tonic, Subdominant, Dominant',
    route: '/harmonic-field',
    accent: '#a78bfa',
    comingSoon: false,
  },
  {
    id: 4,
    icon: '🥁',
    title: 'Rhythm Trainer',
    description: 'Practice rhythm patterns and time signatures',
    route: '#',
    accent: '#f472b6',
    comingSoon: true,
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleToolClick = (tool: Tool) => {
    if (!tool.comingSoon) {
      navigate(tool.route);
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Music Theory Tools</h1>
        <p className="home-subtitle">Interactive tools to explore harmony, rhythm, and structure</p>
      </header>
      <div className="tools-grid">
        {TOOLS.map((tool, index) => (
          <div
            key={tool.id}
            className={`tool-card${tool.comingSoon ? ' disabled' : ''}`}
            style={{ '--card-index': index, '--accent': tool.accent } as React.CSSProperties}
            onClick={() => handleToolClick(tool)}
          >
            <span className="tool-card-icon">{tool.icon}</span>
            <div className="tool-card-content">
              <h2 className="tool-card-title">{tool.title}</h2>
              <p className="tool-card-description">{tool.description}</p>
            </div>
            <div className="tool-card-footer">
              {tool.comingSoon ? (
                <span className="tool-card-badge">Coming Soon</span>
              ) : (
                <span className="tool-card-arrow">→</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;