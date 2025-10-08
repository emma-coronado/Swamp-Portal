import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-GoblinGang',
  templateUrl: './GoblinGang.component.html',
  styleUrls: ['./GoblinGang.component.css'],
  imports: [CommonModule]
})
export class GoblinGangComponent {
  fleetStats = {
    totalUnits: 15,
    activeOperations: 12,
    successRate: '96%',
    uptime: '24/7'
  };

  units = [
    { id: 'GG-001', mission: 'Recon Alpha', status: 'Active', battery: 85, efficiency: 94 },
    { id: 'GG-002', mission: 'Patrol Beta', status: 'Active', battery: 72, efficiency: 88 },
    { id: 'GG-003', mission: 'Survey Gamma', status: 'Standby', battery: 91, efficiency: 92 },
    { id: 'GG-004', mission: 'Guard Delta', status: 'Active', battery: 68, efficiency: 87 }
  ];
}