export const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Beverages',
];

export const SORT_OPTIONS = [
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low', value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
];

export const STATUS_COLORS = {
  Pending: 'text-yellow-500 bg-yellow-500/10',
  Preparing: 'text-blue-500 bg-blue-500/10',
  'Out for Delivery': 'text-purple-500 bg-purple-500/10',
  Delivered: 'text-green-500 bg-green-500/10',
};
