
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, LearningType } from '../types';
import { ABC_TYPES } from '../constants';

interface Props {
  activities: Activity[];
}

const renderCustomPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
  const type = payload.value as LearningType;
  // Récupération des trois premières lettres
  const label = type.substring(0, 3);
  const color = ABC_TYPES[type].color;

  return (
    <text
      {...rest}
      verticalAnchor="middle"
      y={y + (y - cy) / 10}
      x={x + (x - cx) / 10}
      fill={color}
      fontSize="10"
      fontWeight="900"
      className="uppercase tracking-tighter"
    >
      {label}
    </text>
  );
};

const LearningProfileChart: React.FC<Props> = ({ activities }) => {
  const data = Object.values(LearningType).map(type => {
    const totalDuration = activities
      .filter(a => a.type === type)
      .reduce((sum, a) => sum + a.duration, 0);
    
    return {
      type,
      duration: totalDuration,
      fullMark: 100,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="type" 
            tick={renderCustomPolarAngleAxis}
          />
          <Radar
            name="Temps par mode"
            dataKey="duration"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`${value} min`, 'Durée']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LearningProfileChart;
