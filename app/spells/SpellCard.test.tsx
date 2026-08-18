import { render, screen } from '@testing-library/react';
import { SpellCard } from './SpellCard';
import type { Spell } from '@/lib/content/types';

const spell: Spell = {
  id: 'sp-1',
  name: 'Owlbear Bolt',
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: "Player's Handbook", is_homebrew: false },
  is_homebrew: false,
  level: '3rd',
  tags: ['evocation', 'ranged'],
  description: 'Hurls a bolt shaped like an owlbear claw.',
  stats: {},
};

describe('SpellCard', () => {
  it('shows the name, level, system, and tags', () => {
    render(<SpellCard spell={spell} />);
    expect(screen.getByText('Owlbear Bolt')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
    expect(screen.getByText(/D&D 5e/)).toBeInTheDocument();
    expect(screen.getByText('evocation')).toBeInTheDocument();
    expect(screen.getByText('ranged')).toBeInTheDocument();
  });

  it('labels official sources as Official', () => {
    render(<SpellCard spell={spell} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('labels homebrew sources as Homebrew', () => {
    render(<SpellCard spell={{ ...spell, is_homebrew: true }} />);
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('links to the spell detail page', () => {
    render(<SpellCard spell={spell} />);
    expect(screen.getByRole('link', { name: /Owlbear Bolt/i })).toHaveAttribute('href', '/spells/sp-1');
  });

  it('renders each tag as a link back into the filtered browse view', () => {
    render(<SpellCard spell={spell} />);
    const tagLink = screen.getByRole('link', { name: 'evocation' });
    expect(tagLink).toHaveAttribute('href', '/spells?tags=evocation');
  });
});
