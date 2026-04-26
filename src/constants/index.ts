import { Currency, Category, Source } from '../types';
import { 
  faDollarSign, faEuroSign, faPoundSign, faYenSign, faIndianRupeeSign, faRupeeSign, faCoins, faFrancSign, faWonSign, faPesoSign,
  faPlane, faBed, faUtensils, faTaxi, faTicketAlt, faShoppingBag, faShoppingCart, faBeer, faLandmark, faGift, faBox,
  faMoneyBill, faCreditCard, faMobileAlt
} from '@fortawesome/free-solid-svg-icons';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', icon: faDollarSign },
  { code: 'EUR', name: 'Euro', symbol: '€', icon: faEuroSign },
  { code: 'GBP', name: 'British Pound', symbol: '£', icon: faPoundSign },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', icon: faYenSign },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', icon: faIndianRupeeSign },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', icon: faDollarSign },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', icon: faDollarSign },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', icon: faFrancSign },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', icon: faYenSign },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', icon: faDollarSign },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', icon: faCoins },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', icon: faRupeeSign },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', icon: faDollarSign },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', icon: faPesoSign },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', icon: faCoins },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', icon: faWonSign },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', icon: faDollarSign },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', icon: faRupeeSign },
];

export const CATEGORIES: Category[] = [
  { id: 'flights', name: 'Flights', icon: faPlane },
  { id: 'hotel', name: 'Hotel', icon: faBed },
  { id: 'food', name: 'Food & Dining', icon: faUtensils },
  { id: 'transport', name: 'Transport', icon: faTaxi },
  { id: 'entertainment', name: 'Entertainment', icon: faTicketAlt },
  { id: 'shopping', name: 'Shopping', icon: faShoppingBag },
  { id: 'groceries', name: 'Groceries', icon: faShoppingCart },
  { id: 'drinks', name: 'Drinks', icon: faBeer },
  { id: 'sightseeing', name: 'Sightseeing', icon: faLandmark },
  { id: 'gifts', name: 'Gifts & Souvenirs', icon: faGift },
  { id: 'other', name: 'Other', icon: faBox },
];

export const SOURCES: Source[] = [
  { id: 'cash', name: 'Cash', icon: faMoneyBill },
  { id: 'credit', name: 'Credit Card', icon: faCreditCard },
  { id: 'debit', name: 'Debit Card', icon: faCreditCard },
  { id: 'mobile', name: 'Mobile Wallet', icon: faMobileAlt },
];
