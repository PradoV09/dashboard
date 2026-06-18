import { Component, input, computed } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { CardModule } from 'primeng/card';
import { Indicador } from '../../models/indicador.model';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgxEchartsModule, CardModule],
  template: `
    <p-card [style]="{'height': '100%'}">
      <ng-template pTemplate="title">
        <h3 class="font-display" style="margin: 0; font-size: 1.25rem;">Evolución por Año</h3>
      </ng-template>
      <ng-template pTemplate="content">
        <div [style]="{'height': '400px', 'width': '100%'}">
          <div echarts [options]="chartOptions()" theme="boletin" [attr.aria-label]="chartAriaLabel()" role="img" class="chart-container"></div>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: `
    .chart-container {
      width: 100%;
      height: 100%;
    }
  `,
})
export class LineChartComponent {
  indicador = input.required<Indicador>();
  selectedCountries = input.required<string[]>();

  chartAriaLabel = computed(() => {
    const indicador = this.indicador();
    if (!indicador) return 'Gráfico de evolución temporal';
    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => a - b);
    const range = years.length > 0 ? `entre ${years[0]} y ${years[years.length - 1]}` : '';
    return `Evolución del indicador ${indicador.nombre} ${range}`;
  });

  chartOptions = computed<EChartsOption>(() => {
    const indicador = this.indicador();
    const countries = this.selectedCountries();

    if (!indicador || countries.length === 0) {
      return {};
    }

    const years = [...new Set(indicador.datos.map((d) => d.anio))].sort((a, b) => a - b);
    const series: any[] = [];

    for (const country of countries) {
      const countryData = indicador.datos.filter((d) => d.pais === country);
      const data = years.map((year) => {
        const point = countryData.find((d) => d.anio === year);
        return point?.valor ?? null;
      });

      series.push({
        name: country,
        type: 'line',
        data: data,
        connectNulls: false,
        smooth: true,
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `Año: ${params[0].axisValue}<br/>`;
          const indicadorNombre = indicador.nombre.toLowerCase();
          const showPercentage = indicadorNombre.includes('desempleo') || 
                                indicadorNombre.includes('inflación') || 
                                indicadorNombre.includes('inversión');
          for (const param of params) {
            const value = param.value;
            const formattedValue = value !== null ? value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
            const suffix = showPercentage && value !== null ? '%' : '';
            result += `${param.marker} ${param.seriesName}: ${formattedValue}${suffix}<br/>`;
          }
          return result;
        },
      },
      legend: {
        data: countries,
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: years,
        name: 'Año',
        nameLocation: 'middle',
        nameGap: 30,
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
      series,
      responsive: true,
    };
  });
}
