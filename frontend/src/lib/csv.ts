const escapeCsvValue = (value: string | number | null | undefined) => {
  const normalized = value == null ? '' : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
) => {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
};

export const parseCsv = (text: string) => {
  const sanitized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = sanitized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^"|"$/g, ''));

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line).map((value) => value.replace(/^"|"$/g, ''));

    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
};

export const normalizeCsvKey = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');

export const getCsvValue = (row: Record<string, string>, aliases: string[]) => {
  const entries = Object.entries(row).map(([key, value]) => [normalizeCsvKey(key), value] as const);

  for (const alias of aliases) {
    const match = entries.find(([key]) => key === normalizeCsvKey(alias));
    if (match?.[1]) {
      return match[1];
    }
  }

  return '';
};
