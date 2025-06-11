// Define the schema for the rent roll database

export interface RentRollEntry {
  id?: number; // Auto-generated primary key
  unit: string;
  name: string | null;
  type: string | null;
  sq_ft: number;
  autobill: number;
  deposit: number;
  moved_in: string | null;
  lease_ends: string | null;
  status: string;
}

// SQL statement to create the rent_roll table
export const CREATE_RENT_ROLL_TABLE = `
CREATE TABLE IF NOT EXISTS rent_roll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit TEXT NOT NULL,
  name TEXT,
  type TEXT,
  sq_ft INTEGER,
  autobill REAL NOT NULL,
  deposit REAL NOT NULL,
  moved_in TEXT,
  lease_ends TEXT,
  status TEXT NOT NULL,
  UNIQUE(unit)
);
`;

// SQL statement to create indexes for better query performance
export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_status ON rent_roll(status);
CREATE INDEX IF NOT EXISTS idx_lease_ends ON rent_roll(lease_ends);
`;

// SQL statement to insert a rent roll entry
export const INSERT_RENT_ROLL_ENTRY = `
INSERT INTO rent_roll (
  unit, 
  name, 
  type, 
  sq_ft, 
  autobill, 
  deposit, 
  moved_in, 
  lease_ends, 
  status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

// SQL statement to get all rent roll entries
export const GET_ALL_RENT_ROLL_ENTRIES = `
SELECT * FROM rent_roll;
`;

// SQL statement to get rent roll entries by status
export const GET_RENT_ROLL_BY_STATUS = `
SELECT * FROM rent_roll WHERE status = ?;
`;

// SQL statement to get summary statistics
export const GET_SUMMARY_STATISTICS = `
SELECT 
  COUNT(*) as total_units,
  SUM(CASE WHEN status = 'O' THEN 1 ELSE 0 END) as occupied_units,
  SUM(CASE WHEN status = 'VU' OR status = 'VD' THEN 1 ELSE 0 END) as vacant_units,
  SUM(autobill) as total_potential_rent,
  SUM(CASE WHEN status = 'O' THEN autobill ELSE 0 END) as total_actual_rent,
  AVG(CASE WHEN status = 'O' THEN autobill END) as avg_occupied_rent
FROM rent_roll;
`;
