// Minimal CSV serializer - good enough for a numbers-and-short-strings
// export like campaign metrics; not a general-purpose CSV library.
function escapeCsvField(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// `columns` is an array of { key, label }. `rows` is an array of objects.
export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c.key])).join(","));
  return [header, ...lines].join("\n");
}

export default { toCSV };
