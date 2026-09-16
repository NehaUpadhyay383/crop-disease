import { Report, ClusterInfo } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth (in kilometers)
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Clusters reports by spatial proximity and crop type.
 * Radius threshold defaults to 18 km.
 */
export function clusterReports(reports: Report[], radiusKm = 18): ClusterInfo[] {
  const clusters: ClusterInfo[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    if (assigned.has(r.id)) continue;

    const memberReports: Report[] = [r];
    assigned.add(r.id);

    for (let j = i + 1; j < reports.length; j++) {
      const other = reports[j];
      if (assigned.has(other.id)) continue;

      const dist = calculateDistanceKm(
        r.locationLat,
        r.locationLng,
        other.locationLat,
        other.locationLng
      );

      // Same crop and within proximity radius
      if (dist <= radiusKm && r.cropType.toLowerCase() === other.cropType.toLowerCase()) {
        memberReports.push(other);
        assigned.add(other.id);
      }
    }

    // Centroid
    const sumLat = memberReports.reduce((acc, m) => acc + m.locationLat, 0);
    const sumLng = memberReports.reduce((acc, m) => acc + m.locationLng, 0);
    const centerLat = sumLat / memberReports.length;
    const centerLng = sumLng / memberReports.length;

    // Determine outbreak status
    let riskLevel: 'watch' | 'alert' | 'outbreak' = 'watch';
    if (memberReports.length >= 4 || memberReports.some(m => m.urgency === 'severe')) {
      riskLevel = 'outbreak';
    } else if (memberReports.length >= 2 || memberReports.some(m => m.urgency === 'high')) {
      riskLevel = 'alert';
    }

    // Suspected issue from most common or first report
    const suspected =
      memberReports.find(m => m.suspectedIssue)?.suspectedIssue ||
      `${r.cropType} Symptoms`;

    const actionCardId = memberReports.find(m => m.linkedActionCardId)?.linkedActionCardId;

    clusters.push({
      id: `cluster-${r.id}`,
      name: `${r.locationLabel} ${r.cropType} Cluster`,
      centerLat: Math.round(centerLat * 10000) / 10000,
      centerLng: Math.round(centerLng * 10000) / 10000,
      radiusKm: Math.min(radiusKm, Math.max(5, memberReports.length * 4)),
      dominantCrop: r.cropType,
      suspectedIssue: suspected,
      reportIds: memberReports.map(m => m.id),
      riskLevel,
      actionCardId,
    });
  }

  return clusters;
}

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
