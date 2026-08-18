import { render, screen } from '@testing-library/react';
import { ItemCard } from './ItemCard';
import type { Item } from '@/lib/content/types';

const item: Item = {
  id: 'i-1',
  name: 'Sword of Owlbears',
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: "Dungeon Master's Guide", is_homebrew: false },
  is_homebrew: false,
  item_type: 'Weapon',
  rarity: 'Rare',
  tags: ['weapon', 'magic'],
  description: 'A sword shaped like an owlbear, all bad mood.',
  stats: {},
};

describe('ItemCard', () => {
  it('shows the name, rarity, system, item type, and tags', () => {
    render(<ItemCard item={item} />);
    expect(screen.getByText('Sword of Owlbears')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
    expect(screen.getByText(/D&D 5e/)).toBeInTheDocument();
    expect(screen.getByText(/Weapon/)).toBeInTheDocument();
    expect(screen.getByText('weapon')).toBeInTheDocument();
    expect(screen.getByText('magic')).toBeInTheDocument();
  });

  it('labels official sources as Official', () => {
    render(<ItemCard item={item} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('labels homebrew sources as Homebrew', () => {
    render(<ItemCard item={{ ...item, is_homebrew: true }} />);
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('links to the item detail page', () => {
    render(<ItemCard item={item} />);
    expect(screen.getByRole('link', { name: /Sword of Owlbears/i })).toHaveAttribute('href', '/items/i-1');
  });

  it('renders each tag as a link back into the filtered browse view', () => {
    render(<ItemCard item={item} />);
    const tagLink = screen.getByRole('link', { name: 'weapon' });
    expect(tagLink).toHaveAttribute('href', '/items?tags=weapon');
  });
});
