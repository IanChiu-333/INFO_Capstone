import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { StageDistribution } from '../../services';

interface Props {
  data: StageDistribution[];
}

export default function StageDistributionChart({ data }: Props) {
  const maxCount = Math.max(...data.map(d => d.count), 0);
  const yMax = Math.ceil((maxCount * 1.2) / 10) * 10;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9ebed" />
        <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, yMax]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#0972d3" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
