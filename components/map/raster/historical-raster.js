import { useEffect, useRef, useState } from 'react';
import { ZarrLayer } from '@carbonplan/zarr-layer';
import { useMap } from '../map-provider';
import { useMapView } from '../use-map-view';
import { useStore } from '../../store/index';

// This component expects input data in the format:
// Dimensions: {'band': 2, 'time': ..., 'y': 21, 'x': 21}
// Coordinates:
//   * y            (y) float64 168B 0.0 0.25 0.5 0.75 1.0 ... 4.25 4.5 4.75 5.0
//   * time         (time) <U10 2kB '2021-01-01' '2021-02-01' ... '2024-12-01'
//   * x            (x) float64 168B 15.0 15.25 15.5 15.75 ... 19.5 19.75 20.0
//   * band         (band) object 16B 'total' 'percentile'
//   * spatial_ref  int64 8B 0
// Data variables:
//     viz     (band, time, y, x)
//     query   (band, time, y, x)

const HistoricalRaster = ({ id, setRaster }) => {
  const zarrLayerRef = useRef(null);
  const removed = useRef(false);
  const { map } = useMap();
  const { zoom, center } = useMapView();

  const clim = useStore((state) => state.clim)();
  const colormap = useStore((state) => state.colormap)();

  const variableArray = useStore((state) => state.variableArray);
  const variable = useStore((state) => state.variable);
  const historicalDates = useStore((state) => state.historicalDates);
  const time = useStore((state) => state.time);

  const source = `https://storage.googleapis.com/cadf/zarr/h-topozarr-3-viz-query.zarr`;

  useEffect(() => {
    if (!map) return;

    map.on('remove', () => {
      removed.current = true;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const zarrLayer = new ZarrLayer({
      id: id,
      source: source,
      zarrVersion: 3,
      variable: 'viz',
      clim: clim,
      colormap: colormap,
      selector: { variable: 'viz', band: variable, time: time },
    });

    map.addLayer(zarrLayer);
    zarrLayerRef.current = zarrLayer;
    setRaster(zarrLayer);

    return () => {
      let layerId = id;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setSelector({ variable: 'viz', band: variable, time: time });
  }, [map, time]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    // change clim and colormap without re-rendering raster
    layer.setClim(clim);
    layer.setColormap(colormap);
  }, [map, clim, colormap]);

  return null;
};

export default HistoricalRaster;
