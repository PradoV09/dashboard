import { Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Indicador } from '../../models/indicador.model';

@Component({
  selector: 'app-kpi-selector',
  standalone: true,
  imports: [FormsModule, SelectButtonModule],
  styleUrl: './kpi-selector.component.scss',
  template: `
    <div class="kpi-selector">
      <label class="block text-sm font-semibold mb-2">Indicador</label>
      <p-selectButton 
        [options]="indicadores()" 
        [(ngModel)]="selectedIndicadorId" 
        optionLabel="nombre" 
        optionValue="id"
        (onChange)="onSelectionChange()"
        [multiple]="false"
        class="w-full"
      />
    </div>
  `,
  styles: `
    .kpi-selector {
      padding: 0.5rem;
    }
  `,
})
export class KpiSelectorComponent {
  indicadores = input.required<Indicador[]>();
  selectedIndicadorId = model.required<string>();
  selectionChanged = output<string>();

  onSelectionChange(): void {
    this.selectionChanged.emit(this.selectedIndicadorId());
  }
}
