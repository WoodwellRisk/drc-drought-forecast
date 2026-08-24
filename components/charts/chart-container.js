import { useEffect } from 'react';
import { Box } from 'theme-ui';

import { fontToDataUri } from './utils';
import { useStore } from '../store/index';

export default function ChartContainer({ children }) {
  const setGintoUri = useStore((state) => state.setGintoUri);
  const setGemeliUri = useStore((state) => state.setGemeliUri);

  // change the path later on
  useEffect(() => {
    fontToDataUri(
      'https://storage.googleapis.com/risk-maps/media/fonts/ginto-normal-regular.ttf'
    ).then((fontUri) => setGintoUri(fontUri));
    fontToDataUri(
      'https://storage.googleapis.com/risk-maps/media/fonts/gemeli-mono-regular.ttf'
    ).then((fontUri) => setGemeliUri(fontUri));
  }, []);

  return (
    <Box
      as="div"
      id={'chart-container'}
      sx={{
        borderColor: 'primary',
        borderStyle: 'solid',
        borderWidth: '1px',
        backgroundColor: 'background',
        height: '17rem',
        width: '20rem',
        borderRadius: '0.5rem',
        zIndex: 10,
        position: 'absolute',
        right: '0.5rem',
        top: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        overflowYd: 'hidden',
      }}
    >
      <Box
        as="div"
        sx={{
          flex: '1 1 auto',
          m: [1],
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
