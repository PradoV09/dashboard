import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import './dashboard/echarts-theme';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const boletinPreset = definePreset(Aura, {
  semantic: {
      primary: {
          50: '#f5f7fa',
          100: '#e9eef5',
          200: '#cfdce8',
          300: '#a6c1d7',
          400: '#76a0c0',
          500: '#5482a6',
          600: '#42698c',
          700: '#365472',
          800: '#2f475f',
          900: '#10243E', // --ink-900
          950: '#1b2635'
      },
      colorScheme: {
          light: {
              surface: {
                  0: '#ffffff',
                  50: '#FAFAF7', // paper-50
                  100: '#f4f4f5',
                  200: '#e4e4e7',
                  300: '#d4d4d8',
                  400: '#5B6B79', // slate-400
                  500: '#71717a',
                  600: '#52525b',
                  700: '#3f3f46',
                  800: '#27272a',
                  900: '#10243E', // ink-900
                  950: '#09090b'
              }
          }
      }
  }
});

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideEchartsCore({ echarts }),
    providePrimeNG({
        theme: {
            preset: boletinPreset,
            options: {
                darkModeSelector: '.fake-dark-mode-to-disable', // Disable dark mode
            }
        }
    })
  ]
};
