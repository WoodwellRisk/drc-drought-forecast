import { useState, useCallback, useEffect } from 'react';
import { Box, Button, IconButton, Input, Select, Slider, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { alpha } from '@theme-ui/color';
import { X } from '@carbonplan/icons';

import { Info } from '../view/index';
import { arrayRange, useStore } from '../store/index';

export default function Settings() {
  const isWide = useBreakpointIndex() > 0;

  // shared variables
  const setVariable = useStore((state) => state.setVariable);
  const variableIdx = useStore((state) => state.variableIdx);
  const setVariableIdx = useStore((state) => state.setVariableIdx);
  const setSliding = useStore((state) => state.setSliding);
  const validMonths = useStore((state) => state.validMonths);
  const validYears = useStore((state) => state.validYears);
  const timePeriod = useStore((state) => state.timePeriod);
  const time = useStore((state) => state.time);
  const setTime = useStore((state) => state.setTime);

  // historical
  const maxHistoricalDate = useStore((state) => state.maxHistoricalDate);
  const historicalDates = useStore((state) => state.historicalDates);
  const historicalSliderIndex = useStore((state) => state.historicalSliderIndex);
  const setHistoricalSliderIndex = useStore((state) => state.setHistoricalSliderIndex);
  const showTimeError = useStore((state) => state.showTimeError);
  const setShowTimeError = useStore((state) => state.setShowTimeError);

  // forecast
  const forecastDates = useStore((state) => state.forecastDates);
  const forecastSliderIndex = useStore((state) => state.forecastSliderIndex);
  const setForecastSliderIndex = useStore((state) => state.setForecastSliderIndex);

  const confidenceArray = useStore((state) => state.confidenceArray);
  const setConfidence = useStore((state) => state.setConfidence);
  const confidenceIdx = useStore((state) => state.confidenceIdx);
  const setConfidenceIdx = useStore((state) => state.setConfidenceIdx);

  // time slider
  const [sliderIndex, setSliderIndex] = useState(forecastDates.length - 1);
  const [maxSliderIndex, setMaxSliderIndex] = useState(forecastDates.length - 1);
  const [minSliderYear, setMinSliderYear] = useState(Number(forecastDates.at(0).split('-')[0]));
  const [maxSliderYear, setMaxSliderYear] = useState(Number(forecastDates.at(-1).split('-')[0]));

  const [defaultSkipYear, defaultSkipMonth, _] = maxHistoricalDate.split('-');
  const [skipMonth, setSkipMonth] = useState(defaultSkipMonth);
  const [skipYear, setSkipYear] = useState(defaultSkipYear);

  const sx = {
    'settings-container': {
      width: '100%',
      py: isWide ? 2 : 1,
      px: [3],
      mb: timePeriod == 'historical' ? [2] : [4],
    },
    title: {
      mt: [4],
      mb: [1],
      fontSize: isWide ? 2 : 1,
      letterSpacing: 'smallcaps',
      textTransform: 'uppercase',
    },
    subtitle: {
      color: 'gray',
      fontSize: isWide ? '0.9rem' : '0.75rem',
      mt: 1,
      mb: 1,
    },
    'data-description': {
      fontSize: '0.875rem',
      color: 'primary',
    },
    'data-source': {
      mt: 2,
    },
    button: {
      alignContent: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      borderRightWidth: '1px',
      borderRightStyle: 'solid',
      borderRightColor: 'primary',
      '&:last-child': {
        borderRightWidth: '0px',
      },
    },
    'options-container': {
      width: '100%',
      height: isWide ? '2.5rem' : '2rem',
      display: 'grid',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'primary',
    },
    'variable-container': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      '&:hover > .var-selection': {
        cursor: 'pointer',
      },
    },
    'confidence-container': {
      gridTemplateColumns: 'repeat(5, 1fr)',
      '&:hover > .confidence-level': {
        cursor: 'pointer',
      },
    },
    'time-slider': {
      width: '100%',
      mt: 3,
      mb: 3,
    },
    'slider-labels-container': {
      textAlign: 'center',
      pb: timePeriod == 'forecast' ? 0 : 2,
    },
  };

  const handleVariableChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx');
    setVariableIdx(newIdx);

    let variable =
      event.target.innerHTML == 'Percentiles'
        ? 'percent'
        : event.target.innerHTML == 'Monthly totals'
          ? 'precip'
          : null;
    if (variable != null) {
      setVariable(variable);
    }
  });

  const handleConfidenceChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx');
    setConfidenceIdx(newIdx);

    let confidence = parseInt(String(event.target.innerHTML).replace('%', ''));
    if (confidenceArray.includes(confidence)) {
      setConfidence(confidence);
    }
  });

  let variableLabels = ['Percentiles', 'Monthly totals'];
  let variableOptions = variableLabels.map((label, idx) => {
    return (
      <Box
        as="div"
        key={idx}
        data-idx={idx}
        role="button"
        className="var-selection"
        onClick={handleVariableChange}
        sx={{ ...sx['button'], bg: idx == variableIdx ? alpha('muted', 0.5) : 'background' }}
      >
        {label}
      </Box>
    );
  });

  let confidenceLabels = ['5%', '20%', '50%', '80%', '95%'];
  let confidenceOptions = confidenceLabels.map((label, idx) => {
    return (
      <Box
        as="div"
        key={idx}
        data-idx={idx}
        role="button"
        className="confidence-selection"
        onClick={handleConfidenceChange}
        sx={{ ...sx['button'], bg: idx == confidenceIdx ? alpha('muted', 0.5) : 'background' }}
      >
        {label}
      </Box>
    );
  });

  useEffect(() => {
    let index = timePeriod == 'historical' ? historicalDates.length - 1 : 0;
    let t = timePeriod == 'historical' ? historicalDates.at(index) : forecastDates.at(index);
    let maxIndex = timePeriod == 'historical' ? historicalDates.length - 1 : 5;
    let minYear =
      timePeriod == 'historical'
        ? Number(historicalDates.at(0).split('-')[0])
        : Number(forecastDates.at(0).split('-')[0]);
    let maxYear =
      timePeriod == 'historical'
        ? Number(historicalDates.at(-1).split('-')[0])
        : Number(forecastDates.at(-1).split('-')[0]);

    setSliderIndex(index);
    setMaxSliderIndex(maxIndex);
    setMinSliderYear(minYear);
    setMaxSliderYear(maxYear);
  }, [timePeriod]);

  useEffect(() => {
    if (timePeriod == 'historical') {
      setHistoricalSliderIndex(sliderIndex);
      setTime(historicalDates.at(sliderIndex));
    } else {
      // forecast
      setForecastSliderIndex(sliderIndex);
      setTime(forecastDates.at(sliderIndex));
    }
  }, [sliderIndex]);

  const handleMouseDown = useCallback(() => {
    setSliding(true);
  }, [time]);

  const handleMouseUp = useCallback(() => {
    setSliding(false);
  }, [time]);

  const handleSkipClick = useCallback(() => {
    let tempSliderIndex = historicalDates.indexOf(`${skipYear}-${skipMonth}-01`);
    if (tempSliderIndex != -1) {
      setShowTimeError(false);
      setHistoricalSliderIndex(tempSliderIndex);
      setTime(historicalDates.at(tempSliderIndex));
    } else {
      setShowTimeError(true);
    }
  });

  return (
    <>
      <Box sx={sx['settings-container']}>
        {/* {isWide && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} id="hide-settings-container">
            <IconButton
              aria-label="hide desktop settings container"
              // onClick={() => setShowDesktopSettings(false)}
              sx={{
                float: 'right',
                stroke: 'primary',
                cursor: 'pointer',
                width: 24,
                height: 24,
              }}
            >
              <X />
            </IconButton>
          </Box>
        )} */}

        <Box sx={{ mt: -3 }} id="var-container">
          <Box as="div" sx={sx.title} id="var-title">
            Layers <Info>View precipitation either as a percentile (%) or monthly total (mm).</Info>
          </Box>

          <Box
            as="div"
            id={'variable-container'}
            sx={{ ...sx['options-container'], ...sx['variable-container'] }}
          >
            {variableOptions}
          </Box>

          {/* {timePeriod == 'forecast' && (
            <Box id="confidence-layers">
              <Box as="div" sx={sx.title} id="confidence-title">
                Confidence level <Info>Select a confidence level to view.</Info>
              </Box>

              <Box
                as="div"
                id={'confidence-level-container'}
                sx={{ ...sx['options-container'], ...sx['confidence-container'] }}
              >
                {confidenceOptions}
              </Box>
            </Box>
          )} */}

          <Box id="time-slider-container">
            <Box sx={{ ...sx.title, mb: [2] }}>{`Date: ${time}`}</Box>

            <Slider
              key={'time-slider'}
              id={'time-slider'}
              sx={sx['time-slider']}
              value={timePeriod == 'historical' ? historicalSliderIndex : forecastSliderIndex}
              onChange={(e) => setSliderIndex(e.target.value)}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              min={0}
              max={maxSliderIndex}
              step={1}
            />

            <Box sx={sx['slider-labels-container']}>
              <Box
                sx={{
                  display: 'inline-block',
                  float: 'left',
                }}
              >
                {minSliderYear}
              </Box>

              <Box
                sx={{
                  float: 'right',
                  display: 'inline-block',
                }}
              >
                {maxSliderYear}
              </Box>
            </Box>
          </Box>

          {timePeriod == 'historical' && (
            <>
              <Box id={'skip-title-container'} sx={{ ...sx.title, mb: 2 }}>
                <Text sx={{ fontSize: 1, flexBasis: isWide ? '100%' : 'auto', mb: 1 }}>
                  Jump to:
                </Text>
              </Box>
              <Box
                id={'skip-buttons-container'}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  gap: 3,
                  alignItems: 'center',
                  alignText: 'center',
                }}
              >
                <Select
                  id={'month-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  defaultValue={defaultSkipMonth}
                  onChange={(e) => setSkipMonth(e.target.value)}
                >
                  {validMonths.map((month, idx) => {
                    return (
                      <option key={idx} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  id={'year-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  defaultValue={skipYear}
                  onChange={(e) => setSkipYear(e.target.value)}
                >
                  {validYears.map((year, idx) => {
                    return (
                      <option key={idx} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>

                <Button
                  onClick={handleSkipClick}
                  sx={{
                    color: 'secondary',
                    bg: 'background',
                    outlineWidth: '1px',
                    outlineStyle: 'solid',
                    outlineColor: 'secondary',
                    letterSpacing: 'smallcaps',
                    textTransform: 'uppercase',
                    '&:hover': {
                      color: 'primary',
                      bg: alpha('muted', 0.5),
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:active': {
                      color: 'background',
                      bg: 'primary',
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:focus:not(:active)': {
                      color: 'primary',
                      bg: alpha('muted', 0.5),
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:focus:not(:hover)': {
                      color: 'secondary',
                      bg: 'background',
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'secondary',
                    },
                  }}
                >
                  <Text>go</Text>
                </Button>
              </Box>
            </>
          )}

          {showTimeError && (
            <Box
              sx={{
                color: 'red',
                outlineWidth: '1px',
                outlineStyle: 'solid',
                outlineColor: 'red',
                mt: 4,
                py: 2,
                textAlign: 'center',
              }}
            >
              <Text sx={{ fontSize: '15px', mx: 2 }}>
                Select a time less than: {maxHistoricalDate}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
