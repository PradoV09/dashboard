import { Injectable } from '@angular/core';
import { DashboardStorage } from '../models/indicador.model';

const STORAGE_KEY = 'dashboard_indicadores_data';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  save(data: DashboardStorage): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('No se pudo guardar los datos en el almacenamiento local');
    }
  }

  load(): DashboardStorage | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        return null;
      }
      const data = JSON.parse(json) as DashboardStorage;
      return data;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.clear();
      return null;
    }
  }

  clear(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  hasData(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}
