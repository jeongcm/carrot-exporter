import { each } from 'lodash';

const getSelectorLabels = (labels: any) => {
  const labelChunk: string[] = [];

  each(labels, (value, key) => {
    if (typeof value === 'undefined') {
      return;
    }

    let equation = '=';
    let valueStr = '';
    if (Array.isArray(value)) {
      if (value.length > 1) {
        equation = '=~';
        valueStr = value.join('|');
      } else if (value.length === 1) {
        equation = '=';
        valueStr = value[0];
      }
    } else {
      valueStr = value;
    }
    labelChunk.push(`${key}${equation}"${valueStr}"`);
  });

  const labelString = labelChunk.join(',');

  return labelString;
};

export default getSelectorLabels;
