import { useEffect, useRef } from 'react'
import { useMapbox } from '@carbonplan/maps'
import { useThemedColormap } from '@carbonplan/colormaps'
import { v4 as uuidv4 } from 'uuid'

import useStore from '../store/index'

const updatePaintProperty = (map, ref, key, value) => {
    const { current: id } = ref
    if (map.getLayer(id)) {
        map.setPaintProperty(id, key, value)
    }
}

// https://www.delftstack.com/howto/javascript/rgb-to-hex-javascript/
function rgbArrayToHex(rgbArray) {
    return rgbArray.map(rgb => {
        const [r, g, b] = rgb;
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase();
    });
}

const ForecastData = ({ id, source, variable, primaryColor, borderColor, band, time, minZoom = null, maxZoom = null }) => {

    const { map } = useMapbox()
    const removed = useRef(false)

    const sourceIdRef = useRef()
    const layerIdRef = useRef()

    const colormapName = useStore((state) => state.colormapName)()
    const colormap = useThemedColormap(colormapName, { count: 10 })
    const colors = rgbArrayToHex(colormap)
    const borderWidth = 0.5
    const zoom = useStore((state) => state.zoom)
    const zoomChange = 4.5

    useEffect(() => {
        map.on('remove', () => {
            removed.current = true
        })
    }, [])

    useEffect(() => {
        sourceIdRef.current = id || uuidv4()
        const { current: sourceId } = sourceIdRef
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'vector',
                tiles: [`${source}/drought/{z}/{x}/{y}.pbf`],
                // type: 'geojson',
                // data: `${source}/drc-drought.geojson`,
            })
            if (minZoom) {
                map.getSource(sourceId).minzoom = minZoom
            }
            if (maxZoom) {
                map.getSource(sourceId).maxzoom = maxZoom
            }
        }
    }, [id])

    useEffect(() => {
        layerIdRef.current = uuidv4()

        const { current: layerId } = layerIdRef
        const { current: sourceId } = sourceIdRef

        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceId,
                // 'source-layer': variable,
                'source-layer': 'drought',
                layout: { visibility: 'visible' },
                paint: {
                    // 'circle-color': ['get', 'drought_color'],
                    // 'circle-color': [
                    //     'interpolate',
                    //     ['linear'],
                    //     ['get', 'drought'],
                    //     0, '#95000c',
                    //     50, '#ebebec',
                    //     100, '#1e309f',
                    //   ],
                    'circle-color': [
                        'case',
                        ['<', ['get', 'drought'], 10], colors[0],
                        ['all', ['>=', ['get', 'drought'], 10], ['<', ['get', 'drought'], 20]], colors[1],
                        ['all', ['>=', ['get', 'drought'], 20], ['<', ['get', 'drought'], 30]], colors[2],
                        ['all', ['>=', ['get', 'drought'], 30], ['<', ['get', 'drought'], 40]], colors[3],
                        ['all', ['>=', ['get', 'drought'], 40], ['<', ['get', 'drought'], 50]], colors[4],
                        ['all', ['>=', ['get', 'drought'], 50], ['<', ['get', 'drought'], 60]], colors[5],
                        ['all', ['>=', ['get', 'drought'], 60], ['<', ['get', 'drought'], 70]], colors[6],
                        ['all', ['>=', ['get', 'drought'], 70], ['<', ['get', 'drought'], 80]], colors[7],
                        ['all', ['>=', ['get', 'drought'], 80], ['<', ['get', 'drought'], 90]], colors[8],
                        colors[9] // else greater than 90
                    ],
                    'circle-opacity': 1.0,
                    'circle-radius': [
                        // https://docs.mapbox.com/style-spec/reference/expressions/
                        'interpolate', ['linear'], ['zoom'],
                        3, 2,
                        4, 3,
                        6, 5,
                        7, 8,
                        8, 9,
                    ],
                    // https://docs.mapbox.com/help/glossary/layout-paint-property/
                    'circle-stroke-color': borderColor,
                    'circle-stroke-width': 0,
                },

                'filter': [
                    'all',
                    ['==', 'band', band],
                    ['==', 'time', time]
                ],
            })

        }

        return () => {
            if (!removed.current) {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId)
                }
            }
        }
    }, [])

    useEffect(() => {
        map.setFilter(layerIdRef.current, ['all', ['==', 'band', band], ['==', 'time', time]])
    }, [band, time])

    useEffect(() => {
        if (zoom < zoomChange) {
            updatePaintProperty(map, layerIdRef, 'circle-stroke-width', 0)
        } else {
            let layers = map.getStyle().layers
            let forecast = layers.filter((layer) => layer.source == 'forecast')[0]
            if (forecast.paint['circle-stroke-color'] != borderWidth) {
                updatePaintProperty(map, layerIdRef, 'circle-stroke-width', borderWidth)
            }

        }
    }, [zoom])


    // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
    // https://docs.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures/
    // we could also make an on click event to get the time series for the charts box
    map.on('mousemove', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'cell';

        let coordinates = [event.lngLat.lng, event.lngLat.lat]
        // console.log(coordinates)
    });

    map.on('mouseleave', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'default';
    });

    return null
}

export default ForecastData