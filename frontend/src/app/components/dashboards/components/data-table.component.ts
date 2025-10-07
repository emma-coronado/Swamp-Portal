import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'progress' | 'highlight';
  badgeColors?: { [key: string]: string };
  progressColors?: { high: string; medium: string; low: string };
  highlightColor?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 class="text-xl font-bold mb-4">{{ title }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700">
              <th 
                *ngFor="let column of columns" 
                class="text-left py-3 text-slate-400 font-medium"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data" class="border-b border-slate-700/50">
              <td *ngFor="let column of columns" class="py-3">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class DataTableComponent {
  @Input() title: string = 'Data Table';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

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