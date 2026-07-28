import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C, PageHeader, Surface } from '../ui/primitives';

export interface MenuTile {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface MenuTilePageProps {
  title: string;
  subtitle?: string;
  tiles: MenuTile[];
}

const MenuTilePage: React.FC<MenuTilePageProps> = ({ title, subtitle, tiles }) => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="ui-action-grid">
        {tiles.map((tile) => (
          <Surface
            key={tile.path}
            className="ui-action-card"
            onClick={() => navigate(tile.path)}
          >
            <div className="ui-action-card-icon">{tile.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 750, color: C.heading }}>{tile.label}</div>
            {tile.description && (
              <div style={{ fontSize: 12, color: C.secondary, textAlign: 'center' }}>{tile.description}</div>
            )}
          </Surface>
        ))}
      </div>
    </div>
  );
};

export default MenuTilePage;
