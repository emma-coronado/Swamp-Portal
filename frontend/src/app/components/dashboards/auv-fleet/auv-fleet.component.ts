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
  
  fleetStats = {
    totalVehicles: 0, // updated dynamically
    activeMissions: 0,
    depthRange: '0-6000m',
    batteryStatus: 'Loading...'
  };

  // Placeholder missions data for initial display
  private placeholderMissions = [
    { id: 'Loading...', maintenanceStatus: 'Loading...', battery: 0, current_role: 'Loading...' }
  ];

  // Dynamic missions data from SSE stream
  missions = this.placeholderMissions;

  missionsTableColumns: TableColumn[] = [
    { key: 'id', label: 'Vehicle ID', type: 'text' },
    { 
      key: 'maintenanceStatus', 
      label: 'Maintenance Status', 
      type: 'badge',
      badgeColors: {
        'Working': 'bg-green-600/20 text-green-400',
        'Due for Maintenance': 'bg-yellow-600/20 text-yellow-400',
        'Failing': 'bg-red-600/20 text-red-400'
      }
    },
    { 
      key: 'battery', 
      label: 'Battery', 
      type: 'progress',
      progressColors: {
        high: 'bg-green-500',
        medium: 'bg-yellow-500',
        low: 'bg-red-500'
      }
    },
    {
      key: 'current_role',
      label: 'Current Role',
      type: 'highlight',
      highlightColor: 'text-cyan-400'
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
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 [${timestamp}] AUV Fleet Component received data:`, data);
      
      if (data && data.Subs && data.Subs.length > 0) {
        console.log(`✅ [${timestamp}] Processing valid SSE data with`, data.Subs.length, 'submarines');
        this.isLoading = false;
        
        // Update fleet statistics
        this.fleetStats.totalVehicles = data.NumSubs;
        this.fleetStats.activeMissions = data.Subs.length;
        
        // Calculate average battery status (convert from 0.1 to 10% format)
        const avgBattery = data.Subs.reduce((sum, sub) => sum + (sub.Battery * 100), 0) / data.Subs.length;
        this.fleetStats.batteryStatus = `${Math.round(avgBattery)}%`;
        
        console.log('📊 Updated fleet stats:', this.fleetStats);
        
        // Transform SSE data to match component structure
        this.missions = data.Subs.map((sub, index) => ({
          id: sub.Name || `AUV-${String(index + 1).padStart(3, '0')}`,  // Changed from sub.name to sub.Name
          maintenanceStatus: this.getMaintenanceStatus(sub.Battery),
          battery: Math.round(sub.Battery * 100), // Convert 0.1 to 10% format
          current_role: this.getCurrentRole(sub, index)
        }));
        
        console.log('🚢 Updated missions data:', this.missions);
        
        // Update navigation points based on travel plans
        this.updateNavigationPoints(data.Subs);
        
        // Force change detection (Angular might need this)
        console.log('🔄 Data update complete, triggering UI refresh');
        this.cdr.detectChanges();
        
      } else if (data === null) {
        // Handle initial null values by keeping loading state
        console.log('⚠️ Received null data from stream, keeping placeholder data');
      } else if (data) {
        console.log('⚠️ Received data but no valid Subs array:', data);
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
    if (sub.Battery > 70) return 'PATROL';
    if (sub.Battery > 50) return 'BATTERY_TANKER';
    return 'SLAVE';
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
    console.log('Manually retrying SSE connection...');
    this.streamService.disconnect();
    // Wait a moment before reconnecting
    setTimeout(() => {
      this.streamService.connect().catch(error => {
        console.error('Manual retry failed:', error);
      });
    }, 1000);
  }

  // Debug method for development
  debugStream() {
    this.streamService.debugStatus();
  }

  // Test method to manually fetch stream data
  async testStreamEndpoint() {
    console.log('🧪 Testing stream endpoint manually...');
    try {
      const response = await fetch('http://localhost:8080/api/stream', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('📡 Stream endpoint response status:', response.status);
      console.log('📋 Stream endpoint response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Read first few chunks to see what's being sent
        for (let i = 0; i < 3; i++) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          console.log(`📦 Stream chunk ${i + 1}:`, chunk);
        }
        
        reader.releaseLock();
      }
    } catch (error) {
      console.error('❌ Test stream endpoint failed:', error);
    }
  }

  // Manual test data update to verify UI reactivity
  testManualUpdate() {
    console.log('🧪 Testing manual data update...');
    
    // Create test data
    const testData: StreamData = {
      NumSubs: 3,
      Subs: [
        { Name: 'TEST-AUV-001', Battery: 0.95, TravelPlan: [[0, 0, 0, 0]] },
        { Name: 'TEST-AUV-002', Battery: 0.82, TravelPlan: [[1, 1, 1, 1]] },
        { Name: 'TEST-AUV-003', Battery: 0.67, TravelPlan: [[2, 2, 2, 2]] }
      ]
    };
    
    // Manually process the test data
    this.isLoading = false;
    this.fleetStats.totalVehicles = testData.NumSubs;
    this.fleetStats.activeMissions = testData.Subs.length;
    
    const avgBattery = testData.Subs.reduce((sum, sub) => sum + sub.Battery, 0) / testData.Subs.length;
    this.fleetStats.batteryStatus = `${Math.round(avgBattery)}%`;
    
    this.missions = testData.Subs.map((sub, index) => ({
      id: sub.Name,
      maintenanceStatus: this.getMaintenanceStatus(sub.Battery),
      battery: Math.round(sub.Battery * 100),
      current_role: this.getCurrentRole(sub, index)
    }));
    
    this.updateNavigationPoints(testData.Subs);
    this.cdr.detectChanges();
    
    console.log('✅ Manual test update complete!');
  }

  // Try alternative EventSource connection
  tryEventSource() {
    console.log('🔄 Trying EventSource connection method...');
    this.streamService.connectWithEventSource();
  }
}
