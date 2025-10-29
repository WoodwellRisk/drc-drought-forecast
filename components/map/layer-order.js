import { useEffect } from 'react'
import { useMapbox } from '@carbonplan/maps'

import useStore from '../store/index'

const LayerOrder = () => {
    const { map } = useMapbox()
    const showStatesOutline = useStore((state) => state.showStatesOutline)
    const showCountriesOutline = useStore((state) => state.showCountriesOutline)

    useEffect(() => {
        if(showCountriesOutline && showStatesOutline) {
            let layers = map.getStyle().layers;
            console.log(layers)
            let states = layers.filter((layer) => layer.source == 'states')[0]
            let countries = layers.filter((layer) => layer.source == 'countries')[0]

            console.log(countries, states)
            
            if(countries.length != 0) {
                map.moveLayer(states.id, countries.id)
            }
        }
      }, [showCountriesOutline, showStatesOutline])

      return null
}

export default LayerOrder