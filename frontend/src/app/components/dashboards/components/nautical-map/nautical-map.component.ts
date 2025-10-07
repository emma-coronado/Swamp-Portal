import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MapPoint {
  x: number;
  y: number;
  label?: string;
  type?: 'waypoint' | 'vessel' | 'hazard' | 'port';
}

@Component({
  selector: 'app-nautical-map',
  templateUrl: './nautical-map.component.html',
  styleUrls: ['./nautical-map.component.css'],
  imports: [CommonModule]
})
export class NauticalMapComponent implements OnInit, AfterViewInit {
  @Input() points: MapPoint[] = [];
  @Input() width: number = 600;
  @Input() height: number = 400;
  @Input() title: string = 'Navigation Chart';
  
  @ViewChild('mapCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private scale: { x: number; y: number } = { x: 1, y: 1 };
  public bounds: { minX: number; maxX: number; minY: number; maxY: number } = 
    { minX: 0, maxX: 100, minY: 0, maxY: 100 };

  ngOnInit() {
    this.calculateBounds();
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d')!;
    this.drawMap();
  }

  private calculateBounds() {
    if (this.points.length === 0) return;

    const xs = this.points.map(p => p.x);
    const ys = this.points.map(p => p.y);
    
    this.bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };

    // Add some padding
    const paddingX = (this.bounds.maxX - this.bounds.minX) * 0.1;
    const paddingY = (this.bounds.maxY - this.bounds.minY) * 0.1;
    
    this.bounds.minX -= paddingX;
    this.bounds.maxX += paddingX;
    this.bounds.minY -= paddingY;
    this.bounds.maxY += paddingY;

    this.scale = {
      x: this.width / (this.bounds.maxX - this.bounds.minX),
      y: this.height / (this.bounds.maxY - this.bounds.minY)
    };
  }

  private worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.bounds.minX) * this.scale.x,
      y: this.height - (y - this.bounds.minY) * this.scale.y // Flip Y axis
    };
  }

  private drawMap() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#0f172a'; // Dark blue background
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid
    this.drawGrid();
    
    // Draw compass rose
    this.drawCompass();

    // Draw points
    this.drawPoints();

    // Draw connections between points (if more than one point)
    if (this.points.length > 1) {
      this.drawConnections();
    }
  }

  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (this.width / 10) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (this.height / 10) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawCompass() {
    const compassSize = 40;
    const compassX = this.width - compassSize - 20;
    const compassY = compassSize + 20;

    // Compass circle
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(compassX, compassY, compassSize / 2, 0, Math.PI * 2);
    this.ctx.stroke();

    // North arrow
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(compassX, compassY - compassSize / 2 + 5);
    this.ctx.lineTo(compassX - 5, compassY - 5);
    this.ctx.lineTo(compassX + 5, compassY - 5);
    this.ctx.closePath();
    this.ctx.fill();

    // N label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', compassX, compassY - compassSize / 2 - 5);
  }

  private drawPoints() {
    this.points.forEach((point, index) => {
      const screenPos = this.worldToScreen(point.x, point.y);
      
      // Set color based on type
      let color = '#10b981'; // Default green
      let size = 6;
      
      switch (point.type) {
        case 'vessel':
          color = '#3b82f6';
          size = 8;
          break;
        case 'hazard':
          color = '#ef4444';
          size = 7;
          break;
        case 'port':
          color = '#f59e0b';
          size = 8;
          break;
        case 'waypoint':
        default:
          color = '#10b981';
          size = 6;
          break;
      }

      // Draw point
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw outline
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw label
      if (point.label) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(point.label, screenPos.x, screenPos.y - 15);
      } else {
        // Draw coordinate
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, screenPos.x, screenPos.y + 20);
      }
    });
  }

  private drawConnections() {
    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    const firstPoint = this.worldToScreen(this.points[0].x, this.points[0].y);
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < this.points.length; i++) {
      const point = this.worldToScreen(this.points[i].x, this.points[i].y);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset dash
  }

  getPointTypeColor(type?: string): string {
    switch (type) {
      case 'vessel': return '#3b82f6';
      case 'hazard': return '#ef4444';
      case 'port': return '#f59e0b';
      case 'waypoint':
      default: return '#10b981';
    }
  }
}