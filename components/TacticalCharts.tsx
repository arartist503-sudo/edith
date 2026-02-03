import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  activeDrones: number;
  shieldLevel: number;
}

const generateData = () => [...Array(20)].map((_, i) => ({
  time: i,
  val: 30 + Math.random() * 50
}));

export const TacticalCharts: React.FC<Props> = ({ activeDrones, shieldLevel }) => {
  const data = React.useMemo(() => generateData(), []);
  
  const shieldData = [
    { name: 'FRONT', val: shieldLevel },
    { name: 'REAR', val: shieldLevel * 0.9 },
    { name: 'LEFT', val: shieldLevel * 0.95 },
    { name: 'RIGHT', val: shieldLevel * 0.95 },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="h-24 w-full">
         <div className="text-[10px] text-stark-blue/70 mb-1">ENERGY OUTPUT</div>
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#00a8ff" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#00a8ff" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val" stroke="#00a8ff" fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      <div className="h-24 w-full">
         <div className="text-[10px] text-stark-blue/70 mb-1">SHIELD INTEGRITY</div>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shieldData}>
              <Bar dataKey="val" fill="#00a8ff" />
            </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};