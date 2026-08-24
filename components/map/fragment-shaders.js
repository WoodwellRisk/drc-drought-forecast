// expects a Zarr pyramid with a tile size of 256 and with a CRS of 3857
export const pyramidShader = `
    const float TILE_SIZE = 256.0;
    // uniform float u_var;
    uniform float u_zoom;
    const float ZOOM_THRESHOLD = 4.5;
    // 0 at low zooms, 5% of a pixel width at medium / high zooms
    float borderWidth = (u_zoom >= ZOOM_THRESHOLD) ? 0.1 : 0.0;

    // recalculate the texture and color
    // https://github.com/carbonplan/zarr-layer/tree/main?tab=readme-ov-file#ndvi-example
    // band / variable name
    // this will need to change based on a uniform value for the variable
    float dataVal = ${variable};
    // float dataVal = u_var;

    // handle NaN / fill values 
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

    // assuming pix_coord is 0.0 to 1.0
    vec2 texelSize = 1.0 / vec2(TILE_SIZE);
    
    // calculate the center of the current pixel in normalized space
    // floor(pix_coord / texelSize) gives the pixel index (0 to 255)
    // + 0.5 gives the center of that pixel
    vec2 pixelIndex = floor(pix_coord * TILE_SIZE) + 0.5;
    vec2 texelCenter = pixelIndex / TILE_SIZE;
    
    float dist = distance(pix_coord, texelCenter);
    // half the width of one pixel
    float maxDist = 0.5 * texelSize.x;
    
    // radius settings
    // in the future, we will need to base radiusFactor on the 'agree' variable in our data
    // circle fills 90% of the pixel
    float radiusFactor = 0.9;
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

// expects a 'flat' Zarr in CRS 4326
const flatShader = `
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
