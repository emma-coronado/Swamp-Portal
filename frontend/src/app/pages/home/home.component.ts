import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuvFleetComponent } from '../../components/dashboards/auv-fleet/auv-fleet.component';
import { DroneFleetComponent } from '../../components/dashboards/drone-fleet/drone-fleet.component';
import { AutonomousFleetComponent } from '../../components/dashboards/autonomous-fleet/autonomous-fleet.component';
import { TestComponent } from '../../components/test/test.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, AuvFleetComponent, DroneFleetComponent, AutonomousFleetComponent, TestComponent]
})
export class HomeComponent {
  currentUser = 'Admin'; // Placeholder for now
  currentDashboard = 'auv'; // Default to AUV fleet

  // Dashboard configurations
  dashboardConfig = {
    auv: {
      title: 'AUV Fleet Dashboard',
      subtitle: 'Autonomous Underwater Vehicles Management'
    },
    drone: {
      title: 'Drone Fleet Dashboard',
      subtitle: 'Aerial Surveillance & Monitoring'
    },
    autonomous: {
      title: 'Autonomous Vehicles Dashboard',
      subtitle: 'Self-Driving Vehicle Fleet'
    },
    test: {
      title: 'Test Page',
      subtitle: 'System Testing & Quality Assurance'
    }
  };

  constructor(private router: Router) {
    console.log('Home component loaded');
  }

  switchDashboard(dashboard: string) {
    this.currentDashboard = dashboard;
    console.log(`Switched to ${dashboard} dashboard`);
  }

  getDashboardTitle(): string {
    return this.dashboardConfig[this.currentDashboard as keyof typeof this.dashboardConfig]?.title || 'Vehicle Fleet Dashboard';
  }

  getDashboardSubtitle(): string {
    return this.dashboardConfig[this.currentDashboard as keyof typeof this.dashboardConfig]?.subtitle || 'Management System';
  }

  getTotalVehicles(): number {
    return 33; // Total across all fleets
  }

  logout() {
    console.log('Logging out...');
    // Clear any stored user data here when you implement authentication
    this.router.navigate(['/login']);
  }
}