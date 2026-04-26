export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  localCurrency: string; // Base / Home Currency 
  spendingCurrency: string; // Destination Currency
  cashExchangeRate?: number;
  budget?: number; // Total trip budget in localCurrency
}

export interface Expense {
  id: string;
  tripId: string;
  categoryId: string;
  title?: string;
  date: string;
  amount: number;
  sourceId: string;
  currency?: string;
  baseCurrencyAmount?: number;
  customExchangeRate?: number;
  billUrl?: string;
  billUrls?: string[];
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  icon: any; // FontAwesome IconDefinition
}

export interface Category {
  id: string;
  name: string;
  icon: any; // FontAwesome IconDefinition
}

export interface Source {
  id: string;
  name: string;
  icon: any; // FontAwesome IconDefinition
}
