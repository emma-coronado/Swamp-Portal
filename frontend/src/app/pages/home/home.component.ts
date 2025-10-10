import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuvFleetComponent } from '../../components/dashboards/auv-fleet/auv-fleet.component';
import { AutoGatorsComponent } from '../../components/dashboards/AutoGators/AutoGators.component';
import { AardvarkComponent } from '../../components/dashboards/Aardvark/Aardvark.component';
import { GoblinGangComponent } from '../../components/dashboards/GoblinGang/GoblinGang.component';
import { ClankersComponent } from '../../components/dashboards/Clankers/Clankers.component';
import { TheHivemindComponent } from '../../components/dashboards/TheHivemind/TheHivemind.component';
import { ProberComponent } from '../../components/dashboards/Prober/Prober.component';
import { OneComponent } from '../../components/dashboards/One/One.component';
import { Jet2HolidayComponent } from '../../components/dashboards/Jet2Holiday/Jet2Holiday.component';

// Interface for dashboard configuration
interface DashboardItem {
  id: string;
  displayName: string;
  subtitle: string;
  componentSelector: string;
  icon: string;
  title: string;
  accentColor: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, AuvFleetComponent, AutoGatorsComponent, AardvarkComponent, GoblinGangComponent, ClankersComponent, TheHivemindComponent, ProberComponent, OneComponent, Jet2HolidayComponent]
})
export class HomeComponent {
  currentUser = 'Admin'; // Placeholder for now
  currentDashboard = 'auv'; // Default to AUV fleet

  // Dashboard configurations array
  dashboards: DashboardItem[] = [
    {
      id: 'auv',
      displayName: 'AUV Fleet',
      subtitle: 'What Are You Doing In My Swamp?',
      componentSelector: 'app-auv-fleet',
      title: 'AUV Fleet Dashboard',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
      accentColor: 'auv'
    },
    {
      id: 'autogators',
      displayName: 'Convoy Routing',
      subtitle: 'AutoGators',
      componentSelector: 'app-AutoGators',
      title: 'AutoGators Dashboard',
      icon: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
      accentColor: 'autogators'
    },
    {
      id: 'aardvark',
      displayName: 'Project Name',
      subtitle: 'Aardvark',
      componentSelector: 'app-Aardvark',
      title: 'Aardvark Dashboard',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8l-2 2v3l2 2-1 1-2-2H9l-2 2-1-1 2-2v-3l-2-2 1-1 2 2h3.5l2-2 1 1z',
      accentColor: 'aardvark'
    },
    {
      id: 'goblingang',
      displayName: 'Project Name',
      subtitle: 'GoblinGang',
      componentSelector: 'app-GoblinGang',
      title: 'GoblinGang Dashboard',
      icon: 'M14.5 2.5c0 1.5-1 2.5-2.5 2.5S9.5 4 9.5 2.5 10.5 0 12 0s2.5 1 2.5 2.5zM6 7l2 2 2-2 2 2 2-2 2 2v2l-2 2-2-2-2 2-2-2-2 2-2-2V7l2 2zm6 5l2 2 2-2 2 2v3l-2 2-2-2-2 2-2-2v-3l2-2zm-6 0l2 2v3l-2 2-2-2v-3l2-2z',
      accentColor: 'goblingang'
    },
    {
      id: 'jet2holiday',
      displayName: 'Project Name',
      subtitle: 'Jet2Holiday',
      componentSelector: 'app-Jet2Holiday',
      title: 'Jet2Holiday Dashboard',
      icon: 'M22 12h-4l-3 8v-6h-2v6l-3-8H6l4-4h8l4 4zM2 12l2-2v8l-2-2v-4zm20-2l2 2v4l-2 2v-8zM12 2l2 2H10l2-2z',
      accentColor: 'jet2holiday'
    },
    {
      id: 'clankers',
      displayName: 'HUSH-Mesh',
      subtitle: 'Clankers',
      componentSelector: 'app-Clankers',
      title: 'Clankers Dashboard',
      icon: 'M3 6h18v2H3V6zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM21 4l1 1-1 1-1-1 1-1zm-3 3l1 1-1 1-1-1 1-1zm0 4l1 1-1 1-1-1 1-1zm0 4l1 1-1 1-1-1 1-1z',
      accentColor: 'clankers'
    },
    {
      id: 'thehivemind',
      displayName: 'Project Name',
      subtitle: 'The Hivemind',
      componentSelector: 'app-TheHivemind',
      title: 'The Hivemind Dashboard',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      accentColor: 'thehivemind'
    },
    {
      id: 'prober',
      displayName: 'Project Name',
      subtitle: 'Prober',
      componentSelector: 'app-Prober',
      title: 'Prober Dashboard',
      icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
      accentColor: 'prober'
    },
    {
      id: 'one',
      displayName: 'Project Name',
      subtitle: 'One',
      componentSelector: 'app-One',
      title: 'One Dashboard',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      accentColor: 'one'
    }
  ];

  constructor(private router: Router, private authService: AuthService) {
    console.log('Home component loaded');
  }

  switchDashboard(dashboard: string) {
    this.currentDashboard = dashboard;
    console.log(`Switched to ${dashboard} dashboard`);
  }

  getDashboardTitle(): string {
    const dashboard = this.dashboards.find(d => d.id === this.currentDashboard);
    return dashboard?.title || 'Vehicle Fleet Dashboard';
  }

  getDashboardSubtitle(): string {
    const dashboard = this.dashboards.find(d => d.id === this.currentDashboard);
    return dashboard?.subtitle || 'Management System';
  }

  getCurrentDashboard(): DashboardItem | undefined {
    return this.dashboards.find(d => d.id === this.currentDashboard);
  }

  getCurrentAccentColor(): string {
    const dashboard = this.getCurrentDashboard();
    return dashboard ? dashboard.accentColor : 'auv';
  }

  // Get component selector for current dashboard
  getCurrentComponentSelector(): string {
    const dashboard = this.getCurrentDashboard();
    return dashboard?.componentSelector || '';
  }

  // Method to add new dashboard dynamically
  addDashboard(dashboard: DashboardItem): void {
    if (!this.dashboards.find(d => d.id === dashboard.id)) {
      this.dashboards.push(dashboard);
    }
  }

  // Method to remove a dashboard
  removeDashboard(dashboardId: string): void {
    this.dashboards = this.dashboards.filter(d => d.id !== dashboardId);
    // If the current dashboard is removed, switch to the first available one
    if (this.currentDashboard === dashboardId && this.dashboards.length > 0) {
      this.currentDashboard = this.dashboards[0].id;
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Successfully logged out on server
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if server logout fails, clear client state and redirect
        this.authService.setLoginStatus(false);
        this.router.navigate(['/login']);
      }
    });
  }
}