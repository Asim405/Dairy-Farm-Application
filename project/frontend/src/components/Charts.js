import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------
// 1. Line / Area Trend Chart (e.g. Milk Production Trend)
// -------------------------------------------------------------
export const LineTrendChart = ({
  data = [],
  width = SCREEN_WIDTH - 64,
  height = 180,
  strokeColor = '#2F8C83',
  fillColor = '#2F8C83',
  yKey = 'total_liters',
  xKey = 'day_name',
  unit = 'L',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyChart, { height }]}>
        <Text style={styles.emptyText}>No data available for trend</Text>
      </View>
    );
  }

  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => Number(d[yKey] || 0));
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((Number(d[yKey] || 0) - minVal) / range) * chartHeight;
    return { x, y, val: Number(d[yKey] || 0), label: d[xKey] || '' };
  });

  // Build SVG Path
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Grid steps (3 horizontal lines)
  const gridSteps = [0, 0.5, 1];

  return (
    <View style={styles.chartContainer}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines & Y Axis Labels */}
        {gridSteps.map((step, i) => {
          const yPos = paddingTop + chartHeight - step * chartHeight;
          const valLabel = Math.round(minVal + step * range);
          return (
            <G key={i}>
              <Line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#EAECF0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <SvgText
                x={paddingLeft - 8}
                y={yPos + 4}
                fill="#98A2B3"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {valLabel}
                {unit}
              </SvgText>
            </G>
          );
        })}

        {/* Area fill */}
        <Path d={areaD} fill="url(#lineGrad)" />

        {/* Smooth Line */}
        <Path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" />

        {/* Data points & X labels */}
        {points.map((pt, i) => (
          <G key={i}>
            <Circle cx={pt.x} cy={pt.y} r="4" fill="#fff" stroke={strokeColor} strokeWidth="2" />
            <SvgText
              x={pt.x}
              y={height - 8}
              fill="#667085"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
            >
              {pt.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
};

// -------------------------------------------------------------
// 2. Bar Chart (Single & Comparison e.g. Revenue vs Expense)
// -------------------------------------------------------------
export const BarChart = ({
  data = [],
  width = SCREEN_WIDTH - 64,
  height = 180,
  barColor = '#4FA765',
  secondaryColor = '#F04438',
  xKey = 'label',
  yKey = 'value',
  secondaryYKey = null,
  unit = '',
  showLegend = false,
  legend1 = 'Revenue',
  legend2 = 'Expense',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyChart, { height }]}>
        <Text style={styles.emptyText}>No data available for chart</Text>
      </View>
    );
  }

  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allVals = data.flatMap((d) => [
    Number(d[yKey] || 0),
    secondaryYKey ? Number(d[secondaryYKey] || 0) : 0,
  ]);
  const maxVal = Math.max(...allVals, 10);
  const range = maxVal || 1;

  const groupWidth = chartWidth / data.length;
  const barWidth = secondaryYKey ? Math.min(14, groupWidth / 2.6) : Math.min(24, groupWidth * 0.55);

  return (
    <View style={styles.chartContainer}>
      {showLegend && secondaryYKey && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: barColor }]} />
            <Text style={styles.legendText}>{legend1}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: secondaryColor }]} />
            <Text style={styles.legendText}>{legend2}</Text>
          </View>
        </View>
      )}

      <Svg width={width} height={height}>
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((step, i) => {
          const yPos = paddingTop + chartHeight - step * chartHeight;
          const valLabel = Math.round(step * range);
          return (
            <G key={i}>
              <Line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#EAECF0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <SvgText
                x={paddingLeft - 6}
                y={yPos + 4}
                fill="#98A2B3"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                {valLabel >= 1000 ? `${(valLabel / 1000).toFixed(0)}k` : valLabel}
                {unit}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const groupCenterX = paddingLeft + (idx + 0.5) * groupWidth;
          const val1 = Number(item[yKey] || 0);
          const barHeight1 = Math.max(2, (val1 / range) * chartHeight);
          const y1 = paddingTop + chartHeight - barHeight1;

          if (secondaryYKey) {
            const val2 = Number(item[secondaryYKey] || 0);
            const barHeight2 = Math.max(2, (val2 / range) * chartHeight);
            const y2 = paddingTop + chartHeight - barHeight2;

            const x1 = groupCenterX - barWidth - 2;
            const x2 = groupCenterX + 2;

            return (
              <G key={idx}>
                <Rect x={x1} y={y1} width={barWidth} height={barHeight1} rx="4" fill={barColor} />
                <Rect x={x2} y={y2} width={barWidth} height={barHeight2} rx="4" fill={secondaryColor} />
                <SvgText
                  x={groupCenterX}
                  y={height - 10}
                  fill="#667085"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {item[xKey]}
                </SvgText>
              </G>
            );
          }

          const x = groupCenterX - barWidth / 2;
          return (
            <G key={idx}>
              <Rect x={x} y={y1} width={barWidth} height={barHeight1} rx="4" fill={barColor} />
              <SvgText
                x={groupCenterX}
                y={height - 10}
                fill="#667085"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {item[xKey]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// -------------------------------------------------------------
// 3. Donut / Pie Chart (e.g. Category Distribution)
// -------------------------------------------------------------
const PALETTE = ['#4FA765', '#2F8C83', '#E07A16', '#C23B3B', '#6A4A3C', '#2C4D5F', '#8E44AD'];

export const DonutChart = ({
  data = [],
  size = 140,
  strokeWidth = 22,
  labelKey = 'category',
  valueKey = 'count',
  totalLabel = 'Total',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyChart, { height: 120 }]}>
        <Text style={styles.emptyText}>No distribution data</Text>
      </View>
    );
  }

  const total = data.reduce((acc, it) => acc + Number(it[valueKey] || 0), 0);
  if (total === 0) {
    return (
      <View style={[styles.emptyChart, { height: 120 }]}>
        <Text style={styles.emptyText}>No active items</Text>
      </View>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <View style={styles.donutWrapper}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {data.map((item, idx) => {
              const val = Number(item[valueKey] || 0);
              const fraction = val / total;
              const strokeDashoffset = circumference * (1 - fraction);
              const rotation = (accumulatedAngle / total) * 360;
              accumulatedAngle += val;
              const color = PALETTE[idx % PALETTE.length];

              return (
                <Circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  fill="none"
                  strokeLinecap="round"
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.donutCenterLabel}>
          <Text style={styles.donutTotalValue}>{total}</Text>
          <Text style={styles.donutTotalText}>{totalLabel}</Text>
        </View>
      </View>

      {/* Legend list */}
      <View style={styles.donutLegend}>
        {data.map((item, idx) => {
          const val = Number(item[valueKey] || 0);
          const pct = Math.round((val / total) * 100);
          const color = PALETTE[idx % PALETTE.length];
          return (
            <View key={idx} style={styles.donutLegendRow}>
              <View style={[styles.donutLegendDot, { backgroundColor: color }]} />
              <Text style={styles.donutLegendName} numberOfLines={1}>
                {item[labelKey]}
              </Text>
              <Text style={styles.donutLegendVal}>
                {val} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 4. Progress Bar
// -------------------------------------------------------------
export const CustomProgressBar = ({ progress = 0.5, color = '#4FA765', height = 6 }) => {
  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 12,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#667085',
  },
  donutWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 16,
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#101828',
  },
  donutTotalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#667085',
    textTransform: 'uppercase',
  },
  donutLegend: {
    flex: 1,
    gap: 6,
  },
  donutLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  donutLegendName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#344054',
  },
  donutLegendVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#667085',
    marginLeft: 6,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#EAECF0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
  },
});
