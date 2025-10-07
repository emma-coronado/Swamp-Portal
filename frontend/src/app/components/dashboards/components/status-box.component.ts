import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <div 
          *ngIf="showIndicator"
          class="w-3 h-3 rounded-full"
          [ngClass]="{
            'bg-green-500 status-pulse': indicatorColor === 'green',
            'bg-yellow-500 status-pulse': indicatorColor === 'yellow',
            'bg-red-500 status-pulse': indicatorColor === 'red',
            'bg-blue-500 status-pulse': indicatorColor === 'blue',
            'bg-gray-500': indicatorColor === 'gray'
          }"
        ></div>
      </div>
      <div class="text-3xl font-bold mb-2">{{ mainValue }}</div>
      <p class="text-slate-400 text-sm">{{ subtitle }}</p>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .status-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class StatusBoxComponent {
  @Input() title: string = 'Status';
  @Input() mainValue: string = '0';
  @Input() subtitle: string = 'Description';
  @Input() showIndicator: boolean = true;
  @Input() indicatorColor: 'green' | 'yellow' | 'red' | 'blue' | 'gray' = 'green';
}