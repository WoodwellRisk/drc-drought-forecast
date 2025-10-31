import { useEffect } from 'react'
import { useMapbox } from '@carbonplan/maps'

import useStore from '../store/index'

const LayerOrder = () => {
    const { map } = useMapbox()
    const showStatesOutline = useStore((state) => state.showStatesOutline)
    const showCountriesOutline = useStore((state) => state.showCountriesOutline)
    const band = useStore((state) => state.band)
    const time = useStore((state) => state.time)

    // this method is only partly working
    // when the states layer is turned on after the countries layer,
    // it ends up behind the forecast data
    useEffect(() => {
        if (showCountriesOutline && showStatesOutline) {
            let layers = map.getStyle().layers;
            let states = layers.filter((layer) => layer.source == 'states')[0]
            let countries = layers.filter((layer) => layer.source == 'countries')[0]

            if (countries.length != 0) {
                map.moveLayer(states.id, countries.id)
            }
        }
    }, [showStatesOutline])

    // there is something wrong with this logic, where the forecast layer 
    // is put above the land, ocean, states, and countries layers
    useEffect(() => {
        if (showCountriesOutline || showStatesOutline) {
            let layers = map.getStyle().layers;

            let states = layers.filter((layer) => layer.source == 'states')[0]
            let countries = layers.filter((layer) => layer.source == 'countries')[0]
            let forecast = layers.filter((layer) => layer.source == 'forecast')[0]

            if (forecast && showStatesOutline) {
                map.moveLayer(forecast.id, states.id)
            }

            if (forecast && showCountriesOutline) {
                map.moveLayer(forecast.id, countries.id)
            }
        }
    }, [showStatesOutline, showCountriesOutline])

    useEffect(() => {
        let layers = map.getStyle().layers;

        let land = layers.filter((layer) => layer.source == 'land')[0]
        let ocean = layers.filter((layer) => layer.source == 'ocean')[0]
        let forecast = layers.filter((layer) => layer.source == 'forecast')[0]

        map.moveLayer(forecast.id, ocean.id)
        map.moveLayer(ocean.id, land.id)
    }, [band, time])

    return null
}

export default LayerOrder