import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-Prober',
  templateUrl: './Prober.component.html',
  styleUrls: ['./Prober.component.css'],
  imports: [CommonModule]
})
export class ProberComponent {
  fleetStats = {
    activeProbes: 12,
    scanningRange: '500km',
    dataCollected: '2.4 PB',
    anomaliesDetected: 7
  };

  probes = [
    { id: 'PRB-001', mission: 'Deep Space Scan', status: 'Active', distance: '342 km', signals: 15 },
    { id: 'PRB-002', mission: 'Asteroid Survey', status: 'Active', distance: '198 km', signals: 8 },
    { id: 'PRB-003', mission: 'Signal Analysis', status: 'Scanning', distance: '445 km', signals: 23 },
    { id: 'PRB-004', mission: 'Perimeter Watch', status: 'Standby', distance: '89 km', signals: 3 }
  ];
}