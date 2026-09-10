import { makeColormap } from '@carbonplan/colormaps';
import { create } from 'zustand';

// const MIN_HISTORICAL_DATE = '1991-01-01';
const MIN_HISTORICAL_DATE = '2021-01-01';
// const MAX_HISTORICAL_DATE = '2026-07-01';
// const MAX_HISTORICAL_DATE = '2025-09-01';
const MAX_HISTORICAL_DATE = '2024-12-01';
// const INITIAL_FORECAST_DATE = '2025-10-01';
// const MIN_FORECAST_DATE = MIN_HISTORICAL_DATE;
// const MAX_FORECAST_DATE = MAX_HISTORICAL_DATE;

export const arrayRange = (start, end, step) => {
  let output = [];
  for (let idx = start; idx < end; idx += step) {
    output.push(idx);
  }
  return output;
};

const validMonths = arrayRange(1, 13, 1)
  .map(String)
  .map((val) => val.padStart(2, '0'));
const validYears = arrayRange(1991, 2027, 1).map(String);

const generateDates = (startDate, monthsRange) => {
  const dates = [];
  const [year, month, day] = startDate.split('-').map(Number);

  monthsRange.forEach((value) => {
    const date = new Date(year, month - 1 + value, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
  });

  return dates;
};

// https://stackoverflow.com/a/15158873
const getDifferenceInMonths = (startDateString, endDateString) => {
  let startDate = new Date(startDateString);
  let endDate = new Date(endDateString);

  if (startDate > endDate) {
    throw new Error('End date must be later than start date.');
  }

  return (
    // the `+ 1` keeps the end date included, which we want
    endDate.getMonth() -
    startDate.getMonth() +
    1 +
    (endDate.getFullYear() - startDate.getFullYear()) * 12
  );
};

// const createForecastDates = () => {
//   let forecastDate = INITIAL_FORECAST_DATE;
//   let monthsRange = arrayRange(0, 6, 1);

//   return {
//     forecastDate: forecastDate,
//     forecastDates: generateDates(forecastDate, monthsRange),
//   };
// };

const createForecastDates = () => {
  let minDate = MIN_HISTORICAL_DATE;
  let maxDate = MAX_HISTORICAL_DATE;
  let monthsBetweenDates = getDifferenceInMonths(minDate, maxDate);
  let monthsRange = arrayRange(0, monthsBetweenDates, 1);

  return {
    forecastDate: maxDate,
    forecastDates: generateDates(minDate, monthsRange),
  };
};

const createHistoricalDates = () => {
  let minDate = MIN_HISTORICAL_DATE;
  let maxDate = MAX_HISTORICAL_DATE;
  let monthsBetweenDates = getDifferenceInMonths(minDate, maxDate);
  let monthsRange = arrayRange(0, monthsBetweenDates, 1);

  return {
    maxHistoricalDate: maxDate,
    historicalDate: maxDate,
    historicalDates: generateDates(minDate, monthsRange),
    validMonths: validMonths,
    validYears: validYears,
  };
};

export const useStore = create((set, get) => ({
  // map container state
  initialZoom: 3,
  zoom: 3,
  setZoom: (zoom) => set({ zoom }),

  // minZoom: 1,
  minZoom: 2,
  maxZoom: 7,

  // this is for the initial map load
  initialCenter: [28.5, -1.0],
  center: [28.5, -1.0],
  setCenter: (center) => set({ center }),

  // https://docs.mapbox.com/mapbox-gl-js/example/fitbounds/
  // [west, south, east, north]
  // bounds: [-11.0, -31.5, 64.0, 35.0],
  bounds: [-50.0, -41.5, 95.0, 45.0],

  variableArray: ['percentile', 'total'],
  variable: 'percentile',
  setVariable: (variable) => set({ variable }),

  variableIdx: 0,
  setVariableIdx: (variableIdx) => set({ variableIdx }),

  confidenceArray: [5, 20, 50, 80, 95],
  confidence: 50,
  setConfidence: (confidence) => set({ confidence }),

  confidenceIdx: 2,
  setConfidenceIdx: (confidenceIdx) => set({ confidenceIdx }),

  band: () => {
    const { variable, confidence } = get();
    return `${variable}_${confidence}`;
  },

  // handle dates
  ...createForecastDates(),
  setForecastMonth: (forecastMonth) => set({ forecastMonth }),
  setForecastDate: (forecastDate) => set({ forecastDate }),
  setForecastSliderIndex: (forecastSliderIndex) => set({ forecastSliderIndex }),

  ...createHistoricalDates(),
  setHistoricalDate: (historicalDate) => set({ historicalDate }),
  setHistoricalSliderIndex: (historicalSliderIndex) => set({ historicalSliderIndex }),

  // time: INITIAL_FORECAST_DATE,
  time: MAX_HISTORICAL_DATE,
  setTime: (time) => set({ time }),

  // this is for the secondary forecast slider
  lead: 1,
  setLead: (lead) => set({ lead }),
  leadIndex: 1,
  setLeadIndex: (leadIndex) => set({ leadIndex }),

  // timePeriodOptions: { historical: false, forecast: true },
  // setTimePeriodOptions: (newOptions) => {
  //   const timePeriod = Object.keys(newOptions).find((key) => newOptions[key] === true);
  //   set({
  //     timePeriodOptions: newOptions,
  //     timePeriod: timePeriod,
  //   });
  // },
  timePeriod: 'historical',
  setTimePeriod: (timePeriod) => set({ timePeriod }),

  showTimeError: false,
  setShowTimeError: (showTimeError) => set({ showTimeError }),

  gintoUri: null,
  setGintoUri: (gintoUri) => set({ gintoUri }),

  gemeliUri: null,
  setGemeliUri: (gemeliUri) => set({ gemeliUri }),

  // this is the 'icefire' palette from seaborn, but reversed
  icefire: [
    '#ffd4ac',
    '#f18f51',
    '#d34936',
    '#932e44',
    '#4a252e',
    '#1f1e1e',
    '#302e4a',
    '#4a4fa5',
    '#3885d0',
    '#75b8ce',
    '#bde7db',
  ],
  // this is the RdBu colormap from Matplotlib, but with the central color changed to a different white and the two darkest colors clipped on each end
  redblue: [
    '#a51429',
    '#c94741',
    '#e58368',
    '#f7b799',
    '#fcdfcf',
    '#f6f7f7',
    '#d7e8f1',
    '#a7d0e4',
    '#68abd0',
    '#3783bb',
    '#1c5c9f',
  ],
  // this is the 'redteal' colormap from carbonplan
  redteal: [
    '#F57273',
    '#FB908D',
    '#FFACA9',
    '#FFC8C5',
    '#FFE3E1',
    '#FFFFFF',
    '#E2F1F3',
    '#C4E3E7',
    '#A6D5DB',
    '#87C7D0',
    '#64B9C4',
  ],
  // this is the 'warm' colormap from carbonplan, reversed
  warm: [
    '#FFFFFF',
    '#FFF3BE',
    '#FFE3A1',
    '#FFD391',
    '#FFC187',
    '#FEAF83',
    '#F59F8F',
    '#E8919C',
    '#D884A9',
    '#C379B6',
    '#A771C5',
  ],
  // this is the 'cool' colormap from carbonplan, reversed
  cool: [
    '#FFFFFF',
    '#F1F7BC',
    '#D6EFAF',
    '#B7E6B3',
    '#A5D8C0',
    '#A1C8CB',
    '#9EB8D1',
    '#9EA7D3',
    '#9F96D2',
    '#A384CD',
    '#A771C5',
  ],
  colormap: () => {
    const { variable, redteal, cool } = get();
    return variable == 'percentile' ? redteal : cool;
  },

  climRanges: {
    percentile: { min: 0.0, max: 100.0 },
    total: { min: 0.0, max: 300.0 },
  },
  clim: () => {
    const { climRanges, variable } = get();
    return [climRanges[variable].min, climRanges[variable].max];
  },

  raster: { current: null },
  setRaster: (ref) => set((state) => ({ raster: ref })),

  showCharts: false,
  setShowCharts: (showCharts) => set({ showCharts }),

  filterCoordinates: [],
  setFilterCoordinates: (filterCoordinates) => set({ filterCoordinates }),

  plotData: {},
  setPlotData: (plotData) => set({ plotData }),

  showLandLayer: true,
  setShowLandLayer: (showLandLayer) => set({ showLandLayer }),

  showCountriesLayer: true,
  setShowCountriesLayer: (showCountriesLayer) => set({ showCountriesLayer }),

  showStatesLayer: false,
  setShowStatesLayer: (showStatesLayer) => set({ showStatesLayer }),

  showLakesLayer: true,
  setShowLakesLayer: (showLakesLayer) => set({ showLakesLayer }),

  sliding: false,
  setSliding: (sliding) => set({ sliding }),

  showDesktopSettings: true,
  setShowDesktopSettings: (showDesktopSettings) => set({ showDesktopSettings }),

  showMobileSettings: false,
  setShowMobileSettings: (showMobileSettings) => set({ showMobileSettings }),

  showAbout: false,
  setShowAbout: (showAbout) => set({ showAbout }),

  showMenu: false,
  setShowMenu: (showMenu) => set({ showMenu }),

  showOverlays: false,
  setShowOverlays: (showOverlays) => set({ showOverlays }),

  defaultLabels: { percentile: 'Percentile', total: 'Monthly total' },
  defaultUnits: { percentile: '(%)', total: '(mm)' },
}));
