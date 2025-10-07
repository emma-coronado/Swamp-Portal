import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBoxComponent } from '../components/status-box.component';
import { DataTableComponent, TableColumn } from '../components/data-table.component';
import { NauticalMapComponent, MapPoint } from '../components/nautical-map/nautical-map.component';
import { StreamService, StreamData } from '../../../services/stream';


@Component({
  selector: 'app-auv-fleet',
  templateUrl: './auv-fleet.component.html',
  styleUrls: ['./auv-fleet.component.css'],
  imports: [CommonModule, StatusBoxComponent, DataTableComponent, NauticalMapComponent]
})
export class AuvFleetComponent {
  fleetStats = {
    totalVehicles: 0, // updated dynamically
    activeMissions: 5,
    depthRange: '0-6000m',
    batteryStatus: '87%'
  };

  missions = [
    { id: 'AUV-001', mission: 'Deep Sea Survey', depth: '2,400m', status: 'Active', battery: 92 },
    { id: 'AUV-002', mission: 'Pipeline Inspection', depth: '1,200m', status: 'Active', battery: 78 },
    { id: 'AUV-003', mission: 'Marine Biology', depth: '800m', status: 'Returning', battery: 65 },
    { id: 'AUV-004', mission: 'Oil Rig Survey', depth: '3,100m', status: 'Active', battery: 89 },
    { id: 'AUV-005', mission: 'Cable Mapping', depth: '1,800m', status: 'Standby', battery: 95 }
  ];

  missionsTableColumns: TableColumn[] = [
    { key: 'id', label: 'Vehicle ID', type: 'text' },
    { key: 'mission', label: 'Mission', type: 'text' },
    { key: 'depth', label: 'Depth', type: 'highlight', highlightColor: 'text-cyan-400' },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge',
      badgeColors: {
        'Active': 'bg-green-600/20 text-green-400',
        'Returning': 'bg-yellow-600/20 text-yellow-400',
        'Standby': 'bg-slate-600/20 text-slate-400'
      }
    },
    { 
      key: 'battery', 
      label: 'Battery', 
      type: 'progress',
      progressColors: {
        high: 'bg-green-500',
        medium: 'bg-yellow-500',
        low: 'bg-red-500'
      }
    }
  ];

  // Sample navigation data for the nautical map
  navigationPoints: MapPoint[] = [
    { x: 10, y: 20, label: 'Start Port', type: 'port' },
    { x: 25, y: 35, label: 'WP-1', type: 'waypoint' },
    { x: 40, y: 45, label: 'AUV-Alpha', type: 'vessel' },
    { x: 55, y: 30, label: 'Reef Zone', type: 'hazard' },
    { x: 70, y: 50, label: 'WP-2', type: 'waypoint' },
    { x: 85, y: 65, label: 'Research Station', type: 'port' },
    { x: 90, y: 40, label: 'Drone-Beta', type: 'vessel' },
    { x: 75, y: 75, label: 'WP-3', type: 'waypoint' },
    { x: 60, y: 80, label: 'Shallow Water', type: 'hazard' },
    { x: 35, y: 70, label: 'End Port', type: 'port' }
  ];

  constructor(private streamService: StreamService) {}

  ngOnInit() {
    // Subscribe to live SSE data
    this.streamService.streamData$.subscribe((data: StreamData | null) => {
      if (data) {
        this.fleetStats.totalVehicles = data.NumSubs;
        // Optional: dynamically update other parts of UI later
        // e.g. this.vehicles = data.Subs.map(...)
      }
    });
  }
}
