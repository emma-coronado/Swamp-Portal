import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drone-fleet',
  templateUrl: './drone-fleet.component.html',
  styleUrls: ['./drone-fleet.component.css'],
  imports: [CommonModule]
})
export class DroneFleetComponent {
  fleetStats = {
    totalDrones: 8,
    activeSurveillance: 6,
    flightTime: '4.2h avg',
    coverage: '85km²'
  };

  drones = [
    { id: 'DR-001', mission: 'Border Patrol', altitude: '150m', status: 'Active', battery: 78, flightTime: '2.4h' },
    { id: 'DR-002', mission: 'Traffic Monitor', altitude: '100m', status: 'Active', battery: 92, flightTime: '1.8h' },
    { id: 'DR-003', mission: 'Search & Rescue', altitude: '200m', status: 'RTB', battery: 23, flightTime: '4.1h' },
    { id: 'DR-004', mission: 'Infrastructure', altitude: '75m', status: 'Active', battery: 67, flightTime: '3.2h' },
    { id: 'DR-005', mission: 'Weather Survey', altitude: '300m', status: 'Active', battery: 89, flightTime: '1.9h' },
    { id: 'DR-006', mission: 'Fire Watch', altitude: '250m', status: 'Standby', battery: 100, flightTime: '0.0h' }
  ];

  recentActivity = [
    { time: '3 min ago', message: 'DR-002 detected traffic jam on Highway 101', type: 'warning' },
    { time: '8 min ago', message: 'DR-001 completed border sector Alpha-7', type: 'success' },
    { time: '12 min ago', message: 'DR-003 low battery, returning to base', type: 'warning' },
    { time: '25 min ago', message: 'DR-005 weather data uploaded successfully', type: 'info' }
  ];
}