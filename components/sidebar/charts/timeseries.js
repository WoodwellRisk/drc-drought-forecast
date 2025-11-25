import { Box, Text } from 'theme-ui'
import { Area, AxisLabel, Chart, Circle, Grid, Line, Plot, Ticks, TickLabels } from '@carbonplan/charts'

import StraightLine from '../icons/straight-line'
import useStore from '../../store/index'

const TimeSeries = ({ data }) => {
    const variable = useStore((state) => state.variable)
    const confidence = useStore((state) => state.confidence)
    const band = useStore((state) => state.band)()
    // const forecastArray = useStore((state) => state.forecastArray)
    const dates = useStore((state) => state.dates)
    const xLabels = dates.map(f => {
        let dateString = new Date(f).toISOString().split("-")
        return `${dateString[1]}/${dateString[0].slice(-2)}`
    })
    const sliderIndex = useStore((state) => state.sliderIndex)
    const sliding = useStore((state) => state.sliding)
    const clim = useStore((state) => state.clim)()

    const sx = {
        chart: {
            mt: [],
            mx: 'auto',
            pl: [0, 0, 0, 0],
            pr: [0, 0, 0, 0,],
            width: '100%',
            height: '200px',
        }
    }

    const yTicks = clim
    const yLabel = (variable == 'percent') ? 'Percent (%)' : 'Precip (mm)'

    // get median and high confidence bands
    let percentMediumConfidence = [0, 1, 2, 3, 4, 5].map((value) => {
        return [value, data['percent_20'][value], data['percent_80'][value]]
    })
    let percentHighConfidence = [0, 1, 2, 3, 4, 5].map((value) => {
        return [value, data['percent_5'][value], data['percent_95'][value]]
    })

    let precipMediumConfidence = [0, 1, 2, 3, 4, 5].map((value) => {
        return [value, data['precip_20'][value], data['precip_80'][value]]
    })
    let precipHighConfidence = [0, 1, 2, 3, 4, 5].map((value) => {
        return [value, data['precip_5'][value], data['precip_95'][value]]
    })
    
    return (
        <>
            <Box sx={{ ...sx.chart }} className='chart-container'>
                <Chart x={[0, 5]} y={yTicks} padding={{ left: 50, top: 30 }}>
                    <Grid vertical horizontal />
                    <Ticks left bottom />
                    <TickLabels left />
                    <TickLabels bottom labels={xLabels} />

                    <AxisLabel left>{yLabel}</AxisLabel>
                    <AxisLabel bottom>Time</AxisLabel>
                    <Plot>
                        <Line
                            data={[
                                [sliderIndex, yTicks[0]],
                                [sliderIndex, yTicks[1]],
                            ]}
                            color='secondary'
                            sx={{
                                opacity: sliding ? 1 : 0,
                                strokeDasharray: 4,
                                transition: 'opacity 0.15s',
                            }}
                        />

                        <Area
                            data={percentMediumConfidence}
                            color='primary'
                            opacity={0.2}
                        />

                        <Area
                            data={precipMediumConfidence}
                            color='blue'
                            opacity={0.2}
                        />

                        <Line data={data['percent_50'].map((d, idx) => [idx, d])} width={2} color='primary' />

                        <Line data={data['precip_50'].map((d, idx) => [idx, d])} width={2} color='blue' />

                        {/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every */}
                        {!data[band].every((value) => isNaN(value)) && (
                            <Circle
                                x={sliderIndex}
                                y={data[`${variable}_50`][sliderIndex]}
                                color={variable == 'percent' ? 'primary' : 'blue'}
                                size={14}
                            />
                        )}

                    </Plot>
                </Chart>

                <Box sx={{display: 'flex', mt: [2], justifyContent: 'space-around'}}>
                    <Box>
                        <StraightLine sx={{color: 'primary'}} />
                        <Text sx={{ml: 2, color: 'primary', fontSize: 13}}>Percentile</Text>
                    </Box>
                    <Box>
                        <StraightLine sx={{color: 'blue'}} />
                        <Text sx={{ml: 2, color: 'blue', fontSize: 13}}>Precipitation</Text>
                    </Box>
                </Box>
            </Box>

        </>
    )
}

export default TimeSeries