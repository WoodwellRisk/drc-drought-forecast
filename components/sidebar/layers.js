import { useCallback, useState, useEffect } from 'react'
import { Box } from 'theme-ui'
import { useThemedColormap } from '@carbonplan/colormaps'
import { Colorbar, Filter, Slider } from '@carbonplan/components'
import { SidebarDivider } from '@carbonplan/layouts'
import Info from './info'

import useStore from '../store/index'

function Layers() {
  const band = useStore((state) => state.band)
  const setBand = useStore((state) => state.setBand)
  const setForecast = useStore((state) => state.setForecast)
  const forecastArray = useStore((state) => state.forecastArray)
  const colormapName = useStore((state) => state.colormapName)()
  const colormap = useThemedColormap(colormapName, { count: 10 })
  const clim = useStore((state) => state.clim)()
  const sliderIndex = useStore((state) => state.sliderIndex)
  const setSliderIndex = useStore((state) => state.setSliderIndex)
  const setSliding = useStore((state) => state.setSliding)

  const varTags = useStore((state) => state.varTags)
  const setVarTags = useStore((state) => state.setVarTags)
  const varTagLabels = useStore((state) => state.varTagLabels)
  const varTitle = useStore((state) => state.varTitle)()
  const varDescription = useStore((state) => state.varDescription)()
  const defaultColors = useStore((state) => state.defaultColors)
  const defaultLabels = useStore((state) => state.defaultLabels)
  const defaultUnits = useStore((state) => state.defaultUnits)

  const sx = {
    group: {
      my: [3],
      pl: [0, 4, 5, 6],
      pr: [0, 5, 5, 6],
      width: '100%',
    },
    label: {
      fontSize: [2, 2, 2, 3],
      fontFamily: 'heading',
      letterSpacing: 'smallcaps',
      textTransform: 'uppercase',
      mb: [2],
    },
    sublabel: {
      display: 'inline-block',
      color: 'primary',
      fontFamily: 'faux',
      letterSpacing: 'faux',
    },
    data_description: {
      fontSize: '14px',
      color: 'primary',
    },
    data_source: {
      mt: 2,
    }
  }

  const handleBandChange = useCallback((event) => {
    let band = event.target.innerHTML == 'Agreement' ? 'agreement' : event.target.innerHTML == 'Percentile' ? 'percentile' : null
    if (band != null) {
      setBand(band)
    }
  })

  const handleMouseDown = useCallback(() => {
    setSliding(true)
  }, [sliderIndex])

  const handleMouseUp = useCallback(() => {
    setSliding(false)
  }, [sliderIndex])

  useEffect(() => {
    setForecast(forecastArray[sliderIndex])
  }, [sliderIndex])

  return (
    <>
      <Box sx={sx.group}>
        <Box sx={{ mt: -3 }} className='var-container'>
          <Box as='h2' variant='styles.h4' className='var-title'>
            Layers <Info>
              Select either percentile or agreement.
            </Info>
          </Box>

          <Box className='var-layers'>
            <Filter
              sx={{
                mr: [3],
                mb: [2],
              }}
              values={varTags}
              labels={varTagLabels}
              setValues={setVarTags}
              colors={defaultColors}
              multiSelect={false}
              onClick={handleBandChange}
            />
          </Box>
        </Box>
      </Box>
      <SidebarDivider sx={{ width: '100%', my: 4 }} />

      <Box sx={sx.group}>
        <Box as='h2' variant='styles.h4' className='var-subtitle'>
          {varTitle}
          <Info>
            <Box className='layer-description' sx={sx.data_description}>
              <Box>
                {varDescription}
              </Box>
            </Box>
          </Info>
        </Box>

        <Box sx={{ ...sx.label, }}>
          <Colorbar
            sx={{ width: '250px', display: 'inline-block', flexShrink: 1, }}
            sxClim={{ fontSize: [1, 1, 1, 2], pt: [1] }}
            width='100%'
            colormap={colormap}
            label={defaultLabels[band]}
            units={defaultUnits[band]}
            clim={[clim[0].toFixed(2), clim[1].toFixed(2)]}
            horizontal
            bottom
            discrete
          />
        </Box>

        <Box sx={{ ...sx.label, mt: [4] }}>
          <Box sx={sx.label}>Lead time (months)</Box>
          <Slider
            sx={{ mt: [3], mb: [3] }}
            value={sliderIndex}
            onChange={(e) => setSliderIndex(e.target.value)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            min={0}
            max={5}
            step={1}
          />

          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                fontFamily: 'mono',
                letterSpacing: 'mono',
                fontSize: [1],
                display: 'inline-block',
                float: 'left',
              }}
            >
              0
            </Box>

            <Box
              sx={{
                fontFamily: 'mono',
                letterSpacing: 'mono',
                display: 'inline-block',
                ml: 'auto',
                mr: 'auto',
                color: 'secondary',
                transition: '0.2s',
                fontSize: [1],
              }}
            >
              {sliderIndex}
            </Box>

            <Box
              sx={{
                fontFamily: 'mono',
                letterSpacing: 'mono',
                fontSize: [1],
                float: 'right',
                display: 'inline-block',
              }}
            >
              5
            </Box>
          </Box>
        </Box>

        <Box sx={{ ...sx.label, mt: [4] }}>
          <Box
            sx={{
              mt: ['-1px'],
              fontFamily: 'mono',
              letterSpacing: 'mono',
              textTransform: 'uppercase',

            }}
          >
            Forecast: {forecastArray[sliderIndex]}
          </Box>
        </Box>

      </Box>
    </>
  )
}

export default Layers