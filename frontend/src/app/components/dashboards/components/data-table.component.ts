import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NauticalMapComponent, MapPoint } from './nautical-map/nautical-map.component';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'progress' | 'highlight';
  badgeColors?: { [key: string]: string };
  progressColors?: { high: string; medium: string; low: string };
  highlightColor?: string;
}

export interface TableRow {
  [key: string]: any;
  // Optional properties for accordion mode with nautical maps
  mapPoints?: MapPoint[];
  mapTitle?: string;
  mapWidth?: number;
  mapHeight?: number;
  additionalInfo?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, NauticalMapComponent],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 class="text-xl font-bold mb-4">{{ title }}</h3>

      <!-- Regular Table Mode -->
      <div *ngIf="!accordionMode" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700">
              <th 
                *ngFor="let column of columns" 
                class="text-left py-3 px-4 text-slate-400 font-medium"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data" class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-200 cursor-pointer">
              <td *ngFor="let column of columns" class="py-3 px-4">
                <ng-container [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ row: row, column: column }"></ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Accordion Mode -->
      <div *ngIf="accordionMode" class="space-y-2">
        <div *ngFor="let row of data; let i = index" class="border border-slate-700 rounded-lg overflow-hidden">
          
          <!-- Accordion Header (Clickable) -->
          <div 
            class="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
            (click)="toggleRow(i)"
          >
            <!-- Row Data -->
            <div class="flex-1 grid gap-4" [style.grid-template-columns]="'repeat(' + columns.length + ', 1fr)'">
              <div *ngFor="let column of columns" class="min-w-0">
                <div class="text-xs text-slate-400 mb-1">{{ column.label }}</div>
                <ng-container [ngTemplateOutlet]="cellContent" [ngTemplateOutletContext]="{ row: row, column: column }"></ng-container>
              </div>
            </div>
            
            <!-- Expand/Collapse Icon -->
            <div class="ml-4 flex-shrink-0">
              <svg 
                class="w-5 h-5 transform transition-transform duration-200"
                [class.rotate-180]="expandedRows.has(i)"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Expanded Content (Nautical Map) -->
          <div 
            *ngIf="expandedRows.has(i)" 
            class="border-t border-slate-700 bg-slate-800/50 p-6 animate-fadeIn"
          >
            <div class="flex justify-center">
              <app-nautical-map 
                [points]="row['mapPoints'] || []"
                [width]="row['mapWidth'] || 600"
                [height]="row['mapHeight'] || 400"
                [title]="row['mapTitle'] || 'Navigation Chart - ' + (columns.length > 0 && columns[0]?.key ? row[columns[0].key] : 'Unknown')"
              ></app-nautical-map>
            </div>
            
            <!-- Additional content area -->
            <div *ngIf="row['additionalInfo']" class="mt-4 p-4 bg-slate-700/30 rounded-lg">
              <h4 class="text-lg font-semibold mb-2 text-cyan-400">Additional Information</h4>
              <div class="text-slate-300" [innerHTML]="row['additionalInfo']"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cell Content Template -->
    <ng-template #cellContent let-row="row" let-column="column">
      <!-- Text type -->
      <span *ngIf="!column.type || column.type === 'text'" [class.font-medium]="columns[0].key === column.key">
        {{ row[column.key] }}
      </span>

      <!-- Highlight type -->
      <span *ngIf="column.type === 'highlight'" [ngClass]="column.highlightColor || 'text-cyan-400'">
        {{ row[column.key] }}
      </span>

      <!-- Badge type -->
      <span 
        *ngIf="column.type === 'badge'"
        class="px-2 py-1 rounded-full text-xs font-medium"
        [ngClass]="getBadgeClass(row[column.key], column.badgeColors)"
      >
        {{ row[column.key] }}
      </span>

      <!-- Progress type -->
      <div *ngIf="column.type === 'progress'" class="flex items-center space-x-2">
        <div class="w-16 bg-slate-700 rounded-full h-2">
          <div 
            class="h-2 rounded-full"
            [ngClass]="getProgressColor(row[column.key], column.progressColors)"
            [style.width.%]="row[column.key]"
          ></div>
        </div>
        <span class="text-sm">{{ row[column.key] }}%</span>
      </div>
    </ng-template>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class DataTableComponent {
  @Input() title: string = 'Data Table';
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() accordionMode: boolean = false; // New input to enable accordion functionality

  expandedRows = new Set<number>();

  toggleRow(index: number) {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  getBadgeClass(value: string, colorMap?: { [key: string]: string }): string {
    if (!colorMap) {
      return 'bg-slate-600/20 text-slate-400';
    }
    return colorMap[value] || 'bg-slate-600/20 text-slate-400';
  }

  getProgressColor(value: number, colors?: { high: string; medium: string; low: string }): string {
    if (!colors) {
      colors = { high: 'bg-green-500', medium: 'bg-yellow-500', low: 'bg-red-500' };
    }
    if (value > 80) return colors.high;
    if (value > 50) return colors.medium;
    return colors.low;
  }
}