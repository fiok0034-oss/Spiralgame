import React from 'react';
import { GeoRadarScanner } from './GeoRadarScanner';

interface GeoradarMiniGameProps {
  onAnomalyLocked: () => void;
  isCompleted?: boolean;
}

export const GeoradarMiniGame: React.FC<GeoradarMiniGameProps> = ({
  onAnomalyLocked,
  isCompleted = false,
}) => {
  return <GeoRadarScanner onAnomalyLocked={onAnomalyLocked} isCompleted={isCompleted} />;
};
