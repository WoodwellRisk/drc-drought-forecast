import { IconButton } from 'theme-ui'
import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useRef } from 'react'
import { useMapbox } from '@carbonplan/maps'
import { Reset } from '@carbonplan/icons'

import useStore from '../store/index'

const ZoomReset = ({ mobile = false }) => {
    const { map } = useMapbox()
    const zoom = useStore((state) => state.zoom)
    const setZoom = useStore((state) => state.setZoom)
    const center = useStore((state) => state.center)
    const setCenter = useStore((state) => state.setCenter)
    const resetButton = useRef(null)

    const initialZoom = 3.00
    const initialLon = 28.50
    const initialLat = -1.00

    map.on('zoom', () => {
        let zoom = map.getZoom().toFixed(2)
        setZoom(zoom);
    })

    map.on('move', () => {
        let center = map.getCenter()
        setCenter([Math.round(center.lng * 100) / 100, Math.round(center.lat * 100) / 100])
    })

    const spin = keyframes({
        from: {
            transform: 'rotate(0turn)'
        },
        to: {
            transform: 'rotate(1turn)'
        }
    })

    const handleResetClick = useCallback((event) => {
        // reset map
        resetButton.current = event.target
        resetButton.current.classList.add('spin')

        if (zoom != initialZoom || center[0] != initialLon || center[1] != initialLat) {
            map.flyTo({
                center: [initialLon, initialLat],
                zoom: initialZoom,
            })
        }
    })

    const handleAnimationEnd = useCallback(() => {
        resetButton.current.classList.remove('spin')
    })

    return (
        <IconButton
            aria-label='Reset map extent'
            onClick={handleResetClick}
            onAnimationEnd={handleAnimationEnd}
            disabled={zoom == initialZoom && center[0] == initialLon && center[1] == initialLat}
            sx={{
                stroke: 'primary', cursor: 'pointer', ml: [2],
                display: ['initial', 'initial', 'initial', 'initial'],
                position: 'absolute',
                color: (zoom == initialZoom && center[0] == initialLon && center[1] == initialLat) ? 'muted' : 'primary',
                left: [2],
                bottom: mobile ? 80 : 20,
                '.spin': {
                    animation: `${spin.toString()} 1s`,
                },
            }}
        >
            <Reset sx={{ strokeWidth: 1.75, width: 20, height: 20 }} />
        </IconButton>
    )
}

export default ZoomReset