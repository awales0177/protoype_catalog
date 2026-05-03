import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import { getDataVolumeLast30Days } from '../data/sample_data';

const DEFAULT_DATA_VOLUME_30D = getDataVolumeLast30Days();

function DataVolumeChart({ className = '', compact = false, data: dataProp }) {
  const chartData = dataProp != null && Array.isArray(dataProp) ? dataProp : DEFAULT_DATA_VOLUME_30D;
  return (
    <div className={`dataVolumeChartWrap ${className}`.trim()}>
      <div className="dataVolumeChartHeader">
        <h4 className="dataVolumeChartTitle">Data Volume (Last 30 Days)</h4>
        <button type="button" className="dataVolumeChartRealtimeBtn">
          Real-time
        </button>
      </div>
      <div className="dataVolumeChartInner">
        <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-light)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              unit=" GB"
              domain={[0, 120]}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value) => [`${value} GB`, 'Volume']}
              labelFormatter={(label) => label}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
              labelStyle={{ color: 'var(--text-muted)' }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#2e9ad0"
              strokeWidth={2}
              dot={{ fill: '#2e9ad0', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#2e9ad0', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

DataVolumeChart.propTypes = {
  className: PropTypes.string,
  compact: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, volume: PropTypes.number })),
};

DataVolumeChart.defaultProps = {
  className: '',
  compact: false,
};

export default DataVolumeChart;
