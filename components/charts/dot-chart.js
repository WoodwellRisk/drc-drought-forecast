'use client';

import { useEffect, useState, useRef } from 'react';
import { Box } from 'theme-ui';
import { alpha } from '@theme-ui/color';
import * as d3 from 'd3';

import { arrayRange, useStore } from '../store/index';

export default function DotChart() {
  const containerRef = useRef(null);

  const variable = useStore((state) => state.variable);
  const forecastDates = useStore((state) => state.forecastDates);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const colormap = useStore((state) => state.colormap)();
  const plotData = useStore((state) => state.plotData);
  const gintoUri = useStore((state) => state.gintoUri);

  const varMax = variable == 'percent' ? 100 : 300;
  const xAxisTitle = variable == 'percent' ? 'Percentile' : 'Precipitation (mm)';

  const min = 0;
  const max = varMax;
  const range = max - min;
  const nBins = 11;
  const binWidth = range / nBins;
  let thresholds = arrayRange(min + binWidth, max + binWidth, binWidth);
  const colorScale = d3.scaleThreshold().domain(thresholds).range(colormap);

  // chart layout
  const width = 310;
  const height = 270;
  const paddingTop = 20;
  const paddingLeft = 45;
  const paddingBottom = 50;
  const paddingRight = 20;
  const extraPaddingX = 10;
  const paddingXLabel = 5;

  // formatted chart data
  const [chartData, setChartData] = useState({ data: null, tidyPoints: null });

  // x axis
  const xScale = d3
    .scaleLinear()
    .domain([0, varMax])
    .range([paddingLeft, width - paddingRight - extraPaddingX]); // leave space for y‑axis labels

  const xAxis = d3.axisBottom(xScale);
  if (variable == 'percent') {
    xAxis.tickValues([0, 25, 50, 75, 100]);
  } else {
    xAxis.tickValues([0, 50, 100, 150, 200, 250, 300]);
  }

  // y axis
  let datesJS = forecastDates.map((t) => {
    let [year, month, day] = t.split('-');
    return new Date(year, parseInt(month) - 1, day);
  });
  const formatDate = d3.timeFormat('%m-%Y');
  const formattedDates = datesJS.map(formatDate);

  const yScale = d3
    .scaleBand()
    .domain(formattedDates.map((d) => d)) // format as YYYY‑MM‑DD
    .range([0, height - paddingBottom - paddingXLabel]) // top & bottom padding
    .paddingInner(0.3);

  const yAxis = d3.axisLeft(yScale);
  yAxis.tickSize(0);

  // function that (re)draws the chart whenever the container size changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (
      !variable ||
      !plotData ||
      !plotData[variable] ||
      Object.keys(plotData[variable]).length == 0
    )
      return;

    // format data
    // the data for plotting each line or row on the dot chart
    // our data starts out like this:
    // 5: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 20: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 50: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 80: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }​
    // 95: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }

    // then we filter it for max values so it looks like:
    // 0: Object { date: "10-2025", x: (5) […] }
    // 1: Object { date: "11-2025", x: (5) […] }
    // 2: Object { date: "12-2025", x: (5) […] }
    // 3: Object { date: "01-2026", x: (5) […] }
    // 4: Object { date: "02-2026", x: (5) […] }
    // 5: Object { date: "03-2026", x: (5) […] }
    const data = forecastDates.map((date, idx) => {
      let [year, month, day] = date.split('-');
      let formattedDate = `${month}-${year}`;
      let values = confidenceArray.map((confidence) => {
        let val = plotData[variable][confidence][date][0];
        return val > varMax ? varMax : val;
      });

      return {
        date: formattedDate,
        x: values,
      };
    });

    // the data for plotting each point on the dot chart
    // a flatted version of the `data` array
    // 0: Object { date: "10-2025", x: ..., confidence: 5 }
    // 1: Object { date: "10-2025", x: ..., confidence: 20 }
    // 2: Object { date: "10-2025", x: ..., confidence: 50 }
    // 3: Object { date: "10-2025", x: ..., confidence: 80 }
    // 4: Object { date: "10-2025", x: ..., confidence: 95 }
    // 5: Object { date: "11-2025", x: ..., confidence: 5 }
    // 6: Object { date: "11-2025", x: ..., confidence: 20 }
    // 7: Object { date: "11-2025", x: ..., confidence: 50 }
    // 8: Object { date: "11-2025", x: ..., confidence: 80 }
    // 9: Object { date: "11-2025", x: ..., confidence: 95 }
    const tidyPoints = [];
    Object.values(data).forEach((row) => {
      row.x.forEach((val, idx) => {
        tidyPoints.push({
          date: row.date,
          x: val > varMax ? varMax : val,
          confidence: confidenceArray[idx],
        });
      });
    });

    setChartData({
      data: data,
      tidyPoints: tidyPoints,
    });
  }, [plotData]);

  return (
    <Box
      id={'chart'}
      ref={containerRef}
      preserveAspectRatio="xMidYMid meet"
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* this is the container svg */}
      <svg id={'dot-chart'} width={'100%'} height={'100%'}>
        <style type="text/css">
          {`
            @font-face {
                font-family: 'ginto-normal';
                src: url('${gintoUri}') format('truetype');
            }
        `}
        </style>

        {/* this ensures that the svg or png has a white background */}
        <rect width={'100%'} height={'100%'} fill={'background'} />

        <g id={'x-axis'} transform={`translate(${extraPaddingX}, ${height - paddingBottom})`}>
          {/* axis line */}
          <line
            x1={xScale(0)}
            y1={0}
            x2={xScale(varMax)}
            y2={0}
            stroke={'currentColor'}
            fill={'none'}
          />

          {xAxis.tickValues().map((tick, idx) => (
            <g key={idx} transform={`translate(${xScale(tick)}, 0)`}>
              {/* grid line */}
              <line
                y1={-0.5} // bottom of grid line
                y2={6} // top of grid line
                stroke="currentColor"
              />
              {/* tick */}
              <text
                style={{
                  fontSize: '0.625rem',
                  textAnchor: 'middle',
                  transform: 'translateY(1rem)',
                  fontFamily: 'ginto-normal',
                }}
              >
                {tick}
              </text>
            </g>
          ))}
        </g>

        <g id={'x-axis-label'}>
          <text
            x={(width + paddingLeft) / 2}
            y={height - paddingXLabel - 10}
            textAnchor={'middle'}
            fontSize={'0.75rem'}
            fontFamily={'ginto-normal'}
          >
            {xAxisTitle}
          </text>
        </g>

        <g id={'y-axis'} transform={`translate(${paddingLeft}, 0)`}>
          {formattedDates.map((date, i) => {
            return (
              <g className={'y-axis-label'}>
                <text
                  x={0 - paddingRight}
                  y={yScale(date) + yScale.bandwidth() / 2}
                  textAnchor={'middle'}
                  dominantBaseline={'middle'}
                  dy={'0.1em'}
                  fontSize={'0.625rem'}
                  fontFamily={'ginto-normal'}
                >
                  {date}
                </text>
              </g>
            );
          })}
        </g>

        {/* horizontal lines */}
        {chartData?.data?.map((d, idx) => {
          const x1 = xScale(d3.min(d.x)) + extraPaddingX;
          const x2 = xScale(d3.max(d.x)) + extraPaddingX;
          const y = yScale(d.date) + yScale.bandwidth() / 2;

          return (
            <line
              key={`line-${idx}`}
              className={'hline'}
              x1={x1}
              x2={x2}
              y1={y}
              y2={y}
              // stroke={alpha('muted', 0.3)}
              stroke={'rgba(27, 30, 35, 0.3'}
              strokeWidth={2}
              strokeLinecap={'round'}
            />
          );
        })}

        {/* circles */}
        {chartData?.tidyPoints?.map((d, idx) => {
          const cx = xScale(d.x) + extraPaddingX;
          const cy = yScale(d.date) + yScale.bandwidth() / 2;
          const r = 4;
          const size = r + 2;
          const color = colorScale(d.x);

          if (d.confidence == 50) {
            return (
              <polygon
                key={`diamond-${idx}`}
                points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${
                  cx - size
                },${cy}`}
                fill={color}
                stroke={'#1b1e23'}
                strokeWidth={0.5}
              />
            );
          } else {
            return (
              <circle
                key={`circle-${idx}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                stroke={'#1b1e23'}
                strokeWidth={0.5}
              />
            );
          }
        })}
      </svg>
    </Box>
  );
}
