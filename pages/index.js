import { useState, useEffect } from 'react'
import { Box, useColorMode } from 'theme-ui'
import { useBreakpointIndex } from '@theme-ui/match-media'

import Layout from '../components/view/layout'
import Desktop from '../components/view/desktop'
import Mobile from '../components/view/mobile'

function Index() {
  const isWide = useBreakpointIndex() > 0
  const [expanded, setExpanded] = useState(false)
  const [colorMode, setColorMode] = useColorMode()
  
  const description = 'Woodwell Risk drought forecast for the Democratic Republic of the Congo'
  const title = 'Woodwell Risk DRC drought forecast'
  const logoURL = 'https://storage.googleapis.com/risk-maps/media/woodwell-risk.png'

  useEffect(() => {
    setColorMode('light')
  }, [])

  return (
    <>
      {isWide && (
        <Layout
          description={description}
          title={title}
          dimmer={false}
          footer={false}
          metadata={false}
        >
          <Desktop />
        </Layout>
      )}
      {!isWide && (
        <Box sx={{ display: ['initial', 'none', 'none', 'none'], overflow: "hidden", }}>
          <Layout
            description={description}
            title={title}
            card={logoURL}
            dimmer={true}
            metadata={false}
            footer={false}
            settings={{
              value: expanded,
              onClick: () => setExpanded(!expanded),
            }}
          >
            <Mobile expanded={expanded} />
          </Layout>
        </Box>
      )}
    </>
  )
}

export default Index