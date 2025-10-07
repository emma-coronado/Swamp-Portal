import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autonomous-fleet',
  templateUrl: './autonomous-fleet.component.html',
  styleUrls: ['./autonomous-fleet.component.css'],
  imports: [CommonModule]
})
export class AutonomousFleetComponent {
  fleetStats = {
    totalVehicles: 13,
    activeRoutes: 9,
    efficiency: '94%',
    totalMiles: '2,847'
  };

  vehicles = [
    { id: 'AV-001', route: 'Downtown Loop', passengers: 4, status: 'Active', battery: 87, efficiency: 96 },
    { id: 'AV-002', route: 'Airport Shuttle', passengers: 2, status: 'Active', battery: 73, efficiency: 92 },
    { id: 'AV-003', route: 'University Campus', passengers: 0, status: 'Charging', battery: 45, efficiency: 98 },
    { id: 'AV-004', route: 'Business District', passengers: 3, status: 'Active', battery: 91, efficiency: 94 },
    { id: 'AV-005', route: 'Medical Center', passengers: 1, status: 'Active', battery: 68, efficiency: 89 },
    { id: 'AV-006', route: 'Shopping Mall', passengers: 2, status: 'Active', battery: 82, efficiency: 97 }
  ];

  recentActivity = [
    { time: '1 min ago', message: 'AV-001 picked up passenger at Central Station', type: 'success' },
    { time: '5 min ago', message: 'AV-004 completed route, 96% efficiency achieved', type: 'success' },
    { time: '9 min ago', message: 'AV-003 started charging cycle', type: 'info' },
    { time: '15 min ago', message: 'AV-002 traffic delay detected, rerouting automatically', type: 'warning' }
  ];
}