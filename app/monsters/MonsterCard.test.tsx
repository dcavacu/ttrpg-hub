import { render, screen } from '@testing-library/react';
import { MonsterCard } from './MonsterCard';
import type { Monster } from '@/lib/content/types';

const monster: Monster = {
  id: 'm-1',
  name: 'Owlbear',
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: 'Monster Manual', is_homebrew: false },
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast', 'forest'],
  description: 'Half owl, half bear, all bad mood.',
  stats: {},
};

describe('MonsterCard', () => {
  it('shows the name, rating, system, and tags', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByText('Owlbear')).toBeInTheDocument();
    expect(screen.getByText('CR 3')).toBeInTheDocument();
    expect(screen.getByText(/D&D 5e/)).toBeInTheDocument();
    expect(screen.getByText('beast')).toBeInTheDocument();
    expect(screen.getByText('forest')).toBeInTheDocument();
  });

  it('labels official sources as Official', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('labels homebrew sources as Homebrew', () => {
    render(<MonsterCard monster={{ ...monster, is_homebrew: true }} />);
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('links to the monster detail page', () => {
    render(<MonsterCard monster={monster} />);
    expect(screen.getByRole('link', { name: /Owlbear/i })).toHaveAttribute('href', '/monsters/m-1');
  });

  it('renders each tag as a link back into the filtered browse view', () => {
    render(<MonsterCard monster={monster} />);
    const tagLink = screen.getByRole('link', { name: 'beast' });
    expect(tagLink).toHaveAttribute('href', '/monsters?tags=beast');
  });
});
