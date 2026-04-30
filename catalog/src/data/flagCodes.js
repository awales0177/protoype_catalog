import countryList from '../icons/flag-icons-main/country.json';

const nameToAlpha2 = {};
countryList.forEach((c) => {
  if (c.name && c.code) {
    const key = c.name.toLowerCase().trim();
    nameToAlpha2[key] = c.code.toLowerCase();
  }
});

const aliasMap = {
  'w. sahara': 'eh',
  'dem. rep. congo': 'cd',
  'congo': 'cg',
  "côte d'ivoire": 'ci',
  'ivory coast': 'ci',
  'republic of the congo': 'cg',
  'democratic republic of the congo': 'cd',
};

export function getAlpha2(countryName) {
  if (!countryName) return null;
  const key = String(countryName).toLowerCase().trim();
  return aliasMap[key] || nameToAlpha2[key] || null;
}
