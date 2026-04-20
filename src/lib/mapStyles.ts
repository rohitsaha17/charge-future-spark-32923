import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';

const ESRI_WORLD_STREET_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    raster: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    },
  },
  layers: [{ id: 'raster', type: 'raster', source: 'raster' }],
};

const CARTO_VOYAGER_FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    raster: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'raster', type: 'raster', source: 'raster' }],
};

export const SHARED_RASTER_MAP_STYLE = ESRI_WORLD_STREET_STYLE;

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }

  return '';
};

export const attachMapStyleFallback = (map: MapLibreMap) => {
  let switchedToFallback = false;

  const handleError = (event: { error?: unknown }) => {
    if (switchedToFallback) return;

    const message = getErrorMessage(event.error).toLowerCase();
    const isTileFailure = message.includes('failed to fetch') || message.includes('ajaxerror');

    if (!isTileFailure) return;

    switchedToFallback = true;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    map.setStyle(CARTO_VOYAGER_FALLBACK_STYLE);
    map.once('styledata', () => {
      map.jumpTo({ center, zoom, bearing, pitch });
    });
  };

  map.on('error', handleError);

  return () => {
    map.off('error', handleError);
  };
};
