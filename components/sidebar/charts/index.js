import { Box } from 'theme-ui'
import { useMemo } from 'react'
import { useThemedColormap } from '@carbonplan/colormaps'
import TimeSeries from './timeseries'

import useStore from '../../store/index'

const StatsDisplay = ({ data }) => {
  const variable = useStore((state) => state.variable)
  const band = useStore((state) => state.band)
  const sliderIndex = useStore((state) => state.sliderIndex)

  if (!data || !data[variable]) {
    return
  }

  let result;

  // let chartData = useMemo(() => {
  //   let lineData = []
  //   if (!data) return []
  //   data.coordinates.forecast.forEach((f) => {
  //     let filteredData = data[variable][band][f].filter((d) => d !== 9.969209968386869e36)
  //     const average = filteredData.reduce((a, b) => a + b, 0) / filteredData.length
  //     lineData.push([f, average])
  //   })
  //   return lineData
  // }, [data, band])

  let chartData = useMemo(() => {
    let lineData = {
      'percentile': [],
      'agreement': [],
      'precip_mean': [],
      'percent': [],
    }
    if (!data) return []
    data.coordinates.band.forEach((b) => {
      data.coordinates.forecast.forEach((f) => {
        let filteredData = data[variable][b][f].filter((d) => d !== 9.969209968386869e36)
        const average = filteredData.reduce((a, b) => a + b, 0) / filteredData.length
        lineData[b].push([f, average])
      })
    })
    return lineData
  }, [data])

  let avg = chartData[band][sliderIndex][1]
  if (isNaN(avg)) {
    result = 'no data in region'
  } else {
    if (band == 'percentile' || band == 'agreement' || band == 'percent') {
      result = `Average: ${avg.toFixed(2)}%`
    } else { // else band == 'precip_mean'
      result = `Average: ${avg.toFixed(2)}mm`
    }
  }

  return (
    <>
      <Box
        sx={{
          ml: [2],
          mt: ['-1px'],
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',

        }}
      >
        {result}
      </Box>
      
      <TimeSeries data={chartData} />

    </>
  )
}

const Charts = () => {
  const variable = useStore((state) => state.variable)
  const regionData = useStore((state) => state.regionData)
  const showRegionPicker = useStore((state) => state.showRegionPicker)
    
  return (
    <Box
      sx={{
        fontFamily: 'mono',
        letterSpacing: 'mono',
        textTransform: 'uppercase',
      }}
    >
      {showRegionPicker && regionData[variable] && (
        <>
          <StatsDisplay data={regionData} />
        </>
      )}
    </Box>
  )
}

export default Charts