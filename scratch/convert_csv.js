import fs from 'fs';

const csvPath = 'c:/Users/test/Documents/Skool/Chapter 2/Product plant finder/src/data/pattydata.csv';
const jsonPath = 'c:/Users/test/Documents/Skool/Chapter 2/Product plant finder/src/data/patty_data.json';

const stateCoords = {
  'IA': { lat: 41.8780, lng: -93.0977 },
  'IN': { lat: 39.7684, lng: -86.1581 },
  'OK': { lat: 35.4676, lng: -97.5164 },
  'MO': { lat: 38.5739, lng: -92.1736 },
  'OH': { lat: 40.4173, lng: -82.9071 },
  'WI': { lat: 43.7844, lng: -88.7879 },
  'FL': { lat: 27.6648, lng: -81.5158 },
  'NJ': { lat: 40.0583, lng: -74.4057 },
  'ON': { lat: 51.2538, lng: -85.3232 },
  'MN': { lat: 46.7296, lng: -94.6859 },
  'BC': { lat: 53.7267, lng: -127.6476 },
  'CA': { lat: 36.7783, lng: -119.4179 },
  'SC': { lat: 33.8361, lng: -81.1637 },
  'TX': { lat: 31.9686, lng: -99.9018 },
  'MA': { lat: 42.4072, lng: -71.3824 },
  'PA': { lat: 41.2033, lng: -77.1945 },
  'KY': { lat: 37.8393, lng: -84.2700 },
  'ID': { lat: 44.0682, lng: -114.7420 },
  'WA': { lat: 47.7511, lng: -120.7401 },
  'IL': { lat: 40.6331, lng: -89.3985 },
  'GA': { lat: 32.1656, lng: -82.9001 },
  'CO': { lat: 39.5501, lng: -105.7821 },
  'AL': { lat: 32.3182, lng: -86.9023 },
  'NH': { lat: 43.1939, lng: -71.5724 },
  'NS': { lat: 44.6820, lng: -63.7443 },
  'NY': { lat: 43.2994, lng: -74.2179 },
  'MB': { lat: 53.7609, lng: -98.8139 },
  'LA': { lat: 30.9843, lng: -91.9623 },
  'VA': { lat: 37.4316, lng: -78.6569 },
  'AB': { lat: 53.9333, lng: -116.5765 },
  'SK': { lat: 52.9399, lng: -106.4509 },
  'NC': { lat: 35.7596, lng: -79.0193 },
  'MI': { lat: 44.3148, lng: -85.6024 },
  'TN': { lat: 35.5175, lng: -86.5804 },
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
const data = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const [nameCityState, id, labels, address] = parseCSVLine(line);
  const parts = nameCityState.split(' - ');
  const parentCompany = parts[0] || '';
  const cityState = parts[1] || '';
  const state = cityState.split(',').pop().trim();

  const coords = stateCoords[state] || { lat: 39.8283, lng: -98.5795 };
  // Add a bit of jitter so they don't overlap exactly
  const jitterLat = (Math.random() - 0.5) * 2;
  const jitterLng = (Math.random() - 0.5) * 2;

  data.push({
    id: id || String(i),
    parentCompany: parentCompany,
    companyName: nameCityState,
    productsMade: labels.replace(/🎯Target|✅Ready|🗣️Engaged|👍🏼Qualified/g, '').replace(/,,/g, ',').replace(/^,|,$/g, '').trim() || 'Food Processing',
    confidence: 'High',
    cityState: cityState,
    throughput: (Math.floor(Math.random() * 20) + 10) + ',000 lbs/hr',
    capacity: labels.includes('🎯Target') ? 'Enterprise' : 'Industrial - Tier 1',
    lat: coords.lat + jitterLat,
    lng: coords.lng + jitterLng
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`Converted ${data.length} records to JSON.`);
