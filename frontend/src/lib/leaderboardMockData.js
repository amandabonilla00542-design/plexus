/**
 * Standalone demo data for /leaderboard — not wired to Mongo or desk APIs.
 */

/** @typedef {{ rank: number, name: string, region: string, countryCode: string, bookUsd: number, status: 'active' | 'vip' }} LeaderEntry */

const ENTRIES = [
  { name: 'Marcus Whitfield', region: 'United States', countryCode: 'US', bookUsd: 48_250_000, status: 'vip' },
  { name: 'Jonathan Price', region: 'United States', countryCode: 'US', bookUsd: 41_880_000, status: 'vip' },
  { name: 'James Harrington', region: 'United Kingdom', countryCode: 'GB', bookUsd: 36_420_000, status: 'vip' },
  { name: 'Omar Sheikh', region: 'Pakistan', countryCode: 'PK', bookUsd: 29_750_000, status: 'active' },
  { name: 'Elena Vogel', region: 'Germany', countryCode: 'DE', bookUsd: 27_100_000, status: 'active' },
  { name: 'Priya Nair', region: 'Singapore', countryCode: 'SG', bookUsd: 24_600_000, status: 'active' },
  { name: 'Daniel Mercer', region: 'United States', countryCode: 'US', bookUsd: 23_800_000, status: 'active' },
  { name: 'Wei Lin Tan', region: 'Singapore', countryCode: 'SG', bookUsd: 22_340_000, status: 'active' },
  { name: 'Charlotte Ashford', region: 'United Kingdom', countryCode: 'GB', bookUsd: 20_115_000, status: 'active' },
  { name: 'Luca Moretti', region: 'Italy', countryCode: 'IT', bookUsd: 18_920_000, status: 'active' },
  { name: 'Aisha Malik', region: 'Pakistan', countryCode: 'PK', bookUsd: 17_480_000, status: 'active' },
  { name: 'Henrik Lindström', region: 'Sweden', countryCode: 'SE', bookUsd: 16_200_000, status: 'active' },
  { name: 'Rachel Kim', region: 'United States', countryCode: 'US', bookUsd: 15_050_000, status: 'active' },
  { name: 'Arjun Mehta', region: 'Singapore', countryCode: 'SG', bookUsd: 14_280_000, status: 'active' },
  { name: 'Oliver Grant', region: 'United Kingdom', countryCode: 'GB', bookUsd: 13_640_000, status: 'active' },
  { name: 'Sofia Laurent', region: 'France', countryCode: 'FR', bookUsd: 12_900_000, status: 'active' },
  { name: 'Hassan Raza', region: 'Pakistan', countryCode: 'PK', bookUsd: 12_100_000, status: 'active' },
  { name: 'Noah Patterson', region: 'United States', countryCode: 'US', bookUsd: 11_420_000, status: 'active' },
  { name: 'Mei Ling Chow', region: 'Singapore', countryCode: 'SG', bookUsd: 10_850_000, status: 'active' },
  { name: 'Emily Cartwright', region: 'United Kingdom', countryCode: 'GB', bookUsd: 10_200_000, status: 'active' },
  { name: 'Jonas de Vries', region: 'Netherlands', countryCode: 'NL', bookUsd: 9_740_000, status: 'active' },
  { name: 'Camille Dubois', region: 'France', countryCode: 'FR', bookUsd: 9_280_000, status: 'active' },
  { name: 'Imran Qureshi', region: 'Pakistan', countryCode: 'PK', bookUsd: 8_850_000, status: 'active' },
  { name: 'Ethan Brooks', region: 'United States', countryCode: 'US', bookUsd: 8_420_000, status: 'active' },
  { name: 'Nadia Hoffmann', region: 'Switzerland', countryCode: 'CH', bookUsd: 8_050_000, status: 'active' },
  { name: 'Ryan O\'Connor', region: 'Ireland', countryCode: 'IE', bookUsd: 7_680_000, status: 'active' },
  { name: 'Zara Ahmed', region: 'United Kingdom', countryCode: 'GB', bookUsd: 7_320_000, status: 'active' },
  { name: 'Felix Brandt', region: 'Germany', countryCode: 'DE', bookUsd: 6_980_000, status: 'active' },
  { name: 'Jasmine Koh', region: 'Singapore', countryCode: 'SG', bookUsd: 6_640_000, status: 'active' },
  { name: 'Tyler Morrison', region: 'United States', countryCode: 'US', bookUsd: 6_310_000, status: 'active' },
  { name: 'Amélie Rousseau', region: 'France', countryCode: 'FR', bookUsd: 6_020_000, status: 'active' },
  { name: 'Bilal Hussain', region: 'Pakistan', countryCode: 'PK', bookUsd: 5_740_000, status: 'active' },
  { name: 'George Pembroke', region: 'United Kingdom', countryCode: 'GB', bookUsd: 5_480_000, status: 'active' },
  { name: 'Marco Ferreira', region: 'Portugal', countryCode: 'PT', bookUsd: 5_220_000, status: 'active' },
  { name: 'Chloe Andersen', region: 'Denmark', countryCode: 'DK', bookUsd: 4_980_000, status: 'active' },
  { name: 'David Park', region: 'United States', countryCode: 'US', bookUsd: 4_750_000, status: 'active' },
  { name: 'Siti Rahman', region: 'Singapore', countryCode: 'SG', bookUsd: 4_520_000, status: 'active' },
  { name: 'Thomas Wright', region: 'United Kingdom', countryCode: 'GB', bookUsd: 4_310_000, status: 'active' },
  { name: 'Ingrid Solberg', region: 'Norway', countryCode: 'NO', bookUsd: 4_100_000, status: 'active' },
  { name: 'Fatima Noor', region: 'Pakistan', countryCode: 'PK', bookUsd: 3_920_000, status: 'active' },
  { name: 'Michael Torres', region: 'United States', countryCode: 'US', bookUsd: 3_740_000, status: 'active' },
  { name: 'Anika Sharma', region: 'Singapore', countryCode: 'SG', bookUsd: 3_580_000, status: 'active' },
  { name: 'William Fraser', region: 'United Kingdom', countryCode: 'GB', bookUsd: 3_420_000, status: 'active' },
  { name: 'Pavel Novak', region: 'Czech Republic', countryCode: 'CZ', bookUsd: 3_280_000, status: 'active' },
  { name: 'Laura Bennett', region: 'United States', countryCode: 'US', bookUsd: 3_140_000, status: 'active' },
  { name: 'Yusuf Khan', region: 'Pakistan', countryCode: 'PK', bookUsd: 3_020_000, status: 'active' },
  { name: 'Isabelle Martin', region: 'Belgium', countryCode: 'BE', bookUsd: 2_880_000, status: 'active' },
  { name: 'Andrew Clarke', region: 'United Kingdom', countryCode: 'GB', bookUsd: 2_760_000, status: 'active' },
  { name: 'Kenji Watanabe', region: 'Singapore', countryCode: 'SG', bookUsd: 2_640_000, status: 'active' },
  { name: 'Sarah Mitchell', region: 'United States', countryCode: 'US', bookUsd: 2_520_000, status: 'active' },
  { name: 'Rohan Das', region: 'Pakistan', countryCode: 'PK', bookUsd: 2_410_000, status: 'active' },
  { name: 'Claire Dubois', region: 'France', countryCode: 'FR', bookUsd: 2_300_000, status: 'active' },
  { name: 'Peter Nilsson', region: 'Sweden', countryCode: 'SE', bookUsd: 2_190_000, status: 'active' },
  { name: 'Nina Kowalski', region: 'Poland', countryCode: 'PL', bookUsd: 2_080_000, status: 'active' },
  { name: 'Jason Reed', region: 'United States', countryCode: 'US', bookUsd: 1_980_000, status: 'active' },
  { name: 'Hamza Ali', region: 'Pakistan', countryCode: 'PK', bookUsd: 1_890_000, status: 'active' },
  { name: 'Victoria Hale', region: 'United Kingdom', countryCode: 'GB', bookUsd: 1_820_000, status: 'active' },
  { name: 'Liam O\'Brien', region: 'Ireland', countryCode: 'IE', bookUsd: 1_740_000, status: 'active' },
  { name: 'Grace Tan', region: 'Singapore', countryCode: 'SG', bookUsd: 1_660_000, status: 'active' },
  { name: 'Robert Hayes', region: 'United States', countryCode: 'US', bookUsd: 1_580_000, status: 'active' },
  { name: 'Elena Popescu', region: 'Romania', countryCode: 'RO', bookUsd: 1_510_000, status: 'active' },
  { name: 'Samuel Price', region: 'United Kingdom', countryCode: 'GB', bookUsd: 1_440_000, status: 'active' },
  { name: 'Adeel Farooq', region: 'Pakistan', countryCode: 'PK', bookUsd: 1_380_000, status: 'active' },
  { name: 'Christine Bauer', region: 'Austria', countryCode: 'AT', bookUsd: 1_320_000, status: 'active' },
  { name: 'Nicole Adams', region: 'United States', countryCode: 'US', bookUsd: 1_260_000, status: 'active' },
  { name: 'Harper Lee', region: 'Singapore', countryCode: 'SG', bookUsd: 1_210_000, status: 'active' },
  { name: 'Benjamin Cole', region: 'United Kingdom', countryCode: 'GB', bookUsd: 1_160_000, status: 'active' },
  { name: 'Mateo Silva', region: 'Spain', countryCode: 'ES', bookUsd: 1_110_000, status: 'active' },
  { name: 'Zainab Shah', region: 'Pakistan', countryCode: 'PK', bookUsd: 1_060_000, status: 'active' },
  { name: 'Jennifer Walsh', region: 'United States', countryCode: 'US', bookUsd: 1_020_000, status: 'active' },
  { name: 'Philip Grant', region: 'United Kingdom', countryCode: 'GB', bookUsd: 980_000, status: 'active' },
  { name: 'Anya Petrov', region: 'Germany', countryCode: 'DE', bookUsd: 940_000, status: 'active' },
  { name: 'Ravi Shankar', region: 'Singapore', countryCode: 'SG', bookUsd: 910_000, status: 'active' },
  { name: 'Usman Tariq', region: 'Pakistan', countryCode: 'PK', bookUsd: 850_000, status: 'active' },
]

/** @type {LeaderEntry[]} */
export const LEADERBOARD_TOP_50 = ENTRIES.slice(0, 50).map((e, i) => ({
  rank: i + 1,
  ...e,
}))

export function formatLeaderboardUsd(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export const LEADERBOARD_UPDATED_LABEL = 'Updated live · desk book totals (USD)'
