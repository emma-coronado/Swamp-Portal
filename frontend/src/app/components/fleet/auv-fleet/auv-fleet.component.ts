import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auv-fleet',
  templateUrl: './auv-fleet.component.html',
  styleUrls: ['./auv-fleet.component.css'],
  imports: [CommonModule]
})
export class AuvFleetComponent {
  fleetStats = {
    totalVehicles: 12,
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

  recentActivity = [
    { time: '2 min ago', message: 'AUV-001 reached target depth of 2,400m', type: 'success' },
    { time: '15 min ago', message: 'AUV-003 battery level at 65%, returning to base', type: 'warning' },
    { time: '32 min ago', message: 'AUV-002 completed pipeline segment 7', type: 'info' },
    { time: '1 hour ago', message: 'AUV-004 started oil rig perimeter survey', type: 'success' }
  ];
}