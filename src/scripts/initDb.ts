import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { RentRollDatabase } from '../db/database';
import { RentRollEntry } from '../db/schema';

// Path to the JSONL file
const jsonlFilePath = path.resolve(__dirname, '../../data/processed/rent-roll.jsonl');

// Initialize the database
const db = RentRollDatabase.getInstance();

async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Check if the JSONL file exists
    if (!fs.existsSync(jsonlFilePath)) {
      console.error(`JSONL file not found at ${jsonlFilePath}`);
      console.error('Please run the csvToJsonl script first.');
      process.exit(1);
    }

    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a read stream for the JSONL file
    const fileStream = fs.createReadStream(jsonlFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let count = 0;

    // Process each line in the JSONL file
    for await (const line of rl) {
      try {
        const entry = JSON.parse(line) as RentRollEntry;
        await db.insertRentRollEntry(entry);
        count++;
      } catch (error) {
        console.error('Error inserting entry:', error);
      }
    }

    console.log(`Database initialized with ${count} entries.`);

    // Get and display summary statistics
    try {
      const stats = await db.getSummaryStatistics();
      console.log('\nSummary Statistics:');
      console.log(`Total Units: ${stats.total_units}`);
      console.log(`Occupied Units: ${stats.occupied_units}`);
      console.log(`Vacant Units: ${stats.vacant_units}`);
      console.log(`Occupancy Rate: ${((stats.occupied_units / stats.total_units) * 100).toFixed(2)}%`);
      console.log(`Total Potential Monthly Rent: $${stats.total_potential_rent.toFixed(2)}`);
      console.log(`Total Actual Monthly Rent: $${stats.total_actual_rent.toFixed(2)}`);
      console.log(`Average Occupied Unit Rent: $${stats.avg_occupied_rent.toFixed(2)}`);
    } catch (error) {
      console.error('Error getting statistics:', error);
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization complete.');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization complete.');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });
