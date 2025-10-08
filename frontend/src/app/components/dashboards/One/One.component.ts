import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-One',
  templateUrl: './One.component.html',
  styleUrls: ['./One.component.css'],
  imports: [CommonModule]
})
export class OneComponent {
  fleetStats = {
    singleton: 1,
    uniqueStatus: 'Operational',
    specialCapabilities: '∞',
    threatLevel: 'Minimal'
  };

  entity = {
    id: 'ONE-001',
    designation: 'The One',
    status: 'Active',
    power: '100%',
    location: 'Everywhere',
    lastSeen: 'Now'
  };
}