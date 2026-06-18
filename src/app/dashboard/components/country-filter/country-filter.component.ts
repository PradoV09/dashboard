import { Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-country-filter',
  standalone: true,
  imports: [FormsModule, MultiSelectModule],
  styleUrl: './country-filter.component.scss',
  template: `
    <div class="country-filter">
      <label class="block text-sm font-semibold mb-2">Países</label>
      <p-multiSelect 
        [options]="countries()" 
        [(ngModel)]="selectedCountries" 
        [showToggleAll]="true"
        [maxSelectedLabels]="3"
        [selectedItemsLabel]="'{0} países seleccionados'"
        placeholder="Seleccionar países"
        (onChange)="onSelectionChange()"
        class="w-full"
      />
    </div>
  `,
  styles: `
    .country-filter {
      padding: 0.5rem;
    }
  `,
})
export class CountryFilterComponent {
  countries = input.required<string[]>();
  selectedCountries = model.required<string[]>();
  selectionChanged = output<string[]>();

  onSelectionChange(): void {
    this.selectionChanged.emit(this.selectedCountries());
  }
}
