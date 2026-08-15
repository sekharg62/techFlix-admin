export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export const mockCategories: Category[] = [
  {
    id: 'CAT-001',
    name: 'Gaming Consoles',
    slug: 'gaming-consoles',
    description: 'PlayStation, Xbox, and Nintendo systems & hardware',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=200',
    productCount: 45,
    status: 'Active',
    createdAt: '2026-08-01',
  },
  {
    id: 'CAT-002',
    name: 'Laptops & PCs',
    slug: 'laptops-pcs',
    description: 'High performance MacBook Pro, Dell XPS, and custom gaming rigs',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200',
    productCount: 27,
    status: 'Active',
    createdAt: '2026-08-02',
  },
  {
    id: 'CAT-003',
    name: 'Monitors & Displays',
    slug: 'monitors-displays',
    description: 'Ultra-wide 4K OLED, curved gaming monitors & productivity screens',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=200',
    productCount: 18,
    status: 'Active',
    createdAt: '2026-08-03',
  },
  {
    id: 'CAT-004',
    name: 'Audio Gear',
    slug: 'audio-gear',
    description: 'Noise cancelling headphones, studio monitors & wireless earbuds',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200',
    productCount: 32,
    status: 'Active',
    createdAt: '2026-08-04',
  },
  {
    id: 'CAT-005',
    name: 'Computer Components',
    slug: 'computer-components',
    description: 'GPUs, CPUs, RAM sticks, power supplies & liquid coolers',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=200',
    productCount: 54,
    status: 'Active',
    createdAt: '2026-08-05',
  },
  {
    id: 'CAT-006',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Mechanical keyboards, ergonomic mice & premium desk pads',
    imageUrl: '',
    productCount: 89,
    status: 'Inactive',
    createdAt: '2026-08-06',
  },
];
