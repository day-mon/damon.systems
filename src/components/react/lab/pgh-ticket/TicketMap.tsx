import { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { TicketPoint } from '~/lib/pgh-ticket/types';

const STATUSES = [
  { label: 'open', color: '#ef4444' },
  { label: 'open in collections', color: '#f97316' },
  { label: 'paid', color: '#22c55e' },
  { label: 'closed', color: '#15803d' },
  { label: 'voided', color: '#a1a1aa' },
  { label: 'dismissed', color: '#eab308' },
  { label: 'suspended', color: '#8b5cf6' },
  { label: 'booted', color: '#ec4899' },
];

function markerColor(status: string): string {
  const s = STATUSES.find((st) => st.label === status);
  if (s) return s.color;
  if (status === 'open in collections*') return '#f97316';
  return '#a1a1aa';
}

function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', '');
      div.style.background = 'hsl(0 0% 9%)';
      div.style.border = '1px solid hsl(0 0% 100% / 10%)';
      div.style.padding = '8px 10px';
      div.style.fontFamily = 'Inter, sans-serif';
      div.style.fontSize = '11px';
      div.style.color = 'hsl(0 0% 64%)';
      div.style.lineHeight = '1.6';

      div.innerHTML = STATUSES.map((s) =>
        `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
          <span>${s.label}</span>
        </div>`
      ).join('');

      return div;
    };

    legend.addTo(map);
    return () => { legend.remove(); };
  }, [map]);

  return null;
}

const POPUP_STYLE = `
  .leaflet-popup-content-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    line-height: 1 !important;
  }
  .leaflet-popup-tip {
    background: hsl(0 0% 9%) !important;
  }
`;

function popupHtml(p: TicketPoint) {
  const amount = p.amount_due || '$0';
  const color = markerColor(p.status);
  const bg = 'hsl(0 0% 9%)';
  const fg = 'hsl(0 0% 98%)';
  const muted = 'hsl(0 0% 64%)';
  const border = 'hsl(0 0% 100% / 10%)';

  return `
    <div style="font-family:Inter,sans-serif;font-size:11px;background:${bg};color:${fg};padding:10px 12px;border:1px solid ${border};line-height:1.5;min-width:180px">
      <div style="font-weight:500;font-size:12px;margin-bottom:2px;text-transform:lowercase">${p.violation || 'unknown'}</div>
      <div style="color:${muted};font-size:11px">${p.location}</div>
      <div style="color:${muted};font-size:10px;margin-bottom:6px">${p.issue_date}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid ${border}">
        <span style="font-weight:500;color:${color}">${amount}</span>
        <span style="font-size:10px;text-transform:lowercase;padding:1px 6px;background:${color}22;color:${color}">${p.status}</span>
      </div>
    </div>`;
}

function clusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 30 : count < 100 ? 36 : count < 1000 ? 42 : 48;
  const fs = count < 10 ? 11 : count < 100 ? 10 : count < 1000 ? 10 : 9;
  const label = count < 1000 ? String(count) : (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:hsl(0 0% 20%);
      border:2px solid hsl(0 0% 100% / 10%);
      display:flex;align-items:center;justify-content:center;
      font-family:Inter,sans-serif;font-size:${fs}px;
      font-weight:500;color:hsl(0 0% 98%);
    ">${label}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MarkerClusterLayer({ points }: { points: TicketPoint[] }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 15,
      chunkedLoading: true,
      chunkInterval: 50,
      animate: false,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (c) => clusterIcon(c as L.MarkerCluster),
    });

    for (const p of points) {
      if (!p.latitude || !p.longitude) continue;
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: 3.5,
        fillColor: markerColor(p.status),
        color: 'transparent',
        fillOpacity: 0.55,
        weight: 0,
      });
      marker.bindPopup(popupHtml(p));
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
    };
  }, [map, points]);

  return null;
}

function FitBounds({ points }: { points: TicketPoint[] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current) return;
    const filtered = points.filter((p) => p.latitude && p.longitude);
    if (filtered.length === 0) return;

    const bounds = L.latLngBounds([]);
    for (const p of filtered) {
      bounds.extend([p.latitude, p.longitude]);
    }
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    hasFit.current = true;
  }, [map, points]);

  return null;
}

interface Props {
  points: TicketPoint[];
}

export default function TicketMap({ points }: Props) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = POPUP_STYLE;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  return (
    <div className="border border-border overflow-hidden">
      <MapContainer
        center={[40.4406, -79.9959]}
        zoom={13}
        className="h-[500px] w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <MarkerClusterLayer points={points} />
        <FitBounds points={points} />
        <Legend />
      </MapContainer>
    </div>
  );
}
