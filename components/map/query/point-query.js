import { useEffect, useRef, useState } from 'react';
import { useThemeUI, Box } from 'theme-ui';
import { useMap } from './map-provider';
import { v4 as uuidv4 } from 'uuid';

import * as zarr from 'zarrita';

import { useStore } from '../store/index';

export default function PointQuery({ key, id }) {
  const { theme } = useThemeUI();
  const { map } = useMap();

  const removed = useRef(false);
  const sourceIdRef = useRef();
  const layerIdRef = useRef();

  const variableArray = useStore((state) => state.variableArray);
  const variable = useStore((state) => state.variable);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const timePeriod = useStore((state) => state.timePeriod);
  const time = useStore((state) => state.time);
  const historicalDates = useStore((state) => state.historicalDates);
  const forecastDates = useStore((state) => state.forecastDates);

  const band = useStore((state) => state.band)();

  const raster = useStore((state) => state.raster);

  const roundToNearest025 = (num) => {
    return Math.round(num * 4) / 4;
  };

  function toTwoDecimalPlaces(num) {
    return parseFloat(roundToNearest025(num).toFixed(2));
  }

  const queryPoint = map.getCenter();
  const [coords, setCoords] = useState([
    toTwoDecimalPlaces(queryPoint['lng']),
    toTwoDecimalPlaces(queryPoint['lat']),
  ]);
  const setPlotData = useStore((state) => state.setPlotData);

  const [coordinates, setCoordinates] = useState([
    `Longitude: ${coords[0]}`,
    `Latitude: ${coords[1]}`,
  ]);

  // https://docs.mapbox.com/mapbox-gl-js/example/drag-a-point/
  const draggablePoint = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
      },
    ],
  };

  useEffect(() => {
    map.on('remove', () => {
      removed.current = true;
    });
  }, []);

  useEffect(() => {
    sourceIdRef.current = id || uuidv4();
    const { current: sourceId } = sourceIdRef;

    if (!map.getSource(sourceId)) {
      draggablePoint.features[0].geometry.coordinates = coords;

      map.addSource(sourceId, {
        type: 'geojson',
        data: draggablePoint,
      });
    }
  }, [key]);

  useEffect(() => {
    const { current: sourceId } = sourceIdRef;
    layerIdRef.current = uuidv4();
    const { current: layerId } = layerIdRef;

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 10, 7, 20],
          'circle-color': theme.rawColors.primary,
          'circle-stroke-width': 2,
          'circle-stroke-color': theme.rawColors.primary,
          'circle-opacity': 0.5,
        },
      });
    }

    function onMove(e) {
      const coords = e.lngLat;

      map.getCanvas().style.cursor = 'grabbing';

      draggablePoint.features[0].geometry.coordinates = [coords.lng, coords.lat];
      map.getSource(sourceIdRef.current).setData(draggablePoint);
    }

    function onUp(e) {
      const coords = e.lngLat;
      setCoords([toTwoDecimalPlaces(coords.lng), toTwoDecimalPlaces(coords.lat)]);

      setCoordinates([
        `Longitude: ${toTwoDecimalPlaces(coords.lng)}`,
        `Latitude:   ${toTwoDecimalPlaces(coords.lat)}`,
      ]);

      map.getCanvas().style.cursor = '';
      map.off('mousemove', onMove);
      map.off('touchmove', onMove);
    }

    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'move';
    });

    map.on('mouseleave', layerId, () => {
      map.setPaintProperty(layerId, 'circle-color', theme.rawColors.primary);
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseup', layerId, (e) => {
      e.preventDefault();
      map.getCanvas().style.cursor = 'grab';
      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
      map.setPaintProperty(layerId, 'circle-opacity', 0.5);
    });

    map.on('mousedown', layerId, (e) => {
      map.setPaintProperty(layerId, 'circle-opacity', 1.0);

      e.preventDefault();

      map.getCanvas().style.cursor = 'grab';
      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
    });

    map.on('touchstart', layerId, (e) => {
      if (e.points.length !== 1) return;
      e.preventDefault();
      map.on('touchmove', onMove);
      map.once('touchend', onUp);
    });

    return () => {
      if (!removed.current) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      }
    };
  }, []);

  // useEffect(() => {
  //   let rasterQuery = () => {
  //     try {
  //       const rasterQuery = raster
  //         .queryData(
  //           { type: 'Point', coordinates: coords },
  //           {
  //             time: timePeriod == 'forecast' ? forecastDates : historicalDates,
  //             variable: variable,
  //             confidence: timePeriod == 'forecast' ? confidenceArray : 50,
  //           }
  //         )
  //         .then((result) => {
  //           console.log(result)
  //           if (timePeriod == 'forecast') setPlotData(result);
  //         });
  //     } catch (error) {
  //       console.error('Error querying raster:', error);
  //     }
  //   };
  //   setTimeout(rasterQuery, 150);
  // }, [raster, variable, coords, timePeriod]);

  //   useEffect(() => {
  //   let rasterQuery = () => {
  //     try {
  //       const rasterQuery = raster
  //         .queryData(
  //           { type: 'Point', coordinates: coords },
  //           {
  //             time: timePeriod == 'forecast' ? forecastDates : historicalDates,
  //             band: confidenceArray.map((num) => `${variable}_${num}`),
  //           }
  //         )
  //         .then((result) => {
  //           result[variable] = result.variable;
  //           delete result.variable;

  //           confidenceArray.forEach((k) => {
  //             result[variable][k] = result[variable][`${variable}_${k}`]
  //             delete result[variable][`${variable}_${k}`]
  //           })
  //           if(timePeriod == 'forecast') {
  //             setPlotData(result);
  //           }
  //         });
  //     } catch (error) {
  //       console.error('Error querying raster:', error);
  //     }
  //   };

  //   rasterQuery()
  // }, [timePeriod, raster]);

  useEffect(() => {
    if (timePeriod == 'forecast') {
      return;
    } else {
      let rasterQuery = () => {
        try {
          const rasterQuery = raster
            .queryData(
              { type: 'Point', coordinates: coords },
              {
                time: historicalDates,
                band: variableArray,
              }
            )
            .then((result) => {
              console.log(result);
            });
        } catch (error) {
          console.error('Error querying raster:', error);
        }
      };

      rasterQuery();
    }
  }, [timePeriod, raster, coords]);

  return (
    <Box
      as="div"
      id={'coordinates-container'}
      sx={{
        position: 'absolute',
        right: [2],
        bottom: [50],
        zIndex: 10,
        // width: '8.75rem',
        display: coordinates ? 'block' : 'none',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '0.3rem 0.7rem',
        margin: 0,
        borderWidth: '1px',
        borderColor: 'primary',
        borderStyle: 'solid',
        borderRadius: '0.2rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        lineHeight: '1.2rem',
      }}
    >
      {coordinates &&
        coordinates.map((coord, idx) => (
          <p key={idx} style={{ margin: 0 }}>
            {coord}
          </p>
        ))}
    </Box>
  );
}
