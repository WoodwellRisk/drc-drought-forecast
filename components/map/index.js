import { Box, useThemeUI } from 'theme-ui';
import { useState, useEffect } from 'react';
import { Slider } from '@carbonplan/components';

import MapProvider from './map-provider';
import Basemap from './basemap';
import Fill from './fill';
import Line from './line';
import Raster from './raster';
import PointQuery from './point-query';
import Router from './router';
import ZoomReset from './zoom-reset';
import LayerOrder from './layer-order';
import { useStore } from '../store/index';

export const Map = () => {
  const { theme } = useThemeUI();

  const zoom = useStore((state) => state.zoom);
  const variable = useStore((state) => state.variable);
  const timePeriod = useStore((state) => state.timePeriod);
  const confidence = useStore((state) => state.confidence);
  const forecastDate = useStore((state) => state.forecastDate);
  const maxHistoricalDate = useStore((state) => state.maxHistoricalDate);

  const setRaster = useStore((state) => state.setRaster);
  const setHistoricalRaster = useStore((state) => state.setHistoricalRaster);
  const setForecastRaster = useStore((state) => state.setForecastRaster);

  const showLandLayer = useStore((state) => state.showLandLayer);
  const showLakesLayer = useStore((state) => state.showLakesLayer);
  const showCountriesLayer = useStore((state) => state.showCountriesLayer);
  const showStatesLayer = useStore((state) => state.showStatesLayer);
  const showCharts = useStore((store) => store.showCharts);

  return (
    <MapProvider>
      <Basemap />

      {/* {showCountriesLayer && (
        <Fill
          id={'countries-fill'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
        />
      )} */}

      {/* <Raster
        // key={`${timePeriod}-${variable}`}
        id={`historical-raster`}
        source={variable == 'percent' ? `https://storage.googleapis.com/water-balance/zarr/viz/wb-h3-${maxHistoricalDate}.zarr` : `https://storage.googleapis.com/water-balance/zarr/viz/precip-h-${maxHistoricalDate}.zarr`}
        opacity={timePeriod == 'forecast' ? 0 : 1}
        setRaster={setHistoricalRaster}
      />

      <Raster
        id={`forecast-raster`}
        source={`https://storage.googleapis.com/cadf/zarr/viz/precip-f-2025-09-01.zarr`}
        opacity={timePeriod == 'forecast' ? 1 : 0}
        setRaster={setForecastRaster}
      /> */}

      <Raster
        id={`raster`}
        // source={`https://storage.googleapis.com/cadf/zarr/viz/cadf.zarr`}
        source={`https://storage.googleapis.com/cadf/zarr/viz/cadf-v3.zarr`}
        // source={`https://storage.googleapis.com/cadf/zarr/viz/cadf-rechunk-confidence.zarr`}
        // source={`https://storage.googleapis.com/cadf/zarr/viz/cadf-rechunk-confidence-xy.zarr`}
        // source={`https://storage.googleapis.com/cadf/zarr/viz/cadf-pyramid.zarr`}
        setRaster={setRaster}
      />

      {showLakesLayer && (
        <>
          <Fill
            id={'lakes-fill'}
            color={theme.rawColors.hinted}
            source={'https://storage.googleapis.com/cadf/vector/lakes'}
            variable={'lakes'}
          />

          <Line
            id={'lakes'}
            color={theme.rawColors.primary}
            source={'https://storage.googleapis.com/cadf/vector/lakes'}
            variable={'lakes'}
            width={1}
          />
        </>
      )}

      <Fill
        id={'ocean'}
        color={theme.rawColors.hinted}
        source={'https://storage.googleapis.com/cadf/vector/ocean'}
        variable={'ocean'}
      />

      {showStatesLayer && (
        <Line
          id={'states'}
          color={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/cadf/vector/states'}
          variable={'states'}
          width={zoom < 4 ? 0.5 : 1}
        />
      )}

      {showCountriesLayer && (
        <Line
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
          width={showStatesLayer && zoom > 2.5 ? 1.5 : 1}
        />
      )}

      {showLandLayer && (
        <Line
          id={'land'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/land'}
          variable={'land'}
          width={1}
        />
      )}

      {showCharts && <PointQuery />}

      <Router />

      <ZoomReset />

      <LayerOrder />
    </MapProvider>
  );
};
