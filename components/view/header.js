import { useEffect } from 'react';
import { Box, Button, IconButton, Text } from 'theme-ui';
import { alpha } from '@theme-ui/color';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { QuestionCircle, X } from '@carbonplan/icons';

import { Filter } from '@carbonplan/components';
import { Select } from 'theme-ui';

import { ChartIcon, MenuIcon } from '../icons/index';
import { useStore } from '../store/index';

export default function Header() {
  const isWide = useBreakpointIndex() > 0;

  const showMenu = useStore((state) => state.showMenu);
  const setShowMenu = useStore((state) => state.setShowMenu);
  const showAbout = useStore((state) => state.showAbout);
  const setShowAbout = useStore((state) => state.setShowAbout);
  const timePeriod = useStore((state) => state.timePeriod);
  const timePeriodOptions = useStore((state) => state.timePeriodOptions);
  const setTimePeriodOptions = useStore((state) => state.setTimePeriodOptions);
  const setTimePeriod = useStore((state) => state.setTimePeriod);
  const showDesktopSettings = useStore((state) => state.showDesktopSettings);
  const setShowDesktopSettings = useStore((state) => state.setShowDesktopSettings);
  const showCharts = useStore((state) => state.showCharts);
  const setShowCharts = useStore((state) => state.setShowCharts);
  const setPlotData = useStore((state) => state.setPlotData);

  useEffect(() => {
    if (!showCharts) {
      setPlotData({});
    }
  }, [showCharts]);

  return (
    <Box as="div" id="header" sx={{ position: 'relative', bg: alpha('muted', 0.5) }}>
      <Box as="div" id="org-name-container">
        <Text id="org-name-text">Woodwell Climate</Text>
      </Box>

      <Box
        as="div"
        id="header-settings-container"
        sx={{
          '#charts-toggle:hover ~ #charts-hover-error': {
            visibility: isWide && showMenu ? 'visible' : 'hidden',
          },
        }}
      >
        {/* <Dimmer aria-label='Change theme to light or dark' /> */}

        {/* {isWide && (
          <Filter
            id={'time-period-selector'}
            values={timePeriodOptions}
            setValues={setTimePeriodOptions}
          /> 
        )} */}

        <IconButton
          key="charts"
          id={'charts-toggle'}
          aria-label="Show or hide charts"
          onClick={() => {
            setShowCharts(!showCharts);
          }}
          disabled={showMenu}
          sx={{
            // stroke: showMenu ? alpha('primary', 0.75) : 'primary',
            display: isWide && timePeriod == 'forecast' ? 'initial' : 'none',
            // display: isWide ? 'initial' : 'none',
            stroke: 'primary',
            cursor: !showMenu ? 'pointer' : 'not-allowed',
            '&:hover': {
              stroke: showMenu ? 'red' : 'primary',
              outlineWidth: !showMenu ? '0px' : '1px',
              outlineStyle: 'solid',
              outlineColor: 'red',
            },
          }}
        >
          {isWide && (!showCharts || showMenu) && <ChartIcon />}
          {showCharts && !showMenu && <X />}
        </IconButton>

        <Box
          as="div"
          id="charts-hover-error"
          sx={{
            visibility: 'hidden',
            position: 'absolute',
            zIndex: 400,
            right: '0.75rem',
            bottom: '-60%',
            color: 'white',
            bg: 'primary',
            fontSize: '0.9rem',
            p: [2],
            borderRadius: '0.5rem',
          }}
        >
          Please exit from menu before continuing
        </Box>

        <Select
          id={'time-period-selector'}
          sx={{
            // width: '7rem',
            p: ' 0.25rem 0.75rem',
            mr: '0.25rem',
          }}
          defaultValue={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <option value="historical">Historical</option>
          <option value="forecast">Forecast</option>
        </Select>

        {isWide && (
          <Button
            sx={{
              width: '8.75rem',
              height: ['2rem'],
              lineHeight: '100%',
              color: 'secondary',
              bg: 'background',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'secondary',
              borderRadius: '5px',
              fontSize: [2],
              fontFamily: 'body',
              letterSpacing: 'body',
              textAlign: 'center',
              '&:hover': {
                color: 'primary',
                borderColor: 'primary',
              },
              '&:active': {
                color: 'white',
                bg: 'primary',
              },
            }}
            onClick={() => setShowDesktopSettings(!showDesktopSettings)}
          >
            <Text>{showDesktopSettings ? 'Hide settings' : 'Show settings'}</Text>
          </Button>
        )}

        <IconButton
          key="info"
          id={'about-button'}
          aria-label="Read more about how to use the site"
          onClick={() => {
            setShowAbout(!showAbout);
          }}
          sx={{ stroke: 'primary', cursor: 'pointer' }}
        >
          {!showAbout && <QuestionCircle sx={{ flexShrink: 0 }} />}
          {showAbout && <X />}
        </IconButton>

        <IconButton
          key="menu"
          id={'header-menu'}
          aria-label="Find out more about the work Woodwell does"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
          sx={{ stroke: 'primary', cursor: 'pointer' }}
        >
          {!showMenu && <MenuIcon />}
          {showMenu && <X />}
        </IconButton>
      </Box>
    </Box>
  );
}
