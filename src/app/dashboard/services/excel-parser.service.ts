import { Injectable, signal, computed } from '@angular/core';
import * as XLSX from 'xlsx';
import { Indicador, DataPoint, DashboardStorage } from '../models/indicador.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelParserService {
  private indicadoresSignal = signal<Indicador[]>([]);
  private metadataSignal = signal<{ fileName: string; uploadedAt: string } | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  indicadores = this.indicadoresSignal.asReadonly();
  metadata = this.metadataSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  hasData = computed(() => this.indicadoresSignal().length > 0);

  constructor(private storageService: StorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = this.storageService.load();
    if (stored) {
      this.indicadoresSignal.set(stored.indicadores);
      this.metadataSignal.set({
        fileName: stored.fileName,
        uploadedAt: stored.uploadedAt,
      });
    }
  }

  async parseFile(file: File): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const indicadores: Indicador[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) continue;

        const indicador = this.parseSheet(sheetName, jsonData);
        if (indicador) {
          indicadores.push(indicador);
        }
      }

      if (indicadores.length === 0) {
        throw new Error('No se encontraron indicadores válidos en el archivo');
      }

      this.indicadoresSignal.set(indicadores);
      this.metadataSignal.set({
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      });

      const storageData: DashboardStorage = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        indicadores,
      };

      this.storageService.save(storageData);
    } catch (error) {
      console.error('Error parsing file:', error);
      this.errorSignal.set(error instanceof Error ? error.message : 'Error al procesar el archivo');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private parseSheet(sheetName: string, data: any[][]): Indicador | null {
    if (data.length < 2) return null;

    const headers = data[0];
    const paisColumnIndex = this.findPaisColumn(headers);

    if (paisColumnIndex === -1) {
      console.warn(`No se encontró columna de país en hoja "${sheetName}"`);
      return null;
    }

    const yearColumns = headers
      .map((h, i) => ({ header: h, index: i }))
      .filter((col) => col.index !== paisColumnIndex && this.isYearColumn(col.header));

    if (yearColumns.length === 0) {
      console.warn(`No se encontraron columnas de año en hoja "${sheetName}"`);
      return null;
    }

    const datos: DataPoint[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const pais = row[paisColumnIndex];

      if (!pais || typeof pais !== 'string') continue;

      // Normalize country name: trim, remove extra spaces, and normalize case
      const normalizedPais = pais.trim().replace(/\s+/g, ' ');
      // Capitalize first letter, rest lowercase
      const titleCasePais = normalizedPais.charAt(0).toUpperCase() + normalizedPais.slice(1).toLowerCase();

      for (const yearCol of yearColumns) {
        const year = this.parseYear(yearCol.header);
        const value = this.parseValue(row[yearCol.index]);

        datos.push({
          pais: titleCasePais,
          anio: year!,
          valor: value,
        });
      }
    }

    if (datos.length === 0) return null;

    // Remove duplicate data points (same country and year)
    const uniqueDatos = new Map<string, DataPoint>();
    for (const dato of datos) {
      const key = `${dato.pais}-${dato.anio}`;
      uniqueDatos.set(key, dato);
    }

    return {
      id: sheetName,
      nombre: this.getDisplayLabel(sheetName),
      datos: Array.from(uniqueDatos.values()),
    };
  }

  private findPaisColumn(headers: any[]): number {
    const paisVariants = ['país', 'pais', 'paises', 'Paises', 'PAÍS', 'PAIS', 'PAISES'];
    
    for (let i = 0; i < headers.length; i++) {
      const header = String(headers[i]).toLowerCase().trim();
      if (paisVariants.includes(header)) {
        return i;
      }
    }
    return -1;
  }

  private isYearColumn(header: any): boolean {
    const year = this.parseYear(header);
    return year !== null && year >= 1900 && year <= 2100;
  }

  private parseYear(header: any): number | null {
    if (typeof header === 'number') {
      return header >= 1900 && header <= 2100 ? header : null;
    }
    
    const str = String(header).trim();
    const year = parseInt(str, 10);
    return !isNaN(year) && year >= 1900 && year <= 2100 ? year : null;
  }

  private parseValue(value: any): number | null {
    if (value === null || value === undefined) return null;
    
    const str = String(value).trim().toUpperCase();
    
    if (str === 'N/D' || str === 'ND' || str === '-' || str === '') {
      return null;
    }

    // Replace comma with point for decimal separator
    const normalized = str.replace(',', '.');
    const num = parseFloat(normalized);
    
    return !isNaN(num) ? num : null;
  }

  private getDisplayLabel(sheetName: string): string {
    // Configurable mapping for sheet names to display labels
    const labelMap: Record<string, string> = {
      // Add mappings as needed
      // 'Sheet1': 'PIB per Cápita',
      // 'Sheet2': 'Inflación',
    };

    return labelMap[sheetName] || sheetName;
  }

  clearData(): void {
    this.indicadoresSignal.set([]);
    this.metadataSignal.set(null);
    this.errorSignal.set(null);
    this.storageService.clear();
  }

  // Method to clean up existing data with duplicate country names
  cleanupDuplicateCountries(): void {
    const cleanedIndicadores = this.indicadoresSignal().map(indicador => {
      // Normalize all country names in the data
      const cleanedDatos = indicador.datos.map(dato => {
        const normalized = dato.pais.trim().replace(/\s+/g, ' ');
        const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        return {
          ...dato,
          pais: titleCase
        };
      });

      // Remove duplicates (same country and year)
      const uniqueDatos = new Map<string, DataPoint>();
      for (const dato of cleanedDatos) {
        const key = `${dato.pais}-${dato.anio}`;
        uniqueDatos.set(key, dato);
      }

      return {
        ...indicador,
        datos: Array.from(uniqueDatos.values())
      };
    });

    this.indicadoresSignal.set(cleanedIndicadores);

    // Update storage with cleaned data
    const metadata = this.metadataSignal();
    if (metadata) {
      const storageData: DashboardStorage = {
        fileName: metadata.fileName,
        uploadedAt: metadata.uploadedAt,
        indicadores: cleanedIndicadores,
      };
      this.storageService.save(storageData);
    }
  }

  getIndicadorById(id: string): Indicador | undefined {
    return this.indicadoresSignal().find((ind) => ind.id === id);
  }

  getAllCountries(): string[] {
    const countries = new Set<string>();
    for (const indicador of this.indicadoresSignal()) {
      for (const dato of indicador.datos) {
        // Normalize country name to prevent duplicates
        const normalized = dato.pais.trim().replace(/\s+/g, ' ');
        const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        countries.add(titleCase);
      }
    }
    return Array.from(countries).sort();
  }

  getYearsForIndicador(indicadorId: string): number[] {
    const indicador = this.getIndicadorById(indicadorId);
    if (!indicador) return [];
    
    const years = new Set(indicador.datos.map((d) => d.anio));
    return Array.from(years).sort((a, b) => a - b);
  }
}
