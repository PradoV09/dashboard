import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ExcelParserService } from './services/excel-parser.service';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { KpiSelectorComponent } from './components/kpi-selector/kpi-selector.component';
import { CountryFilterComponent } from './components/country-filter/country-filter.component';
import { KpiSummaryCardsComponent } from './components/kpi-summary-cards/kpi-summary-cards.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { DataTableComponent } from './components/data-table/data-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    FileUploadComponent,
    KpiSelectorComponent,
    CountryFilterComponent,
    KpiSummaryCardsComponent,
    LineChartComponent,
    BarChartComponent,
    DataTableComponent,
  ],
  styleUrl: './dashboard.component.scss',
  template: `
    <div class="dashboard-layout">
      <header class="dashboard-ink-bar">
        <div class="ink-bar-content">
          <h1 class="font-display">Dashboard de Indicadores Económicos</h1>
          @if (metadata()) {
            <div class="metadata">
              <span class="tabular-nums">
                {{ metadata()?.fileName }} &nbsp;|&nbsp; 
                {{ formatDate(metadata()?.uploadedAt) }}
              </span>
            </div>
          }
        </div>
      </header>

      <div class="dashboard-container">
        @if (!hasData()) {
          <div class="upload-section">
            <p-card styleClass="panel-card">
              <ng-template pTemplate="title">
                <h2 class="font-display">Cargar Archivo de Datos</h2>
              </ng-template>
              <ng-template pTemplate="content">
                <p class="mb-4">
                  Sube un archivo Excel (.xlsx) para comenzar. Cada hoja del archivo se trata como un indicador distinto, con la primera columna como "país" y el resto por año.
                </p>
                @if (loading()) {
                  <div class="loading-container">
                    <p-progressSpinner strokeWidth="4" [style]="{'width': '50px', 'height': '50px'}" />
                    <p>Procesando archivo...</p>
                  </div>
                } @else {
                  <app-file-upload
                    (fileSelected)="onFileSelected($event)"
                  />
                }
                @if (error()) {
                  <p-message severity="error" [text]="error()!" class="mt-3" />
                }
              </ng-template>
            </p-card>
          </div>
        } @else {
          <div class="dashboard-content">
            <div class="filters-section">
              <div class="filters-grid">
                <app-kpi-selector
                  [indicadores]="indicadores()"
                  [(selectedIndicadorId)]="selectedIndicadorId"
                />
                <app-country-filter
                  [countries]="allCountries()"
                  [(selectedCountries)]="selectedCountries"
                  (selectionChanged)="onCountrySelectionChange($event)"
                />
              </div>
              <div class="action-buttons">
                <p-button 
                  label="Subir archivo" 
                  icon="pi pi-upload" 
                  (onClick)="onReplaceRequested()" 
                  [outlined]="true"
                  size="small"
                />
                <p-button 
                  label="Quitar datos guardados" 
                  icon="pi pi-trash" 
                  (onClick)="onClearRequested()" 
                  severity="danger" 
                  [outlined]="true"
                  size="small"
                />
              </div>
            </div>

            <div class="summary-section">
              <app-kpi-summary-cards
                [indicador]="currentIndicador()"
                [selectedCountries]="selectedCountries()"
              />
            </div>

            <div class="charts-section">
              <div class="chart-row-full">
                <app-line-chart
                  [indicador]="currentIndicador()"
                  [selectedCountries]="selectedCountries()"
                />
              </div>
              <div class="chart-row-split">
                <div class="chart-col">
                  <app-bar-chart
                    [indicador]="currentIndicador()"
                    [selectedCountries]="selectedCountries()"
                    [(selectedYear)]="selectedBarChartYear"
                  />
                </div>
                <div class="chart-col table-col">
                  <app-data-table
                    [indicador]="currentIndicador()"
                    [selectedCountries]="selectedCountries()"
                  />
                </div>
              </div>
            </div>
          </div>
        }

        @if (showUploadDialog()) {
          <div class="upload-dialog">
            <p-card styleClass="panel-card">
              <ng-template pTemplate="title">
                <h2 class="font-display">Reemplazar Archivo</h2>
              </ng-template>
              <ng-template pTemplate="content">
                <p class="mb-4">
                  Selecciona un nuevo archivo Excel para reemplazar los datos actuales.
                </p>
                @if (loading()) {
                  <div class="loading-container">
                    <p-progressSpinner strokeWidth="4" [style]="{'width': '50px', 'height': '50px'}" />
                    <p>Procesando archivo...</p>
                  </div>
                } @else {
                  <app-file-upload
                    (fileSelected)="onFileSelected($event)"
                  />
                }
                @if (error()) {
                  <p-message severity="error" [text]="error()!" class="mt-3" />
                }
                <div class="dialog-actions">
                  <p-button 
                    label="Cancelar" 
                    (onClick)="onCancelUpload()" 
                    [outlined]="true"
                  />
                </div>
              </ng-template>
            </p-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .dashboard-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .dashboard-ink-bar {
      background-color: var(--ink-900);
      color: var(--paper-50);
      padding: 1.5rem 2rem;
    }

    .ink-bar-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-ink-bar h1 {
      margin: 0 0 0.5rem 0;
      color: var(--paper-50);
      font-size: 1.75rem;
    }

    .metadata {
      color: var(--slate-400);
      font-size: 0.875rem;
    }

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
      flex: 1;
    }

    /* Panel Card overrides for primeNG to look editorial */
    ::ng-deep .panel-card {
      border: 1px solid rgba(91, 107, 121, 0.2); /* slate-400 */
      border-radius: 4px;
      box-shadow: none !important;
      background-color: #fff;
    }

    .upload-section {
      max-width: 600px;
      margin: 2rem auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(91, 107, 121, 0.2);
    }

    .filters-grid {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .charts-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .chart-row-full {
      width: 100%;
    }

    .chart-row-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .chart-col {
      min-height: 400px;
    }

    .table-col {
      overflow-x: auto;
    }

    @media (max-width: 992px) {
      .chart-row-split {
        grid-template-columns: 1fr;
      }
    }

    .upload-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(16, 36, 62, 0.6); /* ink-900 */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .upload-dialog p-card {
      max-width: 600px;
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `,
})
export class DashboardComponent implements OnInit {
  private excelParserService = inject(ExcelParserService);

  indicadores = this.excelParserService.indicadores;
  metadata = this.excelParserService.metadata;
  loading = this.excelParserService.loading;
  error = this.excelParserService.error;
  hasData = this.excelParserService.hasData;

  selectedIndicadorId = signal<string>('');
  selectedCountries = signal<string[]>([]);
  selectedBarChartYear = signal<number | null>(null);
  showUploadDialog = signal(false);

  allCountries = computed(() => this.excelParserService.getAllCountries());

  currentIndicador = computed(() => {
    const id = this.selectedIndicadorId();
    const indicador = this.excelParserService.getIndicadorById(id);
    return indicador ?? { id: '', nombre: '', datos: [] };
  });

  ngOnInit(): void {
    // Clean up any existing data with duplicate country names
    if (this.hasData()) {
      this.excelParserService.cleanupDuplicateCountries();
    }

    if (this.hasData() && this.indicadores().length > 0) {
      this.selectedIndicadorId.set(this.indicadores()[0].id);
      this.selectedCountries.set(this.allCountries());
    }
  }

  async onFileSelected(file: File): Promise<void> {
    try {
      await this.excelParserService.parseFile(file);
      this.showUploadDialog.set(false);

      if (this.indicadores().length > 0) {
        this.selectedIndicadorId.set(this.indicadores()[0].id);
        this.selectedCountries.set(this.allCountries());
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // Error is already handled by the service's error signal
    }
  }

  onReplaceRequested(): void {
    this.showUploadDialog.set(true);
  }

  onCancelUpload(): void {
    this.showUploadDialog.set(false);
  }

  onClearRequested(): void {
    this.excelParserService.clearData();
    this.selectedIndicadorId.set('');
    this.selectedCountries.set([]);
    this.selectedBarChartYear.set(null);
    this.showUploadDialog.set(false);
  }

  onIndicadorChange(indicadorId: string): void {
    // Additional logic if needed when countries change
  }

  formatDate(isoDate: string | undefined): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
