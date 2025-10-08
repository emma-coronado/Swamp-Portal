import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-Clankers',
  templateUrl: './Clankers.component.html',
  styleUrls: ['./Clankers.component.css'],
  imports: [CommonModule]
})
export class ClankersComponent {
  fleetStats = {
    totalMechs: 8,
    operationalUnits: 7,
    maintenanceScheduled: 1,
    combatReadiness: '87%'
  };

  mechs = [
    { id: 'CLK-001', model: 'Heavy Assault', status: 'Combat Ready', armor: 95, weapons: 'Online' },
    { id: 'CLK-002', model: 'Scout Mech', status: 'Patrol', armor: 88, weapons: 'Online' },
    { id: 'CLK-003', model: 'Support Unit', status: 'Maintenance', armor: 45, weapons: 'Offline' },
    { id: 'CLK-004', model: 'Artillery', status: 'Standby', armor: 92, weapons: 'Online' }
  ];
}