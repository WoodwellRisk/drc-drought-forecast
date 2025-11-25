import { create } from 'zustand'

const useStore = create((set, get) => ({
    // map container state
    zoom: 3,
    setZoom: (zoom) => set({ zoom }),

    minZoom: 1,
    maxZoom: 7,

    center: [28.50, -1.00],
    setCenter: (center) => set({ center }),

    bounds: [
        [-31.0, -41.5], // southwest
        [74.0, 45.0] // northeast
    ],

    variableArray: ['percent', 'precip'],
    variable: 'percent',
    setVariable: (variable) => set({ variable }),

    confidenceArray: ['5', '20', '50', '80', '95'],
    confidence: '50',
    setConfidence: (confidence) => set({ confidence }),

    band: () => {
        const {variable, confidence} = get()
        return `${variable}_${confidence}`
    },

    opacity: 1,
    setOpacity: (opacity) => set({ opacity }),

    display: true,
    setDisplay: (display) => set({ display }),

    // time: '2024-09-01',
    // setTime: (time) => set({time}),

    // okay, so the issue might be that we are trying to read in a datetime64[ns] object, when we want a string
    forecast: '2025-10-01',
    time: '2025-10-01',
    dates: [
        '2025-10-01',
        '2025-11-01',
        '2025-12-01',
        '2026-01-01',
        '2026-02-01', 
        '2026-03-01',
    ],
    setTime: (time) => set({time}),

    month: 1,
    setMonth: (month) => set({ month }),

    defaultColormaps: { percent: 'warm', precip: 'cool' },
    colormapName: () => {
        const {defaultColormaps, variable} = get()
        return defaultColormaps[variable]
    },

    climRanges: { 
        percent: { min: 0.0, max: 100.0 },
        precip: { min: 0.0, max: 260.0 },
    },
    clim: () => {
        const {climRanges, variable} = get()
        return [climRanges[variable].min, climRanges[variable].max]
    },

    showCharts: false,
    setShowCharts: (showCharts) => set({ showCharts }),

    plotData: {},
    setPlotData: (plotData) => set({ plotData }),

    showOceanMask: true,
    setShowOceanMask: (showOceanMask) => set({ showOceanMask }),

    showLandOutline: true,
    setShowLandOutline: (showLandOutline) => set({ showLandOutline }),

    showCountriesOutline: true,
    setShowCountriesOutline: (showCountriesOutline) => set({ showCountriesOutline }),

    showStatesOutline: false,
    setShowStatesOutline: (showStatesOutline) => set({ showStatesOutline }),

    sliderIndex: 0,
    setSliderIndex: (sliderIndex) => set({ sliderIndex }),

    sliding: false,
    setSliding: (sliding) => set({ sliding }),

    showAbout: false,
    setShowAbout: (showAbout) => set({ showAbout }),

    showAboutMobile: false,
    setShowAboutMobile: (showAboutMobile) => set({ showAboutMobile }),

    showMenu: false,
    setShowMenu: (showMenu) => set({ showMenu }),

    showOverlays: false,
    setShowOverlays: (showOverlays) => set({ showOverlays }),

    // sidebar options, also used by the router component
    varTitles: { percent: 'Percentile', precip: 'Precipitation' },
    varTitle: () => {
        const {varTitles, variable} = get()
        return varTitles[variable]
    },

    varDescriptions: {
        percent: 'Percentile',
        precip: 'Precipitation',
    },
    // varDescription: 'Average monthly temperature (degrees C).',
    varDescription: () => {
        const { varDescriptions, variable} = get()
        return varDescriptions[variable]
    },
    setVarDescription: (varDescription) => set({ varDescription }),

    varTags: { percent: true, precip: false },
    setVarTags: (varTags) => set({ varTags }),
    varTagLabels: {percent: 'Percentile', precip: 'Precipitation'},

    confTags: { 5: false, 20: false, 50: true, 80: false, 95: false },
    setConfTags: (confTags) => set({ confTags }),
    confTagLabels: {5: '5%', 20: '20%', 50: '50%', 80: '80%', 95: '95%'},

    defaultColors: { percent: 'blue', precip: 'red' },
    defaultLabels: { percent: 'Percentile', precip: 'Precipitation' },
    defaultUnits: { percent: '%', precip: 'mm' },

}))

export default useStore