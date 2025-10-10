import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StatusBoxComponent } from '../components/status-box.component';
import { DataTableComponent, TableColumn, TableRow } from '../components/data-table.component';
import { EventsPanelComponent, EventItem } from '../components/events-panel.component';
import { NauticalMapComponent, MapPoint } from '../components/nautical-map/nautical-map.component';
import { StreamService, StreamData } from '../../../services/stream';


@Component({
  selector: 'app-auv-fleet',
  templateUrl: './auv-fleet.component.html',
  styleUrls: ['./auv-fleet.component.css'],
  imports: [CommonModule, StatusBoxComponent, DataTableComponent, EventsPanelComponent, NauticalMapComponent]
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
      highlightColor: 'text-[#19817a]'
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

  // Accordion table uses the same columns as the missions table
  accordionTableColumns: TableColumn[] = [
    { key: 'id', label: 'Name', type: 'text' },
    {
      key: 'current_role',
      label: 'Current Role',
      type: 'highlight',
      highlightColor: 'text-[#19817a]'
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

  // Accordion table data - will be populated from stream data same as missions table
  private placeholderAccordionMissions: TableRow[] = [
    { id: 'Loading...', current_role: 'Loading...', new_reports: 0, avg_deviation: 0}
  ];

  // Dynamic accordion missions data from SSE stream (same as regular missions but with nautical maps)
  accordionTableData: TableRow[] = this.placeholderAccordionMissions;

  // Events data from the stream
  events: EventItem[] = [];

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

        // Update events data
        this.events = data.Events || [];
        
        // Transform SSE data to match component structure
        this.missions = data.Subs.map((sub, index) => ({
          id: sub.name || `AUV-${String(index + 1).padStart(3, '0')}`,
          current_role: sub.role,
          new_reports: sub.new_reports,
          avg_deviation: sub.avg_deviation
        }));
        
        // Transform SSE data for accordion table (same data but with nautical maps)
        this.accordionTableData = data.Subs.map((sub, index) => {
          const mapPoints = this.generateSubmarineMapPoints(sub, index);
          console.log(`Generating map points for ${sub.name}:`, mapPoints);
          console.log(`Travel plan for ${sub.name}:`, sub.travel_plan);
          
          return {
            id: sub.name || `AUV-${String(index + 1).padStart(3, '0')}`,
            current_role: sub.role,
            new_reports: sub.new_reports,
            avg_deviation: sub.avg_deviation,
            // Add nautical map data for each submarine
            mapTitle: `Navigation Chart - ${sub.name || `AUV-${String(index + 1).padStart(3, '0')}`}`,
            mapWidth: 700,
            mapHeight: 450,
            mapPoints: mapPoints,
            additionalInfo: this.generateSubmarineInfo(sub, index)
          };
        });
        
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

  private generateSubmarineMapPoints(sub: any, index: number): MapPoint[] {
    // Use actual travel plan data from the stream if available
    if (sub.travel_plan && sub.travel_plan.length > 0) {
      return sub.travel_plan.map((waypoint: any, wpIndex: number) => {
        // Convert timestamp to readable time (timestamps appear to be in milliseconds already)
        const waypointTime = new Date(waypoint.timestamp);
        const timestamp = waypointTime.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        
        // Convert 3D coordinates to 2D map coordinates
        // Your data ranges from -25 to 100 for x, and y is mostly 0
        // We need to transform this to a 0-100 scale for the map display
        const minX = -25;
        const maxX = 100;
        const minY = -25; // Adding some Y range even though your data shows mostly 0
        const maxY = 25;
        
        // Normalize coordinates to 10-90 range (leaving 10% padding on each side)
        const normalizedX = Math.max(10, Math.min(90, 
          10 + ((waypoint.position.x - minX) / (maxX - minX)) * 80));
        const normalizedY = Math.max(10, Math.min(90, 
          10 + ((waypoint.position.y - minY) / (maxY - minY)) * 80));
        
        return {
          x: normalizedX,
          y: normalizedY,
          label: `WP-${wpIndex + 1} (${timestamp})`,
          type: 'waypoint' as const
        };
      });
    }
    
    // Fallback to generated waypoints if no travel plan data is available
    const currentTime = new Date();
    const waypoints: MapPoint[] = [];
    const numWaypoints = 3; // Fewer fallback waypoints
    
    for (let i = 0; i < numWaypoints; i++) {
      const timeOffset = (numWaypoints - i - 1) * 15;
      const waypointTime = new Date(currentTime.getTime() - timeOffset * 60000);
      const timestamp = waypointTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const pathProgress = i / (numWaypoints - 1);
      const baseX = 15 + (index * 12);
      const baseY = 20 + (index * 10);
      
      const x = Math.max(5, Math.min(95, baseX + pathProgress * 60));
      const y = Math.max(5, Math.min(95, baseY + pathProgress * 40));
      
      waypoints.push({
        x: x,
        y: y,
        label: `WP-${i + 1} (${timestamp}) [No Data]`,
        type: 'waypoint'
      });
    }
    
    return waypoints;
  }

  private generateSubmarineInfo(sub: any, index: number): string {
    const subName = sub.name || `AUV-${String(index + 1).padStart(3, '0')}`;
    const role = sub.role || 'Unknown';
    const reports = sub.new_reports || 0;
    const deviation = sub.avg_deviation || 0;
    
    let travelPlanInfo = '';
    let waypointCount = 0;
    let lastWaypointTime = '';
    
    if (sub.travel_plan && sub.travel_plan.length > 0) {
      waypointCount = sub.travel_plan.length;
      const lastWaypoint = sub.travel_plan[sub.travel_plan.length - 1];
      const lastTime = new Date(lastWaypoint.timestamp); // Timestamp is already in milliseconds
      lastWaypointTime = lastTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      const firstWaypoint = sub.travel_plan[0];
      const firstTime = new Date(firstWaypoint.timestamp); // Timestamp is already in milliseconds
      const startTimeStr = firstTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      travelPlanInfo = `
        <strong>Mission Started:</strong> ${startTimeStr} - Travel plan active.<br>
        <strong>Waypoints:</strong> ${waypointCount} waypoints planned, last update: ${lastWaypointTime}.<br>
      `;
    } else {
      travelPlanInfo = `
        <strong>Travel Plan:</strong> No active travel plan data available.<br>
      `;
    }
    
    return `
      <strong>Mission Brief:</strong> ${subName} is currently assigned as ${role}.<br>
      ${travelPlanInfo}
      <strong>Recent Activity:</strong> ${reports} new reports submitted.<br>
      <strong>Navigation:</strong> Following real-time coordinate tracking. Average path deviation: ${deviation}m.<br>
      <strong>Status:</strong> Active mission with live position updates.
    `;
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
