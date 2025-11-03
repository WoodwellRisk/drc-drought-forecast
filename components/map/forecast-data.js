import { useEffect, useState, useRef } from 'react'
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

    const [filterCoordinates, setFilterCoordinates] = useState([])

    useEffect(() => {
        if(filterCoordinates.length != 0) {
            console.log(filterCoordinates)

            let features = map.querySourceFeatures('forecast', {
                sourceLayer: 'drought',
                filter: [
                    'all',
                    // ['==', 'band', band],
                    // ['==', 'coords', JSON.stringify(filterCoordinates)],
                    ['==', 'x', filterCoordinates[0]],
                    ['==', 'y', filterCoordinates[1]],
                ],
            });

            console.log(features)
            // sometimes the features are repeated at the boundaries of tiles, so we need to only keep the first 6 of each
            // https://github.com/mapbox/mapbox-gl-js/issues/3147
            let percentiles = features.filter((feature) => feature.properties.band == 'percentile').map((feature) => [feature.properties.time, feature.properties.drought]).slice(0, 6)
            let agreement = features.filter((feature) => feature.properties.band == 'agreement').map((feature) => [feature.properties.time, feature.properties.drought]).slice(0, 6)
            console.log(percentiles)
            console.log(agreement)
            console.log()

        }
    }, [filterCoordinates])

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
                // data: `${source}/drought.geojson`,
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
        const { current: layerId } = layerIdRef;

        map.setFilter(layerId, ['all', ['==', 'band', band], ['==', 'time', time]])
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
    map.on('mouseenter', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'cell';
    });

    map.on('click', layerIdRef.current, (event) => {

        const roundToNearest025 = (num) => {
            return Math.round(num * 4) / 4;
        }

        // const features = map.queryRenderedFeatures(event.point, { layers: [layerIdRef.current] });
        // if (features.length) {
            
        //     console.log(features)
        //     // the x, y coordinates that we get from the map are not always the same 
        //     // as those we need to query the vector data
        //     // let coordinates = features[0].geometry.coordinates.slice().map(xy => roundToNearest025(xy));
        //     // console.log(coordinates);

        //     // const filtered = features.filter((feature) => feature.geometry.coordinates == coordinates);
        //     // console.log(filtered)
        //     // console.log()

        // }

        let coordinates = [event.lngLat.lng, event.lngLat.lat].map(xy => roundToNearest025(xy))
        setFilterCoordinates(coordinates)
        // console.log(coordinates)

        // let timeseries = map.querySourceFeatures('forecast', {
        //     sourceLayer: 'drought',
        //     filter: [
        //         'all',
        //         ['==', 'band', band]
        //     ],
        // });
        // console.log(timeseries);
        // let features = map.queryRenderedFeatures(event.point);
        // console.log(features)
    })

    map.on('mouseleave', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'default';
    });

    return null
}

export default ForecastData