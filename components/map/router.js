import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import { useMapbox } from '@carbonplan/maps'

import useStore from '../store/index'

const Router = () => {
    const { map } = useMapbox()
    const router = useRouter()
    const pathname = usePathname()

    const variableArray = useStore((state) => state.variableArray)
    const variable = useStore((state) => state.variable)
    const setVariable = useStore((state) => state.setVariable)
    const confidence = useStore((state) => state.confidence)
    const setConfidence = useStore((state) => state.setConfidence)
    const setVarTags = useStore((state) => state.setVarTags)

    const verifySearchParams = useCallback((url) => {
        // check to see if there are other search params that shouldn't be there
        url.searchParams.forEach(function (value, key) {
            if (!['layer'].includes(key)) {
                url.searchParams.delete(key)
            }
        })
    })

    const getInitialLayer = useCallback((url) => {
        let initialLayer
        let tempLayer = url.searchParams.get("layer")

        if (tempLayer != null && typeof tempLayer == 'string' && variableArray.includes(tempLayer)) {
            initialLayer = tempLayer
        } else {
            initialLayer = 'percent'
        }

        url.searchParams.set('layer', initialLayer)
        return initialLayer
    })

    useEffect(() => {
        const url = new URL(window.location)
        verifySearchParams(url)
        let savedVariable = getInitialLayer(url)
        setVariable(savedVariable)
        setVarTags({ percent: savedVariable == 'percent', precip: savedVariable == 'precip' })

        if (!url.searchParams.has("layer")) {
            url.searchParams.set("layer", savedVariable)
        }

        router.replace(`${pathname}?${url.searchParams}`)
        // prevent back button
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
        window.history.pushState(null, null, url);
        window.onpopstate = () => window.history.go(1)

    }, [window.onload]);

    useEffect(() => {
        const url = new URL(window.location)
        url.searchParams.set('layer', variable)
        router.push(`${pathname}?${url.searchParams}`)
    }, [variable])

    return null
}

export default Router