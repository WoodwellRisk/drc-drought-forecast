import { Box } from 'theme-ui'
import { AxisLabel, Chart, Circle, Grid, Line, Plot, Ticks, TickLabels } from '@carbonplan/charts'

import useStore from '../../store/index'

const TimeSeries = ({ data }) => {
    const band = useStore((state) => state.band)
    const forecastArray = useStore((state) => state.forecastArray)
    const xLabels = forecastArray.map(f => {
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
            pl: [0, 1, 1, 0],
            pr: [0, 1, 1, 1,],
            width: '100%',
            height: '200px',
        }
    }

    const yTicks = clim
    const yLabel = (band == 'percentile' || band == 'agreement' || band == 'percent') ? 'Percent (%)' : 'Precipitation (mm)'
    
    return (
        <>
            <Box sx={{ ...sx.chart }} className='chart-container'>
                <Chart x={[0, 5]} y={yTicks} padding={{ left: 60, top: 30 }}>
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

                        <Line data={data['percentile'].map((d, idx) => [idx, d[1]])} width={2} />

                        <Line data={data['agreement'].map((d, idx) => [idx, d[1]])} width={2} color='gray' />

                        {/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every */}
                        {!data[band].every((value) => isNaN(value[1])) && (
                            <Circle
                                x={sliderIndex}
                                y={data[band][sliderIndex][1]}
                                color={band == 'percentile' ? 'black' : 'gray'}
                                size={16}
                            />
                        )}

                    </Plot>
                </Chart>
            </Box>
        </>
    )
}

export default TimeSeries