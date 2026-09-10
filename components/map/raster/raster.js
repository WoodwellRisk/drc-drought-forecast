import { useEffect, useRef, useState } from 'react';
import { makeColormap } from '@carbonplan/colormaps';
import { ZarrLayer } from '@carbonplan/zarr-layer';
import { useMap } from './map-provider';
import { useMapView } from './use-map-view';
import { useStore } from '../store/index';

const Raster = ({ id, source, opacity, setRaster }) => {
  const zarrLayerRef = useRef(null);
  const removed = useRef(false);
  const { map } = useMap();
  const { zoom, center } = useMapView();

  const timePeriod = useStore((state) => state.timePeriod);
  const clim = useStore((state) => state.clim)();
  const colormap = useStore((state) => state.colormap)();
  const variable = useStore((state) => state.variable);
  const confidence = useStore((state) => state.confidence);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const time = useStore((state) => state.time);

  useEffect(() => {
    if (!zarrLayerRef.current) return;

    if (zoom < 4.5) zarrLayerRef.current.setUniforms({ u_zoom: zoom });
    if (zoom >= 4.5) zarrLayerRef.current.setUniforms({ u_zoom: zoom });
  }, [zoom]);

  const customFrag = `
    uniform float u_texWidth;
    uniform float u_texHeight;
    // uniform float u_var;
    uniform float u_zoom;
    const float ZOOM_THRESHOLD = 5.0;

    // 0 at low zooms, 5% of a pixel width at medium / high zooms
    float borderWidth = (u_zoom >= ZOOM_THRESHOLD) ? 0.1 : 0.0;

    // recalculate the texture and color
    // https://github.com/carbonplan/zarr-layer/tree/main?tab=readme-ov-file#ndvi-example
    // band / variable name
    // this will need to change based on a uniform value for the variable
    float dataVal = ${variable};
    // float dataVal = u_var;

    // handle NaN/Fill values 
    if (isnan(dataVal)) {
      fragColor.a = 0.0;
      return;
    }

    // normalize the data
    float norm = (dataVal - clim.x) / (clim.y - clim.x);
    
    // sample the colormap
    vec4 c = texture(colormap, vec2(clamp(norm, 0.0, 1.0), 0.5));
    
    // base color with opacity
    vec4 baseColor = vec4(c.rgb, opacity);

    // only show data as points when we are above a certain zoom threshold
    if (u_zoom < ZOOM_THRESHOLD) {
      fragColor = baseColor;
      return;
    }

    // here, we use sample_coord instead of pix_coord
    // sample_coord should be the actual texture coordinate (0-1 in texture space)
    // after the base shader's reprojection logic
    vec2 pixelSpace = sample_coord * vec2(u_texWidth, u_texHeight);
    vec2 texelCenter = floor(pixelSpace) + 0.5;
    float dist = distance(pixelSpace, texelCenter);
    float maxDist = 0.5;

    // float ringInner = maxDist * 0.85;
    // float ringOuter = maxDist * 0.95;

    // if (dist >= ringInner && dist <= ringOuter) {
    //   fragColor = vec4(0.0, 0.0, 0.0, opacity);
    // } else {
    //   fragColor = baseColor;
    // }

    // radius settings
    // in the future, we will need to base radiusFactor on the 'agree' variable in our data
    // circle fills 90% of the pixel
    float radiusFactor = 0.90;
    float outerRadius = maxDist * radiusFactor;
    float innerRadius = maxDist * (radiusFactor - borderWidth);
    
    // make area outside of the circle transparent
    if (dist > outerRadius) {
      fragColor.a = 0.0;
      return;
    }
    
    // keep original color inside circle
    if (dist <= innerRadius) {
      fragColor = baseColor;
    } 
    // add black border around circles
    // set rgb to black, keep the alpha from the base shader
    else {
      fragColor = vec4(0.0, 0.0, 0.0, opacity);
    }
  `;

  useEffect(() => {
    if (!map) return;

    map.on('remove', () => {
      removed.current = true;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const zarrLayer = new ZarrLayer({
      id: id,
      source: source,
      // zarrVersion: 2,
      zarrVersion: 3,
      // variable: timePeriod == 'forecast' || variable == 'precip' ? variable : 'perc',
      // clim: timePeriod == 'forecast' || variable == 'precip' ? clim : [0, 1],
      variable: variable,
      clim: clim,
      colormap: colormap,
      selector: { variable: variable, time: time, confidence: confidence },
      uniforms: {
        u_zoom: zoom,
        u_var: variable == 'percent' ? 0 : 1,
        u_texWidth: 173.0,
        u_texHeight: 137.0,
      },
      customFrag: timePeriod == 'forecast' ? customFrag : '',
      uniforms: { u_zoom: zoom },
      customFrag: '',
    });
    map.addLayer(zarrLayer);
    zarrLayerRef.current = zarrLayer;
    setRaster(zarrLayer);

    return () => {
      let layerId = id;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    };
  }, [map, variable, timePeriod]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setSelector({ variable: variable, confidence: confidence, time: time });
  }, [map, time]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    // layer.setSelector({ variable: variable, confidence: confidence, time: time });
    layer.setVariable(variable);
  }, [map, variable]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setSelector({ variable: variable, confidence: confidence, time: time });
  }, [map, confidence]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setOpacity(opacity);
  }, [map, opacity]);

  return null;
};

export default Raster;
