[mit license]: https://badgen.net/badge/license/MIT/blue
![MIT License][]

# Woodwell Risk Central African drought forecast

## Data sources
...

## Processing steps
### Vector data
Our boundary files came from Natural Earth. So far, we have used:
- 10m land and ocean boundaries [[link]](https://www.naturalearthdata.com/downloads/10m-physical-vectors/)
- 10m country- and state-level boundaries [[link]](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/).

All `SHP` files were converted to `GeoJSON` format in [`GeoPandas`](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.to_file.html). From there, we used [`Tippecanoe`](https://github.com/mapbox/tippecanoe) to convert the `GeoJSON` files to Mapbox `.mbtiles` format and used the Mapbox tool [`mbutil`](https://github.com/mapbox/mbutil) to convert those tiles to `.pbf` format. 

## Acknowledgements
This site's interface and functionality rely heavily on code developed by <a href='https://carbonplan.org/' target='_blank'>CarbonPlan</a>. Specifically, we used the <a href='https://github.com/carbonplan/maps' target='_blank'>`maps`</a>, <a href='https://github.com/carbonplan/components' target='_blank'>`components`</a>, and <a href='https://github.com/carbonplan/layouts' target='_blank'>`layouts`</a> libraries. Additionally, we modified the `<ExpandingSection />` component from the <a href="https://github.com/carbonplan/prototype-maps" target="_blank">`prototype-maps`</a> repository. You can read more about CarbonPlan's research and software development work <a href="https://carbonplan.org/research" target="_blank">here</a>.

This repository contains code from the CarbonPlan `components` package. Copyright (c) 2020 CarbonPlan, distributed under a MIT License.

This repository contains code from the CarbonPlan `maps` package. Copyright (c) 2021 CarbonPlan, distributed under a MIT License.

This repository contains code from the CarbonPlan `layouts` package. Copyright (c) 2021 CarbonPlan, distributed under a MIT License.

This repository contains code from the CarbonPlan `prototype-maps` package. Copyright (c) 2021 CarbonPlan, distributed under a MIT License.