import { Component, input, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { Indicador } from '../../models/indicador.model';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [FormsModule, NgxEchartsModule, CardModule, SelectModule],
  template: `
    <p-card [style]="{'height': '100%'}">
      <ng-template pTemplate="title">
        <div class="card-header">
          <h3 class="font-display" style="margin: 0; font-size: 1.25rem;">Comparación por Año</h3>
          <p-select 
            [options]="availableYears()" 
            [(ngModel)]="selectedYear" 
            optionLabel="label" 
            optionValue="value"
            [style]="{'width': '120px'}"
            placeholder="Año"
          />
        </div>
      </ng-template>
      <ng-template pTemplate="content">
        <div [style]="{'height': '400px', 'width': '100%'}">
          <div echarts [options]="chartOptions()" theme="boletin" [attr.aria-label]="chartAriaLabel()" role="img" class="chart-container"></div>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: `
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .card-header h3 {
      margin: 0;
    }
    .chart-container {
      width: 100%;
      height: 100%;
    }
  `,
})
export class BarChartComponent {
  indicador = input.required<Indicador>();
  selectedCountries = input.required<string[]>();
  selectedYear = model<number | null>(null);

  // Auto-select latest year when indicator changes and no year is selected
  latestAvailableYear = computed(() => {
    const indicador = this.indicador();
    if (!indicador) return null;
    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => b - a);
    return years.length > 0 ? years[0] : null;
  });

  chartAriaLabel = computed(() => {
    const indicador = this.indicador();
    const year = this.selectedYear();
    if (!indicador) return 'Gráfico de barras';
    return `Comparación del indicador ${indicador.nombre} para el año ${year || 'seleccionado'}`;
  });

  availableYears = computed(() => {
    const indicador = this.indicador();
    if (!indicador) return [];

    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => b - a);
    return years.map((year) => ({ label: year.toString(), value: year }));
  });

  chartOptions = computed<EChartsOption>(() => {
    const indicador = this.indicador();
    const countries = this.selectedCountries();
    const year = this.selectedYear();

    if (!indicador || countries.length === 0 || !year) {
      return {};
    }

    const data = countries.map((coun ?? this.latestAvailableYear()try) => {
      const point = indicador.datos.find((d) => d.pais === country && d.anio === year);
      return {
        name: country,
        value: point?.valor ?? null,
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          const value = param.value;
          const formattedValue = value !== null ? value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
          // Add % for Desempleo, Inflación, and Inversión extranjera
          const indicadorNombre = indicador.nombre.toLowerCase();
          const suffix = (indicadorNombre.includes('desempleo') || 
                        indicadorNombre.includes('inflación') || 
                        indicadorNombre.includes('inversión')) && value !== null ? '%' : '';
          return `${param.name}: ${formattedValue}${suffix}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: countries,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: indicador.nombre,
        axisLabel: {
          formatter: (value: number) => {
            const formatted = value.toLocaleString('es-CO');
            const indicadorNombre = indicador.nombre.toLowerCase();
            const suffix = (indicadorNombre.includes('desempleo') || 
                          indicadorNombre.includes('inflación') || 
                          indicadorNombre.includes('inversión')) ? '%' : '';
            return formatted + suffix;
          },
        },
      },
      series: [
        {
          name: indicador.nombre,
          type: 'bar',
          data: data.map((d) => d.value),
        },
      ],
      responsive: true,
    };
  });
}
