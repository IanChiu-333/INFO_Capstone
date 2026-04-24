import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { EnrollmentDataPoint } from '../../services';

interface Props {
  data: EnrollmentDataPoint[];
}

export default function EnrollmentTrendChart({ data }: Props) {
  const maxCount = Math.max(...data.map(d => d.count), 0);
  const yMax = Math.ceil((maxCount * 1.2) / 20) * 20;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9ebed" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, yMax]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#0972d3"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0972d3' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
