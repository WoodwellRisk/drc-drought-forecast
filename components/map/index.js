import { useCallback, useRef } from 'react'
import { useThemeUI, Box } from 'theme-ui'
import { useThemedColormap } from '@carbonplan/colormaps'
import { Map as MapContainer, Raster, Fill, Line, RegionPicker } from '@carbonplan/maps'
import { Dimmer } from '@carbonplan/components'
import Ruler from './ruler'
import Router from './router'

import useStore from '../store/index'

const Map = ({ mobile }) => {
  const { theme } = useThemeUI()
  const container = useRef(null)
  const bounds = useStore((state) => state.bounds)

  const display = useStore((state) => state.display)
  const opacity = useStore((state) => state.opacity)
  const variable = useStore((state) => state.variable)
  const band = useStore((state) => state.band)
  const bandArray = useStore((state) => state.bandArray)
  const forecast = useStore((state) => state.forecast)
  const forecastArray = useStore((state) => state.forecastArray)
  const clim = useStore((state) => state.clim)()
  const colormapName = useStore((state) => state.colormapName)()
  const colormap = useThemedColormap(colormapName, { count: 10 })
  const setRegionData = useStore((state) => state.setRegionData)
  const setRegionDataLoading = useStore((state) => state.setRegionDataLoading)

  const showRegionPicker = useStore((state) => state.showRegionPicker)
  const showLandOutline = useStore((state) => state.showLandOutline)
  const showOceanMask = useStore((state) => state.showOceanMask)
  const showLakes = useStore((state) => state.showLakes)
  const showCountriesOutline = useStore((state) => state.showCountriesOutline)
  const showStatesOutline = useStore((state) => state.showStatesOutline)

  const sx = {
    label: {
      fontFamily: 'mono',
      letterSpacing: 'mono',
      textTransform: 'uppercase',
      fontSize: [1, 1, 1, 2],
      mt: [3],
    },
  }

  // this callback was modified from its source: https://github.com/carbonplan/oae-web/blob/3eff3fb99a24a024f6f9a8278add9233a31e853b/components/map.js#L93
  const handleRegionData = useCallback(
    (data) => {
      if (data.value == null) {
        setRegionDataLoading(true)
      } else if (data.value) {
        setRegionData(data.value)
        setRegionDataLoading(false)
      }
    },
    [setRegionData, setRegionDataLoading]
  )

  return (
    <Box ref={container} sx={{flexBasis: '100%', 'canvas.mapboxgl-canvas:focus': {outline: 'none', },}} >
      <MapContainer maxBounds={bounds}  >
      {showOceanMask && (
            <Fill
              color={theme.rawColors.background}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/ocean'}
              variable={'ocean'}
            />
          )}

          {showStatesOutline && (
            <Line
              color={theme.rawColors.secondary}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/states'}
              variable={'states'}
              width={1}
            />
          )}

          {showCountriesOutline && (
            <Line
              color={theme.rawColors.primary}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/countries'}
              variable={'countries'}
              width={1}
            />
          )}

        {showLakes && (
            <Fill
              color={theme.rawColors.background}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
              variable={'lakes'}
            />
          )}

        {showLakes && (
            <Line
              color={theme.rawColors.primary}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
              variable={'lakes'}
              width={1}
            />
          )}

          {showLandOutline && (
            <Line
              color={theme.rawColors.primary}
              source={'https://storage.googleapis.com/drc-drought-forecast/vector/land'}
              variable={'land'}
              width={1}
            />
          )}

          {showRegionPicker && (
            <RegionPicker
              color={theme.colors.primary}
              backgroundColor={theme.colors.background}
              fontFamily={theme.fonts.mono}
              fontSize={'14px'}
              minRadius={1}
              maxRadius={1500}
            />
          )}

          <Raster
            key={variable}
            colormap={colormap}
            clim={clim}
            display={display}
            opacity={opacity}
            mode={'texture'}
            source={`https://storage.googleapis.com/drc-drought-forecast/zarr/drc-drought.zarr`}
            variable={ variable }
            selector={{ band, forecast }}
            regionOptions={{ 
              setData: handleRegionData, 
              selector: {band: bandArray, forecast: forecastArray} 
            }}
          />

          {!mobile && (<Ruler />)}

          <Router />

      </MapContainer>

      {!mobile && (<Dimmer 
        sx={{
          display: ['initial', 'initial', 'initial', 'initial'],
          position: 'absolute',
          color: 'primary',
          right: [70],
          bottom: [20, 20, 20, 20],
        }}
      />
      )}

    </Box>
  )
}

export default Map
