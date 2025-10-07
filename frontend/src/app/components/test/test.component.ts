import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NauticalMapComponent, MapPoint } from '../dashboards/components/nautical-map/nautical-map.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  imports: [CommonModule, NauticalMapComponent]
})
export class TestComponent {
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

}