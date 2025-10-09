import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 h-40 flex flex-col">
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
      <div class="flex-1 flex flex-col justify-center">
        <div *ngIf="!isButton" class="text-3xl font-bold mb-2">{{ mainValue }}</div>
        <button 
          *ngIf="isButton"
          (click)="onButtonClick()"
          [disabled]="isDisabled"
          [class]="getButtonClasses()"
        >
          {{ mainValue }}
        </button>
      </div>
      <p *ngIf="!isButton" class="text-slate-400 text-sm mt-auto">{{ subtitle }}</p>
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
  @Input() isButton: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() buttonAction: string = '';
  @Output() buttonClicked = new EventEmitter<string>();

  onButtonClick() {
    if (this.isDisabled) return;
    
    const message = this.buttonAction || `${this.title} button clicked`;
    alert(message);
    this.buttonClicked.emit(this.buttonAction);
  }

  getButtonClasses(): string {
    const baseClasses = 'text-3xl font-bold px-6 py-3 rounded-lg transition-all duration-300 transform focus:outline-none';
    
    if (this.isDisabled) {
      return `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed opacity-50`;
    }
    
    return `${baseClasses} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:scale-95 cursor-pointer`;
  }
}