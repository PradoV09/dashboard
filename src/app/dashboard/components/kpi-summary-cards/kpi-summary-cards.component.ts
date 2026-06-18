import { Component, input, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Indicador, DataPoint } from '../../models/indicador.model';

interface CountrySummary {
  pais: string;
  latestValue: number | null;
  previousValue: number | null;
  variation: number | null;
  latestYear: number;
  sparklineOptions: EChartsOption;
}

@Component({
  selector: 'app-kpi-summary-cards',
  standalone: true,
  imports: [CardModule, NgxEchartsModule],
  template: `
    <div class="summary-cards">
      @for (summary of summaries(); track summary.pais) {
        <p-card styleClass="panel-card kpi-card">
          <ng-template pTemplate="title">
            <h3 class="font-display kpi-title">{{ summary.pais }}</h3>
          </ng-template>
          <ng-template pTemplate="subtitle">
            <span class="kpi-subtitle">Último año: {{ summary.latestYear }}</span>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="kpi-content">
              <div class="value-display tabular-nums">
                @if (summary.latestValue !== null) {
                  <span class="value">{{ formatValue(summary.latestValue) }}</span>
                  @if (summary.variation !== null) {
                    <span [class]="variationClass(summary.variation)">
                      {{ variationArrow(summary.variation) }} {{ formatVariation(summary.variation) }}
                    </span>
                  }
                } @else {
                  <span class="no-data">—</span>
                }
              </div>
              <div class="sparkline-container" aria-hidden="true">
                <div echarts [options]="summary.sparklineOptions" theme="boletin" class="sparkline"></div>
              </div>
            </div>
          </ng-template>
        </p-card>
      }
    </div>
  `,
  styles: `
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    ::ng-deep .kpi-card .p-card-body {
      padding: 1.25rem !important;
    }
    .kpi-title {
      font-size: 1.125rem;
      margin: 0;
      color: var(--ink-900);
    }
    .kpi-subtitle {
      font-size: 0.875rem;
      color: var(--slate-400);
    }
    .kpi-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 1rem;
    }
    .value-display {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .value {
      font-size: 1.75rem;
      font-weight: 500;
      line-height: 1;
      color: var(--ink-900);
    }
    .no-data {
      font-size: 1.75rem;
      color: var(--slate-400);
    }
    .positive {
      color: var(--signal-positive);
      font-size: 0.875rem;
      font-weight: 500;
    }
    .negative {
      color: var(--signal-negative);
      font-size: 0.875rem;
      font-weight: 500;
    }
    .neutral {
      color: var(--slate-400);
      font-size: 0.875rem;
    }
    .sparkline-container {
      width: 120px;
      height: 60px;
    }
    .sparkline {
      width: 100%;
      height: 100%;
    }
  `,
})
export class KpiSummaryCardsComponent {
  indicador = input.required<Indicador>();
  selectedCountries = input.required<string[]>();

  summaries = computed(() => {
    const indicador = this.indicador();
    const countries = this.selectedCountries();
    
    if (!indicador || countries.length === 0) return [];

    const countryData = new Map<string, DataPoint[]>();
    
    for (const dato of indicador.datos) {
      if (countries.includes(dato.pais)) {
        if (!countryData.has(dato.pais)) {
          countryData.set(dato.pais, []);
        }
        countryData.get(dato.pais)!.push(dato);
      }
    }

    const summaries: CountrySummary[] = [];

    for (const [pais, datos] of countryData) {
      const sortedDatos = [...datos].sort((a, b) => b.anio - a.anio); // Descending for latest
      const chronological = [...datos].sort((a, b) => a.anio - b.anio); // Ascending for sparkline
      
      const latest = sortedDatos[0];
      const previous = sortedDatos[1];

      let variation: number | null = null;
      if (latest && previous && latest.valor !== null && previous.valor !== null && previous.valor !== 0) {
        variation = ((latest.valor - previous.valor) / Math.abs(previous.valor)) * 100;
      }

      const sparklineData = chronological.map(d => d.valor ?? null);
      const sparklineColor = variation !== null 
        ? (variation > 0 ? '#2E6F6B' : (variation < 0 ? '#B23A2F' : '#5B6B79'))
        : '#5B6B79';

      const sparklineOptions: EChartsOption = {
        grid: { left: 0, right: 0, top: 5, bottom: 5 },
        xAxis: { type: 'category', show: false, data: chronological.map(d => d.anio) },
        yAxis: { type: 'value', show: false, scale: true },
        series: [{
          type: 'line',
          data: sparklineData,
          showSymbol: false,
          smooth: true,
          itemStyle: { color: sparklineColor },
          lineStyle: { width: 2, color: sparklineColor },
          connectNulls: true
        }],
        tooltip: { show: false },
        animationDuration: 600
      };

      summaries.push({
        pais,
        latestValue: latest?.valor ?? null,
        previousValue: previous?.valor ?? null,
        variation,
        latestYear: latest?.anio ?? 0,
        sparklineOptions
      });
    }

    return summaries.sort((a, b) => a.pais.localeCompare(b.pais));
  });

  formatValue(value: number): string {
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

  formatVariation(variation: number): string {
    return `${Math.abs(variation).toFixed(2)}%`;
  }

  variationArrow(variation: number): string {
    if (variation > 0) return '↑';
    if (variation < 0) return '↓';
    return '—';
  }

  variationClass(variation: number): string {
    if (variation > 0) return 'positive';
    if (variation < 0) return 'negative';
    return 'neutral';
  }
}
