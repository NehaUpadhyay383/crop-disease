import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ClusterInfo, Report } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ClusterMapViewProps {
  reports: Report[];
  clusters: ClusterInfo[];
  userLat: number;
  userLng: number;
  userVillage: string;
  onSelectReport: (report: Report) => void;
  selectedReportId?: string;
}

export const ClusterMapView: React.FC<ClusterMapViewProps> = ({
  reports,
  clusters,
  userLat,
  userLng,
  userVillage,
  onSelectReport,
  selectedReportId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered on user coordinates
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '&copy; OpenStreetMap contributors | PestWatch Surveillance',
        })
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // User Location Pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 20px; height: 20px; background: #059669; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon });
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; padding: 2px;">
        <strong style="color: #065f46;">📍 Your Farm Location</strong><br/>
        <span style="color: #4b5563;">${userVillage}</span><br/>
        <small style="color: #6b7280;">(Center for proximity alerts)</small>
      </div>
    `);
    layerGroup.addLayer(userMarker);

    // Render Cluster Zones (Outbreak circles)
    clusters.forEach((cluster) => {
      const isOutbreak = cluster.riskLevel === 'outbreak';
      const isAlert = cluster.riskLevel === 'alert';

      const color = isOutbreak ? '#dc2626' : isAlert ? '#d97706' : '#10b981';
      const fillColor = isOutbreak ? '#ef4444' : isAlert ? '#f59e0b' : '#34d399';

      const circle = L.circle([cluster.centerLat, cluster.centerLng], {
        radius: cluster.radiusKm * 400, // scaled visually for map view
        color,
        fillColor,
        fillOpacity: isOutbreak ? 0.18 : 0.12,
        weight: 1.5,
        dashArray: isOutbreak ? undefined : '4, 4',
      });

      circle.bindTooltip(
        `<b>${cluster.name}</b><br/>${cluster.dominantCrop} &bull; ${cluster.reportIds.length} reports`,
        { sticky: true }
      );
      layerGroup.addLayer(circle);
    });

    // Render Individual Report Pins
    reports.forEach((report) => {
      const isSelected = report.id === selectedReportId;
      const isSevere = report.urgency === 'severe';
      const isReviewed = report.status === 'reviewed';
      const isPending = report.status === 'review_pending';

      const bg = isSevere
        ? '#dc2626'
        : isReviewed
        ? '#059669'
        : isPending
        ? '#d97706'
        : '#2563eb';

      const iconLabel = report.cropType.substring(0, 2).toUpperCase();

      const markerIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <div style="
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background: ${bg};
            border: 2px solid ${isSelected ? '#fbbf24' : '#ffffff'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: transform 0.2s;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            ${iconLabel}
          </div>
        `,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker([report.locationLat, report.locationLng], {
        icon: markerIcon,
      });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'system-ui, sans-serif';
      popupContent.style.minWidth = '190px';
      popupContent.innerHTML = `
        <div style="margin-bottom: 6px;">
          <span style="display:inline-block; font-size: 11px; font-weight: 700; color: ${bg}; text-transform: uppercase;">
            ${report.cropType} &bull; ${report.partAffected}
          </span>
          <h4 style="margin: 2px 0 4px; font-size: 14px; font-weight: 600; color: #1c1917;">
            ${report.suspectedIssue || 'Symptom Report'}
          </h4>
          <p style="margin: 0; font-size: 12px; color: #57534e;">📍 ${report.locationLabel}</p>
        </div>
        ${
          report.photos[0]
            ? `<img src="${report.photos[0]}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" alt="Crop symptom" />`
            : ''
        }
        <button id="btn-view-${report.id}" style="
          width: 100%;
          background: #047857;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        ">
          View Case & Actions &rarr;
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${report.id}`);
        if (btn) {
          btn.onclick = () => onSelectReport(report);
        }
      });

      layerGroup.addLayer(marker);
    });
  }, [reports, clusters, userLat, userLng, userVillage, selectedReportId, onSelectReport]);

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Legend */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-stone-200 shadow-md text-xs max-w-xs pointer-events-auto">
        <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>Surveillance Map Legend</span>
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block border border-white shadow-xs" />
            <span className="text-stone-700">Severe Outbreak / Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block border border-white shadow-xs" />
            <span className="text-stone-700">Expert Verified / Action Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block border border-white shadow-xs" />
            <span className="text-stone-700">Awaiting Expert Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-300 inline-block" />
            <span className="text-stone-700 font-medium">Your Farm Location</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
            <span className="w-4 h-2 border border-red-500 bg-red-100/50 rounded-xs inline-block" />
            <span className="text-stone-500 text-[11px]">Proximity Cluster Buffer (~10-18 km)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
