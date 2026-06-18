import { Component, input, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { Indicador } from '../../models/indicador.model';

interface TableRow {
  pais: string;
  [key: string]: string | number | null;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [TableModule, CardModule],
  template: `
    <p-card [style]="{'height': '100%'}">
      <ng-template pTemplate="title">
        <h3 class="font-display" style="margin: 0; font-size: 1.25rem;">{{ indicador().nombre }}</h3>
      </ng-template>
      <ng-template pTemplate="content">
        <p-table
          [value]="tableData()"
          [columns]="columns()"
          [scrollable]="true"
          scrollHeight="400px"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [exportFilename]="indicador().nombre + '.csv'"
          csvSeparator=";"
        >
          <ng-template pTemplate="header" let-columns>
            <tr>
              @for (col of columns; track col.field) {
                <th [pSortableColumn]="col.field">
                  {{ col.header }}
                  <p-sortIcon [field]="col.field" />
                </th>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              @for (col of columns; track col.field) {
                <td [class]="col.field === 'pais' ? '' : 'tabular-nums'">
                  @if (rowData[col.field] === null) {
                    —
                  } @else {
                    {{ formatValue(rowData[col.field]) }}
                  }
                </td>
              }
            </tr>
          </ng-template>
        </p-table>
      </ng-template>
    </p-card>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class DataTableComponent {
  indicador = input.required<Indicador>();
  selectedCountries = input.required<string[]>();

  columns = computed(() => {
    const indicador = this.indicador();
    if (!indicador) return [];

    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => a - b);
    
    const cols = [
      { field: 'pais', header: 'País' },
      ...years.map((year) => ({ field: year.toString(), header: year.toString() })),
    ];

    return cols;
  });

  tableData = computed(() => {
    const indicador = this.indicador();
    const countries = this.selectedCountries();

    if (!indicador || countries.length === 0) return [];

    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => a - b);
    const data: TableRow[] = [];

    for (const country of countries) {
      const row: TableRow = { pais: country };
      
      for (const year of years) {
        const point = indicador.datos.find((d) => d.pais === country && d.anio === year);
        row[year.toString()] = point?.valor ?? null;
      }
      
      data.push(row);
    }

    return data.sort((a, b) => a.pais.localeCompare(b.pais));
  });

  formatValue(value: number | string | null): string {
    if (value === null) return '—';
    if (typeof value === 'number') {
      const formatted = value.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      // Add % for Desempleo, Inflación, and Inversión extranjera
      const indicadorNombre = this.indicador().nombre.toLowerCase();
      if (indicadorNombre.includes('desempleo') || 
          indicadorNombre.includes('inflación') || 
          indicadorNombre.includes('inversión')) {
        return formatted + '%';
      }
      return formatted;
    }
    return String(value);
  }
}
