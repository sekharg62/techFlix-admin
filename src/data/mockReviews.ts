export interface Review {
  id: string;
  name: string;
  role: string;
  starCount: number;
  profileUrl?: string;
  comment: string;
  createdAt: string;
}

export const mockReviews: Review[] = [
  {
    id: 'REV-001',
    name: 'Sarah Connor',
    role: 'VIP Subscriber',
    starCount: 5,
    profileUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    comment: 'Exceptional streaming quality and seamless cross-device synchronization. Highly recommended!',
    createdAt: '2026-08-10',
  },
  {
    id: 'REV-002',
    name: 'Marcus Vance',
    role: 'Tech Enthusiast',
    starCount: 4.5,
    profileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    comment: 'Great selection of 4K content and very responsive customer support whenever needed.',
    createdAt: '2026-08-08',
  },
  {
    id: 'REV-003',
    name: 'Elena Rostova',
    role: 'Verified Buyer',
    starCount: 5,
    profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    comment: 'Smooth administration dashboard and instant license key delivery. 10/10 service!',
    createdAt: '2026-08-05',
  },
  {
    id: 'REV-004',
    name: 'David Chen',
    role: 'Senior Developer',
    starCount: 4,
    profileUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    comment: 'Solid API integration and modern interface design. Very easy to use.',
    createdAt: '2026-08-02',
  },
  {
    id: 'REV-005',
    name: 'Amara Okafor',
    role: 'Digital Creator',
    starCount: 5,
    profileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    comment: 'The user experience is top tier. Upgrading my subscription took less than 30 seconds.',
    createdAt: '2026-07-29',
  },
  {
    id: 'REV-006',
    name: 'Liam Hemsworth',
    role: 'Verified Buyer',
    starCount: 3.5,
    profileUrl: '',
    comment: 'Good service overall, but would love to see more bundle options available.',
    createdAt: '2026-07-25',
  },
];
