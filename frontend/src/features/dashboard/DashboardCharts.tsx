import { Box, Stack, Typography, useTheme } from '@mui/material';

interface TrendPoint {
  label: string;
  value: number;
}

interface BreakdownItem {
  label: string;
  value: number;
}

const chartHeight = 180;
const chartWidth = 320;

export const MiniBarChart = ({
  data,
  color
}: {
  data: TrendPoint[];
  color: string;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const barWidth = chartWidth / Math.max(data.length, 1);

  return (
    <Box>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight} role="img">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 120;
          const x = index * barWidth + 14;
          const y = 140 - height;

          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth - 28} height={height} rx="10" fill={color} opacity="0.9" />
              <text x={x + (barWidth - 28) / 2} y={chartHeight - 18} textAnchor="middle" fontSize="11" fill="#6b7b83">
                {item.label}
              </text>
              <text x={x + (barWidth - 28) / 2} y={y - 8} textAnchor="middle" fontSize="11" fill="#29434e">
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export const ProgressChart = ({ data }: { data: BreakdownItem[] }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Stack spacing={2}>
      {data.map((item) => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.value}
            </Typography>
          </Stack>
          <Box sx={{ height: 10, bgcolor: '#dbe8ed', borderRadius: 999 }}>
            <Box
              sx={{
                height: '100%',
                width: `${(item.value / maxValue) * 100}%`,
                bgcolor: theme.palette.secondary.main,
                borderRadius: 999
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export const DonutSummary = ({ data }: { data: BreakdownItem[] }) => {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#ffa726',
    '#ef5350',
    '#8d6e63'
  ];

  let offset = 0;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
      <svg viewBox="0 0 140 140" width="140" height="140" role="img">
        <circle cx="70" cy="70" r="42" fill="none" stroke="#e2edf1" strokeWidth="20" />
        {data.map((item, index) => {
          const fraction = item.value / total;
          const length = fraction * 264;
          const circle = (
            <circle
              key={item.label}
              cx="70"
              cy="70"
              r="42"
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth="20"
              strokeDasharray={`${length} 264`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="round"
            />
          );
          offset += length;
          return circle;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="14" fill="#607d8b">
          Total
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1f2f36">
          {total}
        </text>
      </svg>
      <Stack spacing={1} sx={{ width: '100%' }}>
        {data.map((item, index) => (
          <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: colors[index % colors.length]
                }}
              />
              <Typography variant="body2">{item.label}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {item.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
