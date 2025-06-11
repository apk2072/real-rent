import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  CREATE_RENT_ROLL_TABLE, 
  CREATE_INDEXES,
  INSERT_RENT_ROLL_ENTRY,
  RentRollEntry
} from './schema';

export class RentRollDatabase {
  private db: Database;
  private static instance: RentRollDatabase;

  private constructor(dbPath: string) {
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to the SQLite database.');
        this.initialize();
      }
    });
  }

  public static getInstance(dbPath: string = path.resolve(__dirname, '../../data/rent_roll.db')): RentRollDatabase {
    if (!RentRollDatabase.instance) {
      RentRollDatabase.instance = new RentRollDatabase(dbPath);
    }
    return RentRollDatabase.instance;
  }

  private initialize(): void {
    // Wait for the database to be ready before creating tables
    setTimeout(() => {
      this.db.serialize(() => {
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
        
        // Create tables
        this.db.run(CREATE_RENT_ROLL_TABLE, (err) => {
          if (err) {
            console.error('Error creating table:', err);
          } else {
            console.log('Table created successfully');
            
            // Create indexes after table is created
            this.db.run(CREATE_INDEXES, (err) => {
              if (err) {
                console.error('Error creating indexes:', err);
              } else {
                console.log('Indexes created successfully');
              }
            });
          }
        });
      });
    }, 1000); // Add a small delay to ensure database is ready
  }

  public insertRentRollEntry(entry: RentRollEntry): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        INSERT_RENT_ROLL_ENTRY,
        [
          entry.unit,
          entry.name,
          entry.type,
          entry.sq_ft,
          entry.autobill,
          entry.deposit,
          entry.moved_in,
          entry.lease_ends,
          entry.status
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  public getAllRentRollEntries(): Promise<RentRollEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM rent_roll', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as RentRollEntry[]);
        }
      });
    });
  }

  public getRentRollByStatus(status: string): Promise<RentRollEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM rent_roll WHERE status = ?',
        [status],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as RentRollEntry[]);
          }
        }
      );
    });
  }

  public getSummaryStatistics(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(*) as total_units,
          SUM(CASE WHEN status = 'O' THEN 1 ELSE 0 END) as occupied_units,
          SUM(CASE WHEN status = 'VU' OR status = 'VD' THEN 1 ELSE 0 END) as vacant_units,
          SUM(autobill) as total_potential_rent,
          SUM(CASE WHEN status = 'O' THEN autobill ELSE 0 END) as total_actual_rent,
          AVG(CASE WHEN status = 'O' THEN autobill END) as avg_occupied_rent
        FROM rent_roll`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  public executeQuery(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed.');
          resolve();
        }
      });
    });
  }
}
