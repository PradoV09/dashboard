import { Component, input, output, model, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Indicador } from '../../models/indicador.model';

@Component({
  selector: 'app-country-filter',
  standalone: true,
  imports: [FormsModule, MultiSelectModule],
  styleUrl: './country-filter.component.scss',
  template: `
    <div class="country-filter">
      <label class="block text-sm font-semibold mb-2">Países</label>
      <p-multiSelect 
        [options]="availableCountries()" 
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
  indicador = input<Indicador | null>(null);
  selectedCountries = model.required<string[]>();
  selectionChanged = output<string[]>();

  availableCountries = computed(() => {
    const indicador = this.indicador();
    const allCountries = this.countries();

    if (!indicador || allCountries.length === 0) {
      return allCountries;
    }

    // Filter countries that have data for the selected indicator
    const countriesWithData = new Set<string>();
    for (const dato of indicador.datos) {
      if (dato.valor !== null && dato.valor !== undefined) {
        countriesWithData.add(dato.pais);
      }
    }

    return allCountries.filter(country => countriesWithData.has(country));
  });

  onSelectionChange(): void {
    this.selectionChanged.emit(this.selectedCountries());
  }
}
