import { Box } from 'theme-ui'
import TimeSeries from './timeseries'

import useStore from '../../store/index'

const StatsDisplay = ({ data }) => {
  const band = useStore((state) => state.band)
  const sliderIndex = useStore((state) => state.sliderIndex)

  if (!data || !data[band]) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '275px',
            textAlign: 'center',
            alignContent: 'center',
            color: 'red',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'red',
            borderRadius: '7.5px',
          }}
        >
          <Box sx={{marginX: [3]}}>
            Please select a point to view timeseries data
          </Box>
        </Box>
      )
  }

  let result;
  let value = data[band][sliderIndex][1]
  
  if(data == {}) {
    result = 'no data in region'
  } else {
    result = `${band == 'percentile' ? 'Percentile' : 'Agreement'}: ${value.toFixed(2)}${band == 'percentile' || band == 'agreement' ? '%' : 'mm'}`
  }

  return (
    <>
      <Box
        sx={{
          ml: [0],
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',

        }}
      >
        {`Coordinates: [${data['coordinates'][0].toFixed(2)}, ${data['coordinates'][1].toFixed(2)}]`}
      </Box>

      <Box
        sx={{
          ml: [0],
          mt: [3],
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',

        }}
      >
        {result}
      </Box>
      
      <TimeSeries data={data} />

    </>
  )
}

const Charts = () => {
  // Could try to combine the Charts and StatsDisplay components into one, simpler one
  const plotData = useStore((state) => state.plotData)
    
  return (
    <Box
      sx={{
        fontFamily: 'mono',
        letterSpacing: 'mono',
        textTransform: 'uppercase',
      }}
    >
      {plotData && (
        <>
          <StatsDisplay data={plotData} />
        </>
      )}
    </Box>
  )
}

export default Charts