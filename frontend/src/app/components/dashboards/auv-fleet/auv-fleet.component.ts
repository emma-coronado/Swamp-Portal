import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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
export class AuvFleetComponent implements OnInit, OnDestroy {
  private streamSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  
  // Loading state to handle initial null values
  isLoading = true;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  
  initButton = 'Initiate';

  fleetStats = {
    totalVehicles: 0, // updated dynamically
    eventNum: 0,
    depthRange: '0-6000m',
    batteryStatus: 'Loading...'
  };

  // Placeholder missions data for initial display
  private placeholderMissions = [
    { id: 'Loading...', current_role: 'Loading...', new_reports: 0, avg_deviation: 0}
  ];

  // Dynamic missions data from SSE stream
  missions = this.placeholderMissions;

  missionsTableColumns: TableColumn[] = [
    { key: 'id', label: 'Name', type: 'text' },
    {
      key: 'current_role',
      label: 'Current Role',
      type: 'highlight',
      highlightColor: 'text-cyan-400'
    },
    {
      key: 'new_reports',
      label: 'New Reports',
      type: 'text'
    },
    { 
      key: 'avg_deviation', 
      label: 'Avg Path Deviation', 
      type: 'text'
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

  constructor(
    private streamService: StreamService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to connection status
    this.connectionSubscription = this.streamService.connectionState$.subscribe(status => {
      this.connectionStatus = status;
      if (status === 'error' || status === 'disconnected') {
        this.isLoading = true;
      }
    });

    // Subscribe to live SSE data
    this.streamSubscription = this.streamService.streamData$.subscribe((data: StreamData | null) => {
      if (data && data.Subs && data.Subs.length > 0) {
        this.isLoading = false;
        
        // Update fleet statistics
        this.fleetStats.totalVehicles = data.num_subs;
        this.fleetStats.eventNum = data.Events.length;

        this.fleetStats.batteryStatus = `50%`; // placeholder
        
        // Transform SSE data to match component structure
        this.missions = data.Subs.map((sub, index) => ({
          id: sub.name || `AUV-${String(index + 1).padStart(3, '0')}`,
          current_role: sub.role,
          new_reports: sub.new_reports,
          avg_deviation: sub.avg_deviation
        }));
        
        // Update navigation points based on travel plans
        this.updateNavigationPoints(data.Subs);
        
        // Trigger change detection
        this.cdr.detectChanges();
        
      } else if (data === null) {
        // Handle initial null values by keeping loading state
        console.log('Waiting for stream data...');
      } else if (data) {
        console.warn('Received data but no valid Subs array:', data);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  private getMaintenanceStatus(battery: number): string {
    // battery comes as 0.1 format, so convert to percentage first
    const batteryPercent = battery * 100;
    if (batteryPercent > 80) return 'Working';
    if (batteryPercent > 50) return 'Due for Maintenance';
    return 'Failing';
  }

  private getCurrentRole(sub: any, index: number): string {
    // Simple role assignment based on battery and index
    // You can customize this logic based on your actual data structure
    if (sub.Battery > 90) return 'MASTER';
    if (sub.Battery > 70) return 'SLAVE';
    if (sub.Battery > 50) return 'BATTERY_TANKER';
    return 'PATROL';
  }

  private updateNavigationPoints(subs: any[]) {
    // Generate navigation points based on submarine travel plans
    this.navigationPoints = [
      { x: 10, y: 20, label: 'Start Port', type: 'port' },
      ...subs.slice(0, 8).map((sub, index) => ({
        x: 20 + (index * 10),
        y: 30 + (index % 3) * 15,
        label: sub.Name || `AUV-${index + 1}`,  // Changed from sub.name to sub.Name
        type: 'vessel' as const
      })),
      { x: 85, y: 65, label: 'Research Station', type: 'port' }
    ];
  }

  // Method to manually retry connection
  retryConnection() {
    this.streamService.disconnect();
    // Wait a moment before reconnecting
    setTimeout(() => {
      this.streamService.connect().catch(error => {
        console.error('Manual retry failed:', error);
      });
    }, 1000);
  }
}
