# Real Rent Analysis

A TypeScript application for analyzing rent roll data using the Model Context Protocol (MCP) and modern AI tooling.

## Project Overview

This project provides a complete solution for:

1. Converting rent roll data from CSV to JSONL format
2. Storing the data in a SQLite database
3. Providing a React web interface to query the data using natural language or SQL
4. Leveraging the Model Context Protocol to enable AI-powered data analysis

## Project Structure

```
real-rent/
├── data/
│   ├── processed/
│   │   ├── rent-roll-sample.csv
│   │   └── rent-roll.jsonl
│   └── rent_roll.db
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── mcpClient.ts
│   │   └── mcpService.ts
│   ├── components/
│   │   ├── App.tsx
│   │   ├── QueryInput.tsx
│   │   └── ResultDisplay.tsx
│   ├── db/
│   │   ├── database.ts
│   │   └── schema.ts
│   ├── scripts/
│   │   ├── csvToJsonl.ts
│   │   ├── initDb.ts
│   │   └── startMcpServer.ts
│   ├── index.tsx
│   └── styles.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd real-rent
npm install
```

### Data Processing

1. Convert the CSV data to JSONL format:

```bash
npm run csv-to-jsonl
```

2. Initialize the SQLite database with the JSONL data:

```bash
npm run db-init
```

### Starting the Application

1. Start the MCP server:

```bash
ts-node src/scripts/startMcpServer.ts
```

2. In a separate terminal, start the React application:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Features

- **CSV to JSONL Conversion**: Process rent roll data from CSV format to JSONL
- **SQLite Database**: Store and query rent roll data efficiently
- **React UI**: User-friendly interface for data analysis
- **MCP Integration**: Use natural language to query your data
- **Dual Query Modes**: Choose between natural language or SQL queries

## Using the Application

1. Select the query type (Natural Language or SQL)
2. Enter your query or select from the example queries
3. Click "Run Query" to see the results
4. Results will be displayed in a table or summary format

## Example Queries

### Natural Language

- "Show me all vacant units"
- "What is the occupancy rate?"
- "Show units in property 1001"

### SQL

- `SELECT * FROM rent_roll WHERE status = "Vacant"`
- `SELECT COUNT(*) as total, SUM(CASE WHEN status = "Occupied" THEN 1 ELSE 0 END) as occupied FROM rent_roll`
- `SELECT * FROM rent_roll WHERE property_id = 1001`

### Financial Analysis (MCP Service)

- "What are the current mortgage rates?"
- "How have interest rates changed in the last 6 months?"
- "What is the average 30-year fixed mortgage rate today?"
- "Calculate the monthly mortgage payment for a $500,000 property"
- "What would be the total interest paid on a 30-year loan?"
- "Compare mortgage rates for different loan terms (15-year vs 30-year)"
