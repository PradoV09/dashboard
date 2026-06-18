import * as echarts from 'echarts/core';

export const boletinEchartsTheme = {
  color: [
    '#10243E', // ink-900
    '#2E6F6B', // signal-positive
    '#B23A2F', // signal-negative
    '#C9A227', // accent-gold
    '#5B6B79', // slate-400
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, sans-serif',
    color: '#5B6B79'
  },
  title: {
    textStyle: {
      color: '#10243E'
    }
  },
  line: {
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    itemStyle: {
      borderWidth: 2
    },
    lineStyle: {
      width: 2
    }
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#ccc'
    }
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#5B6B79'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: true,
      color: '#5B6B79'
    },
    splitLine: {
      show: false
    }
  },
  valueAxis: {
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: true,
      color: '#5B6B79',
      fontFamily: 'IBM Plex Mono, monospace'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['rgba(91, 107, 121, 0.15)'] // slate-400 at low opacity
      }
    }
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#5B6B79',
        width: 1
      },
      crossStyle: {
        color: '#5B6B79',
        width: 1
      }
    }
  }
};

echarts.registerTheme('boletin', boletinEchartsTheme);
