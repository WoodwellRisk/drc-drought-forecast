import { useEffect } from 'react';

import { useMap } from './map-provider';
import { useStore } from '../store/index';

const LayerOrder = () => {
  const { map } = useMap();

  const variable = useStore((state) => state.variable);
  const timePeriod = useStore((state) => state.timePeriod);
  const confidence = useStore((state) => state.confidence);
  const showStatesLayer = useStore((state) => state.showStatesLayer);
  const showCountriesLayer = useStore((state) => state.showCountriesLayer);
  const showCharts = useStore((state) => state.showCharts);

  useEffect(() => {
    if (!map) return;

    let layers = map.getStyle().layers;

    // find base layers - always shown
    let ocean = layers.find((layer) => layer.source == 'ocean');
    let land = layers.find((layer) => layer.source == 'land');
    let lakesFill = layers.find((layer) => layer.source == 'lakes-fill');
    let lakes = layers.find((layer) => layer.source == 'lakes');

    // find conditional layers
    let states = showStatesLayer ? layers.find((layer) => layer.source == 'states') : undefined;
    let countries = showCountriesLayer
      ? layers.find((layer) => layer.source == 'countries')
      : undefined;
    let pointQuery = showCharts ? layers.find((layer) => layer.source == `point-query`) : undefined;

    // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#movelayer
    // build the complete target order list from bottom to top
    // map.moveLayer(a, b) will put a below b
    // map.moveLayer('countries-fill', lakesFill.id);
    // map.moveLayer('forecast-raster', 'historical-raster');
    // map.moveLayer('forecast-raster', lakesFill.id);
    // map.moveLayer('historical-raster', lakesFill.id);
    map.moveLayer('raster', lakesFill.id);
    map.moveLayer(lakesFill.id, lakes.id);
    map.moveLayer(lakes.id, ocean.id);
    map.moveLayer(ocean.id, land.id);
    if (states) map.moveLayer(states.id, land.id);
    if (countries) map.moveLayer(countries.id, states?.id || land.id);
    if (states && countries) map.moveLayer(states.id, countries.id);
    if (pointQuery) map.moveLayer(land.id, pointQuery.id);
  }, [map, showCountriesLayer, showStatesLayer, timePeriod, variable, confidence]);

  return null;
};

export default LayerOrder;
