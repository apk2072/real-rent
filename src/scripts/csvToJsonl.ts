import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Define the type for rent roll entries
interface RentRollEntry {
  unit: string;
  name: string;
  type: string;
  sq_ft: string;
  autobill: string;
  deposit: string;
  moved_in: string;
  lease_ends: string;
  status: string;
}

// Path to the CSV file
const csvFilePath = path.resolve(__dirname, '../../data/rent-roll.csv');
// Path to the output JSONL file
const jsonlFilePath = path.resolve(__dirname, '../../data/processed/rent-roll.jsonl');

// Create a write stream for the JSONL file
const writeStream = fs.createWriteStream(jsonlFilePath);

console.log('Converting CSV to JSONL...');

// Process the CSV file
fs.createReadStream(csvFilePath)
  .pipe(csv({
    skipLines: 1, // Skip the first empty line
    headers: ['empty', 'unit', 'name', 'type', 'sq_ft', 'autobill', 'deposit', 'moved_in', 'lease_ends', 'status']
  }))
  .on('data', (data: any) => {
    // Skip the header row
    if (data.unit === 'Unit') {
      return;
    }
    
    // Remove the empty column
    delete data.empty;
    
    // Clean up monetary values
    const autobill = data.autobill ? data.autobill.replace(/[^0-9.]/g, '') : '0';
    const deposit = data.deposit ? data.deposit.replace(/[^0-9.]/g, '') : '0';
    
    // Convert numeric fields from strings to numbers
    const processedData = {
      ...data,
      sq_ft: data.sq_ft ? parseInt(data.sq_ft, 10) : 0,
      autobill: parseFloat(autobill),
      deposit: parseFloat(deposit),
    };
    
    // Write each entry as a JSON line
    writeStream.write(JSON.stringify(processedData) + '\n');
  })
  .on('end', () => {
    writeStream.end();
    console.log(`Conversion complete. JSONL file saved to ${jsonlFilePath}`);
  })
  .on('error', (error) => {
    console.error('Error processing CSV file:', error);
  });
