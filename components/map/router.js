import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import { useMapbox } from '@carbonplan/maps'

import useStore from '../store/index'

const Router = () => {
    const { map } = useMapbox()
    const router = useRouter()
    const pathname = usePathname()

    const band = useStore((state) => state.band)
    const setBand = useStore((state) => state.setBand)
    const setVarTags = useStore((state) => state.setVarTags)

    useEffect(() => {
        const url = new URL(window.location)
        let savedBand = url.searchParams.get("band") != null ? url.searchParams.get("band") : 'percentile'
        setBand(savedBand)
        setVarTags({percentile: savedBand == 'percentile', agreement: savedBand == 'agreement'})
        
        if(!url.searchParams.has("band")) {
            url.searchParams.set("band", savedBand)
        }

        router.replace(`${pathname}?${url.searchParams}`)
        // prevent back button
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
        window.history.pushState(null, null, url);
        window.onpopstate = () => window.history.go(1)

    }, [window.onload]);

    useEffect(() => {
        const url = new URL(window.location)
        url.searchParams.set('band', band)
        router.push(`${pathname}?${url.searchParams}`)
    }, [band])

    return null
}

export default Router