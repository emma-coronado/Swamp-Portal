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

// Interface for dashboard configuration
interface DashboardItem {
  id: string;
  displayName: string;
  subtitle: string;
  componentSelector: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, AuvFleetComponent, AutoGatorsComponent, AardvarkComponent, GoblinGangComponent, ClankersComponent, TheHivemindComponent, ProberComponent, OneComponent]
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
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
    },
    {
      id: 'autogators',
      displayName: 'Project Name',
      subtitle: 'AutoGators',
      componentSelector: 'app-AutoGators',
      title: 'AutoGators Dashboard',
      icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'
    },
    {
      id: 'aardvark',
      displayName: 'Project Name',
      subtitle: 'Aardvark',
      componentSelector: 'app-Aardvark',
      title: 'Aardvark Dashboard',
      icon: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'
    },
    {
      id: 'goblingang',
      displayName: 'Project Name',
      subtitle: 'GoblinGang',
      componentSelector: 'app-GoblinGang',
      title: 'GoblinGang Dashboard',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'clankers',
      displayName: 'Project Name',
      subtitle: 'Clankers',
      componentSelector: 'app-Clankers',
      title: 'Clankers Dashboard',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h16a8.014 8.014 0 00-.244-5.572z'
    },
    {
      id: 'thehivemind',
      displayName: 'Project Name',
      subtitle: 'The Hivemind',
      componentSelector: 'app-TheHivemind',
      title: 'The Hivemind Dashboard',
      icon: 'M9 12a3 3 0 11-6 0 3 3 0 016 0zM21 12a3 3 0 11-6 0 3 3 0 616 0zM15 6a3 3 0 11-6 0 3 3 0 016 0zM15 18a3 3 0 11-6 0 3 3 0 616 0z'
    },
    {
      id: 'prober',
      displayName: 'Project Name',
      subtitle: 'Prober',
      componentSelector: 'app-Prober',
      title: 'Prober Dashboard',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    {
      id: 'one',
      displayName: 'Project Name',
      subtitle: 'One',
      componentSelector: 'app-One',
      title: 'One Dashboard',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
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