import { useEffect, useRef } from 'react';
import { Box, useColorMode } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { Header, Loading, Menu, Meta } from '../components/view/index';
import { DesktopSettings, MobileSettings } from '../components/settings/index';
import { Map } from '../components/map/index';
import { About } from '../components/about/index';
import { Colorbar } from '../components/colorbar/index';
import { ChartContainer, DotChart, DownloadChartButton } from '../components/charts/index';
import { useStore } from '../components/store/index';

export default function Index() {
  const isWide = useBreakpointIndex() > 0;
  const [colorMode, setColorMode] = useColorMode();
  const container = useRef(null);

  const showMenu = useStore((store) => store.showMenu);
  const showDesktopSettings = useStore((store) => store.showDesktopSettings);
  const showCharts = useStore((store) => store.showCharts);
  const setShowCharts = useStore((store) => store.setShowCharts);
  const timePeriod = useStore((store) => store.timePeriod);
  const plotData = useStore((store) => store.plotData);

  useEffect(() => {
    setColorMode('light');
  }, []);

  useEffect(() => {
    if (!isWide && showCharts) {
      setShowCharts(false);
    }
  }, [isWide]);

  useEffect(() => {
    if (timePeriod == 'historical') {
      setShowCharts(false);
    }
  }, [timePeriod]);

  return (
    <>
      <Meta />

      <Box as="div" id="container-grid">
        <Header />

        <Box as="div" id="main-container" ref={container}>
          <Loading />

          <Map />

          {isWide && showDesktopSettings && <DesktopSettings />}

          {isWide && showCharts && !showMenu && (
            <>
              {/* 
               The ChartContainer component places the chart on the page, ensures good padding and margins, 
               plus loads the fonts that individual charts will need. Then individual charts are returned as 
               SVGs that span the entire width and height of the ChartContainer component.
             */}
              <ChartContainer>
                <DotChart />
              </ChartContainer>

              {plotData && Object.keys(plotData).length > 0 && <DownloadChartButton />}
            </>
          )}

          {!isWide && <MobileSettings />}

          <Colorbar />

          <Menu />

          <About />
        </Box>
      </Box>
    </>
  );
}
