export interface HeroSlide {
  id: string;
  order: number;
  imageUrl: string;
  createdAt?: string;
}

export const mockHeroSlides: HeroSlide[] = [
  {
    id: 'SLIDE-001',
    order: 1,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-08-01',
  },
  {
    id: 'SLIDE-002',
    order: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-08-03',
  },
  {
    id: 'SLIDE-003',
    order: 3,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-08-05',
  },
  {
    id: 'SLIDE-004',
    order: 4,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-08-07',
  },
];
