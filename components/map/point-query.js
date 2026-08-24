import { useEffect, useRef, useState } from 'react';
import { useThemeUI, Box } from 'theme-ui';
import { useMap } from './map-provider';
import { v4 as uuidv4 } from 'uuid';

import { useStore } from '../store/index';

export default function PointQuery({ key, id }) {
  const { theme } = useThemeUI();
  const { map } = useMap();

  const removed = useRef(false);
  const sourceIdRef = useRef();
  const layerIdRef = useRef();

  const variable = useStore((state) => state.variable);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const timePeriod = useStore((state) => state.timePeriod);
  const time = useStore((state) => state.time);
  const historicalDates = useStore((state) => state.historicalDates);
  const forecastDates = useStore((state) => state.forecastDates);
  const raster = useStore((state) => state.raster);

  const queryPoint = map.getCenter();
  const [coords, setCoords] = useState([queryPoint['lng'], queryPoint['lat']]);
  const setPlotData = useStore((state) => state.setPlotData);

  function toTwoDecimalPlaces(num) {
    return parseFloat(num.toFixed(2));
  }

  const [coordinates, setCoordinates] = useState([
    `Longitude: ${toTwoDecimalPlaces(coords[0])}`,
    `Latitude: ${toTwoDecimalPlaces(coords[1])}`,
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
      setCoords([coords.lng, coords.lat]);

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

    // map.on('click', (e) => {
    //   // console.log(e)
    //   const coords = e.lngLat;
    //   // console.log([coords.lng, coords.lat])
    //   if (!raster) return;

    //   try {
    //     let query;
    //     if (timePeriod == 'forecast') {
    //       query = { time: forecastDates, variable: variable, confidence: confidenceArray }
    //     } else {
    //       query = { time: historicalDates, variable: variable, confidence: 50 }
    //     }
    //     const rasterQuery = raster.queryData(
    //       { type: 'Point', coordinates: [coords.lng, coords.lat] },
    //       query
    //     ).then((result) => {
    //       console.log(result)
    //     });

    //     // setPlotData(rasterQuery);
    //   } catch (error) {
    //     console.error('Error querying raster:', error);
    //   }
    // })

    // map.on('mousemove', (e) => {
    //   function hoverQuery() {
    //     let query;
    //     console.log(coords)
    //     // if (timePeriod == 'forecast') {
    //     //   query = { time: forecastDates, variable: variable, confidence: confidenceArray }
    //     // } else {
    //     //   query = { time: historicalDates, variable: variable }
    //     // }
    //     // const rasterQuery = raster.queryData(
    //     //   { type: 'Point', coordinates: coords },
    //     //   query
    //     // ).then((result) => {
    //     //   console.log(result)
    //     // })
    //   }
    //   setTimeout(hoverQuery, 120)
    // })

    return () => {
      if (!removed.current) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      }
    };
  }, []);

  useEffect(() => {
    let rasterQuery = () => {
      try {
        const rasterQuery = raster
          .queryData(
            { type: 'Point', coordinates: coords },
            {
              time: timePeriod == 'forecast' ? forecastDates : historicalDates,
              variable: variable,
              confidence: timePeriod == 'forecast' ? confidenceArray : 50,
            }
          )
          .then((result) => {
            // console.log(result)
            if (timePeriod == 'forecast') setPlotData(result);
          });
      } catch (error) {
        console.error('Error querying raster:', error);
      }
    };
    setTimeout(rasterQuery, 150);
  }, [raster, variable, coords, timePeriod]);

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
