import * as zarr from 'zarrita';
import { get } from '@zarrita/ndarray';

const DATASETS = {
  historical: {
    source: 'https://storage.googleapis.com/cadf/zarr/h-topozarr-3-viz-query.zarr',
    arrayPath: 'query',
    // axes of the query variable, in order
    dims: ['band', 'time', 'y', 'x'],
  },
  forecast: {
    source: 'https://storage.googleapis.com/cadf/zarr/f-topozarr-3-viz-query.zarr',
    arrayPath: 'query',
    dims: ['band', 'stat', 'time', 'lead', 'y', 'x'],
  },
};

function buildContext(timePeriod) {
  let source = DATASETS[timePeriod].source;

  const promise = (async () => {
    const root = zarr.root(new zarr.FetchStore(source));

    const readArray = async (name) => {
      const array = await zarr.open(root.resolve(name), { kind: 'array' });
      return await zarr.get(array);
    };

    const context = {
      array: await zarr.open(root.resolve('query'), { kind: 'array' }),
      x: Array.from((await readArray('x')).data),
      y: Array.from((await readArray('y')).data),
      time: Array.from((await readArray('time')).data),
      band: Array.from((await readArray('band')).data),
    };

    if (timePeriod === 'forecast') {
      context.stat = Array.from((await readArray('stat')).data);
      context.lead = Array.from((await readArray('lead')).data);
    }

    return context;
  })();

  // if the promise rejects, evict it from the cache so the next call
  // to getQueryContext(timePeriod) retries instead of replaying the failure.
  promise.catch(() => queryContextCache.delete(timePeriod));

  // store the promise before returning it (so concurrent callers dedupe)
  queryContextCache.set(timePeriod, promise);

  return promise;
}

// we can memoize with a Map<source URL, Promise<context> cache
const queryContextCache = new Map();
function getQueryContext(timePeriod) {
  // if this source has a context already building / built,
  // use it. otherwise build one and store it.
  if (!(timePeriod in DATASETS)) {
    throw new Error(`Unknown timePeriod: ${timePeriod}`);
  }

  const queryContext = queryContextCache.get(timePeriod) ?? buildContext(timePeriod);

  return queryContext;
}

/**
 * Finds the nearst `target` in the `values` array.
 * Right now, we are using this method to find lat / lon values in their respective arrays.
 * We have already made sure that these values exist in the array beforehand, so we could
 * simply look for the exact index. However we could relax this condition later and query
 * the 'closest' lat / lon value, so are keeping this check for now.
 * @param {float[]} values
 * @param {target} float
 */
function findNearestIndex(values, target) {
  // gaurd against out of bound values
  const min = values[0];
  const max = values[values.length - 1];
  if (target < min || target > max) return null;

  let closestIndex = 0;
  for (let index = 1; index < values.length; index++) {
    // look for the closest index to our target input value is
    if (Math.abs(values[index] - target) < Math.abs(values[closestIndex] - target)) {
      closestIndex = index;
    }
  }
  return closestIndex;
}

/**
 * Finds the `target` in the `values` array. Used for when we are sure the
 * target value in in our array of values to check.
 *
 * We are using this for finding known date strings in 'YYYY-MM-01' format.
 * @param {float[]} string
 * @param {target} string
 */
function findExactIndex(values, target) {
  const index = values.indexOf(target);
  if (index === -1) {
    throw new Error(
      `Date ${target} not in store; available: [${values[0]} … ${values[values.length - 1]}]`
    );
  }
  return index;
}

/**
 * Restructures a `zarrita` point-query result into the `zarr-layer` QueryResult shape.
 * @param {Object} args
 * @param {Object} args.seriesByBand   - { bandLabel: { timeLabel: value } }
 * @param {string[]} args.timeLabels   - e.g. ['2021-01-01', ...]
 * @param {string[]} args.bandLabels   - e.g. ['total', 'percentile']
 * @param {number} args.sampledLat     - y coords of the sampled grid cell
 * @param {number} args.sampledLon     - x coords of the sampled grid cell
 * @param {string} args.variableName   - key the data lives under
 */
export function buildHistoricalQueryResult({
  seriesByBand,
  timeLabels,
  bandLabels,
  lat,
  lon,
  // variableName,
}) {
  // nest each value in a single-element array (point query → 1 pixel)
  const valuesByBand = {};
  bandLabels.forEach((bandLabel) => {
    const series = seriesByBand[bandLabel] ?? {};
    const valuesByTime = {};
    timeLabels.forEach((t) => {
      valuesByTime[t] = [series[t]]; // single-pixel array wrapper
    });
    valuesByBand[bandLabel] = valuesByTime;
  });

  return {
    // [variableName]: valuesByBand,
    data: valuesByBand,
    dimensions: ['band', 'time', 'lat', 'lon'],
    coordinates: {
      band: bandLabels,
      time: timeLabels,
      lat: [lat],
      lon: [lon],
    },
  };
}

export async function queryHistoricalPoint(coords) {
  const [lon, lat] = coords;
  const { array, x, y, time: timeLabels, band: bandLabels } = await getQueryContext('historical');

  const xIndex = findNearestIndex(x, lon);
  const yIndex = findNearestIndex(y, lat);
  if (xIndex === null || yIndex === null) return null;

  // ndarray: shape [band, time, x, y]
  const region = await get(array, [null, null, yIndex, xIndex]);

  const seriesByBand = {};

  bandLabels.forEach((bandLabel, bandIndex) => {
    const timeSeries = {};
    timeLabels.forEach((timeLabel, timeIndex) => {
      timeSeries[timeLabel] = region.get(bandIndex, timeIndex);
    });
    seriesByBand[bandLabel] = timeSeries;
  });

  return buildHistoricalQueryResult({
    seriesByBand,
    timeLabels,
    bandLabels,
    // the grid cell sampled, not the clicked lat
    lat: y[yIndex],
    lon: x[xIndex],
    // variableName: 'query',
  });
}

export async function queryForecastPoint(coords, targetDate = null) {
  if (!targetDate) return;

  const [lon, lat] = coords;
  const {
    array,
    x,
    y,
    band: bandLabels,
    stat: statLabels,
    lead: leadLabels,
    time: timeLabels,
  } = await getQueryContext('forecast');

  const xIndex = findNearestIndex(x, lon);
  const yIndex = findNearestIndex(y, lat);
  if (xIndex === null || yIndex === null) return null;

  const timeIndex = timeLabels.indexOf(targetDate);
  if (timeIndex === -1) return null;

  // ndarray: shape [band, stat, time, lead, x, y]
  // query all 'band', all 'stat', one 'time' (target_date), all 'lead', x / y slice
  const region = await get(array, [null, null, timeIndex, null, yIndex, xIndex]);

  const seriesByBand = {};

  bandLabels.forEach((bandLabel, bandIndex) => {
    const seriesByStat = {};
    statLabels.forEach((statLabel, statIndex) => {
      const seriesByLead = {};
      leadLabels.forEach((leadLabel, leadIndex) => {
        seriesByLead[leadLabel] = [region.get(bandIndex, statIndex, leadIndex)];
      });
      seriesByStat[statLabel] = seriesByLead;
    });
    seriesByBand[bandLabel] = seriesByStat;
  });

  return {
    data: seriesByBand,
    dimensions: ['band', 'stat', 'lead', 'lat', 'lon'],
    coordinates: {
      band: bandLabels,
      stat: statLabels,
      time: timeLabels[timeIndex],
      lead: leadLabels,
      lat: [context.y[yIndex]],
      lon: [context.x[xIndex]],
    },
  };
}

export async function queryCoordinates(coords, timePeriod = 'historical', targetDate = null) {
  if (timePeriod === 'forecast') {
    return queryForecastPoint(coords, targetDate);
  }
  return queryHistoricalPoint(coords);
}
