import { useCallback, useEffect, useRef } from 'react'
import { useThemeUI, Box } from 'theme-ui'
import { useThemedColormap } from '@carbonplan/colormaps'
import { Map as MapContainer, Raster, Fill, Line, RegionPicker } from '@carbonplan/maps'
import { Dimmer } from '@carbonplan/components'
import ForecastData from './forecast-data'
import LayerOrder from './layer-order'
import Ruler from './ruler'
import Router from './router'
import ZoomReset from './zoom-reset'

import useStore from '../store/index'

const Map = ({ mobile }) => {
  const { theme } = useThemeUI()
  const container = useRef(null)
  const center = useStore((state) => state.center)
  const zoom = useStore((state) => state.zoom)
  const minZoom = useStore((state) => state.minZoom)
  const maxZoom = useStore((state) => state.maxZoom)
  const bounds = useStore((state) => state.bounds)

  const display = useStore((state) => state.display)
  const opacity = useStore((state) => state.opacity)
  const variable = useStore((state) => state.variable)
  const band = useStore((state) => state.band)
  const bandArray = useStore((state) => state.bandArray)
  const time = useStore((state) => state.time)
  const dates = useStore((state) => state.dates)
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
    <Box ref={container} sx={{ flexBasis: '100%', 'canvas.mapboxgl-canvas:focus': { outline: 'none', }, }} >
      {/* <MapContainer zoom={zoom} center={center} maxBounds={bounds} > */}
      <MapContainer zoom={zoom} center={center} maxBounds={bounds} minZoom={1} maxZoom={maxZoom} >
        {showOceanMask && (
          <Fill
            id={'ocean'}
            color={theme.rawColors.background}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/ocean'}
            variable={'ocean'}
          />
        )}

        {showCountriesOutline && (
          <Line
            id={'countries'}
            color={theme.rawColors.primary}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/countries'}
            variable={'countries'}
            width={showStatesOutline && zoom > 2.5 ? 1.5 : 1}
          />
        )}

        {showStatesOutline && (
          <Line
            id={'states'}
            color={theme.rawColors.secondary}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/states'}
            variable={'states'}
            width={zoom < 4 ? 0.5 : 1}
          />
        )}

        {showLakes && (
          <Fill
            id={'lakes-fill'}
            color={theme.rawColors.background}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
            variable={'lakes'}
          />
        )}

        {showLakes && (
          <Line
            id={'lakes'}
            color={theme.rawColors.primary}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
            variable={'lakes'}
            width={1}
          />
        )}

        {/* 
        this data needs to be clipped by land
        then i can look into removing the border of points around the extent
      */}
        <ForecastData
          key={`time-${band}`}
          id={'forecast'}
          band={band}
          time={time}
          color={'#026440'}
          primaryColor={theme.rawColors.primary}
          // borderColor={theme.rawColors.background}
          borderColor={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector'}
          variable={'drought'}
        />

        {showLandOutline && (
          <Line
            id={'land'}
            color={theme.rawColors.primary}
            source={'https://storage.googleapis.com/drc-drought-forecast/vector/land'}
            variable={'land'}
            width={1}
          />
        )}

        {/* {showRegionPicker && (
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
          variable={variable}
          selector={{ band, time }}
          regionOptions={{
            setData: handleRegionData,
            selector: { band: bandArray, time: dates }
          }}
        /> */}

        {/* 
          Could look at comparing the maps directly instead of toggling between them:
            - https://github.com/maplibre/maplibre-gl-compare
          Could also try and clip output by geometry masks: 
            - https://turfjs.org/docs/api/pointsWithinPolygon
            - https://turfjs.org/docs/api/booleanIntersects
        */}

        <Ruler mobile={mobile} />

        <ZoomReset mobile={mobile} />

        <Router />

        <LayerOrder />

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