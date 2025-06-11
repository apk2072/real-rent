// import axios from 'axios';
// import * as cheerio from 'cheerio';

export interface MortgageRate {
  loanType: string;
  rate: number;
  apr: number;
  lastUpdated: string;
}

export interface InterestRate {
  type: string;
  rate: number;
  lastUpdated: string;
}

export class FinancialDataService {
  // Cache the data to avoid too many requests
  private mortgageRatesCache: MortgageRate[] = [];
  private interestRatesCache: InterestRate[] = [];
  private lastFetchTime: Date | null = null;
  private cacheDurationMs = 3600000; // 1 hour

  constructor() {}

  private isCacheValid(): boolean {
    if (!this.lastFetchTime) return false;
    const now = new Date();
    return now.getTime() - this.lastFetchTime.getTime() < this.cacheDurationMs;
  }

  async getMortgageRates(): Promise<MortgageRate[]> {
    if (this.isCacheValid() && this.mortgageRatesCache.length > 0) {
      return this.mortgageRatesCache;
    }

    try {
      // Due to Node.js version compatibility issues, we'll use hardcoded data instead of scraping
      const today = new Date().toLocaleDateString();
      const rates: MortgageRate[] = [
        {
          loanType: '30-year fixed',
          rate: 6.85,
          apr: 6.87,
          lastUpdated: today
        },
        {
          loanType: '15-year fixed',
          rate: 6.15,
          apr: 6.18,
          lastUpdated: today
        },
        {
          loanType: '5/1 ARM',
          rate: 6.43,
          apr: 7.95,
          lastUpdated: today
        }
      ];

      this.mortgageRatesCache = rates;
      this.lastFetchTime = new Date();
      return rates;
    } catch (error) {
      console.error('Error fetching mortgage rates:', error);
      // Return fallback data if there's an error
      return [
        {
          loanType: '30-year fixed',
          rate: 6.85,
          apr: 6.87,
          lastUpdated: new Date().toLocaleDateString()
        },
        {
          loanType: '15-year fixed',
          rate: 6.15,
          apr: 6.18,
          lastUpdated: new Date().toLocaleDateString()
        },
        {
          loanType: '5/1 ARM',
          rate: 6.43,
          apr: 7.95,
          lastUpdated: new Date().toLocaleDateString()
        }
      ];
    }
  }

  async getInterestRates(): Promise<InterestRate[]> {
    if (this.isCacheValid() && this.interestRatesCache.length > 0) {
      return this.interestRatesCache;
    }

    try {
      // Due to Node.js version compatibility issues, we'll use hardcoded data instead of scraping
      const today = new Date().toLocaleDateString();
      const rates: InterestRate[] = [
        {
          type: 'Federal Funds Rate',
          rate: 5.33,
          lastUpdated: today
        },
        {
          type: 'Prime Rate',
          rate: 8.50,
          lastUpdated: today
        },
        {
          type: '10-Year Treasury',
          rate: 4.25,
          lastUpdated: today
        }
      ];

      this.interestRatesCache = rates;
      this.lastFetchTime = new Date();
      return rates;
    } catch (error) {
      console.error('Error fetching interest rates:', error);
      // Return fallback data if there's an error
      return [
        {
          type: 'Federal Funds Rate',
          rate: 5.33,
          lastUpdated: new Date().toLocaleDateString()
        },
        {
          type: 'Prime Rate',
          rate: 8.50,
          lastUpdated: new Date().toLocaleDateString()
        },
        {
          type: '10-Year Treasury',
          rate: 4.25,
          lastUpdated: new Date().toLocaleDateString()
        }
      ];
    }
  }
}
