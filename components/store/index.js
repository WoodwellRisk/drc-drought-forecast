import { create } from 'zustand'

const useStore = create((set, get) => ({
    // map container state
    zoom: 1,
    setZoom: (zoom) => set({ zoom }),

    maxZoom: 8,

    // https://github.com/mapbox/mapbox-gl-js/blob/2b6915c8004a5b759338f3a7d92fb2882db9dd5c/src/geo/lng_lat.js#L192-L201
    // https://docs.mapbox.com/mapbox-gl-js/example/restrict-bounds/
    bounds: [
        [7.2, -13.8], // southwest
        [33.8, 8.8] // northeast
    ],

    variable: 'drought',

    band: 'percentile',
    bandArray: ['percentile', 'agreement', 'precip_mean', 'percent'],
    setBand: (band) => set({ band }),

    opacity: 1,
    setOpacity: (opacity) => set({ opacity }),

    display: true,
    setDisplay: (display) => set({ display }),

    time: '2024-09-01',
    setTime: (time) => set({time}),

    // okay, so the issue might be that we are trying to read in a datetime64[ns] object, when we want a string
    forecast: '2024-09-01',
    forecastArray: [
        '2024-09-01',
        '2024-10-01',
        '2024-11-01',
        '2024-12-01',
        '2025-01-01', 
        '2025-02-01',
    ],
    setForecast: (forecast) => set({forecast}),

    month: 1,
    setMonth: (month) => set({ month }),

    defaultColormaps: { percentile: 'cool', agreement: 'warm' },
    colormapName: () => {
        const {defaultColormaps, band} = get()
        return defaultColormaps[band]
    },

    climRanges: { 
        percentile: { min: 0.0, max: 100.0 },
        agreement: { min: 0.0, max: 100.0 },
        precip_mean: { min: 0.0, max: 260.0 },
        percent: { min: 73.0, max: 120.0 }, // current min/max is 73.4, 120.0


    },
    clim: () => {
        const {climRanges, band} = get()
        return [climRanges[band].min, climRanges[band].max]
    },

    regionData: { loading: true },
    setRegionData: (regionData) => set({ regionData }),

    regionLoadingData: true,
    setRegionDataLoading: (regionLoadingData) => set({ regionLoadingData }),

    showRegionPicker: false,
    setShowRegionPicker: (showRegionPicker) => set({ showRegionPicker }),

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

    showMenu: false,
    setShowMenu: (showMenu) => set({ showMenu }),

    showOverlays: false,
    setShowOverlays: (showOverlays) => set({ showOverlays }),

    // sidebar options, also used by the router component
    varTags: { percentile: true, agreement: false },
    setVarTags: (varTags) => set({ varTags }),
    varTagLabels: {percentile: 'Percentile', agreement: 'Agreement'},

    varTitles: { percentile: 'Percentile', agreement: 'Agreement' },
    varTitle: () => {
        const {varTitles, band} = get()
        return varTitles[band]
    },

    varDescriptions: {
        percentile: 'Percentile',
        agreement: 'Agreement',
    },
    // varDescription: 'Average monthly temperature (degrees C).',
    varDescription: () => {
        const { varDescriptions, band} = get()
        return varDescriptions[band]
    },
    // setVarDescription: (varDescription) => set({ varDescription }),

    defaultColors: { percentile: 'blue', agreement: 'red' },
    defaultLabels: { percentile: 'Percentile', agreement: 'Model agreement' },
    defaultUnits: { percentile: '%', agreement: '%' },

}))

export default useStore