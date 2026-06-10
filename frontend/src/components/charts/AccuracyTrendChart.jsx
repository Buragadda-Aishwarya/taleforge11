import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



export default function AccuracyTrendChart({ data }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            domain={['dataMin - 1', 100]} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              borderColor: '#3f3f46',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#d8b4fe' }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ fill: '#18181b', stroke: '#a855f7', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
