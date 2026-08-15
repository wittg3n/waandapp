import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dataDirectory = fileURLToPath(new URL('../src/data/iran/', import.meta.url));

function normalizePersianName(value) {
  return value
    .normalize('NFKC')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\s]+/g, ' ')
    .trim();
}

async function readDataset(filename) {
  const serialized = await readFile(`${dataDirectory}${filename}`, 'utf8');
  return JSON.parse(serialized);
}

function validateDataset({ entries, filename, idPrefix, categoryKey }) {
  const errors = [];
  const ids = new Set();
  const normalizedNames = new Set();

  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`${filename}: dataset must be a non-empty array.`);
    return errors;
  }

  for (const [index, entry] of entries.entries()) {
    const location = `${filename}[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${location}: entry must be an object.`);
      continue;
    }

    if (typeof entry.id !== 'string' || !entry.id.startsWith(idPrefix)) {
      errors.push(`${location}: id must start with "${idPrefix}".`);
    } else if (ids.has(entry.id)) {
      errors.push(`${location}: duplicate id "${entry.id}".`);
    } else {
      ids.add(entry.id);
    }

    if (typeof entry.nameFa !== 'string' || !entry.nameFa.trim()) {
      errors.push(`${location}: nameFa is required.`);
    } else {
      const normalizedName = normalizePersianName(entry.nameFa);
      if (entry.nameFa !== entry.nameFa.trim() || /[يكى]/.test(entry.nameFa)) {
        errors.push(`${location}: nameFa contains unnormalized characters or outer whitespace.`);
      }
      if (normalizedNames.has(normalizedName)) {
        errors.push(`${location}: duplicate normalized name "${normalizedName}".`);
      } else {
        normalizedNames.add(normalizedName);
      }
    }

    if (typeof entry[categoryKey] !== 'string' || !entry[categoryKey].trim()) {
      errors.push(`${location}: ${categoryKey} is required.`);
    }
  }

  return errors;
}

const fields = await readDataset('fields.json');
const universities = await readDataset('universities.json');
const errors = [
  ...validateDataset({
    entries: fields,
    filename: 'fields.json',
    idPrefix: 'ir-field-',
    categoryKey: 'group',
  }),
  ...validateDataset({
    entries: universities,
    filename: 'universities.json',
    idPrefix: 'ir-university-',
    categoryKey: 'institutionType',
  }),
];

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(
    `Iran data valid: ${universities.length} universities, ${fields.length} academic fields.`,
  );
}
