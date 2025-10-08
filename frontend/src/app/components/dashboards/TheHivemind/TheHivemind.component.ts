import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-TheHivemind',
  templateUrl: './TheHivemind.component.html',
  styleUrls: ['./TheHivemind.component.css'],
  imports: [CommonModule]
})
export class TheHivemindComponent {
  fleetStats = {
    connectedNodes: 25,
    networkIntegrity: '99.8%',
    dataProcessed: '847 TB/s',
    activeSwarms: 6
  };

  nodes = [
    { id: 'NODE-001', type: 'Primary Core', status: 'Online', load: 78, connections: 24 },
    { id: 'NODE-002', type: 'Processing Unit', status: 'Online', load: 65, connections: 18 },
    { id: 'NODE-003', type: 'Data Relay', status: 'Online', load: 92, connections: 12 },
    { id: 'NODE-004', type: 'Backup Core', status: 'Standby', load: 15, connections: 8 }
  ];
}