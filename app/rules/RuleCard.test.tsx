import { render, screen } from '@testing-library/react';
import { RuleCard } from './RuleCard';
import type { Rule } from '@/lib/content/types';

const rule: Rule = {
  id: 'r-1',
  name: 'Grappling with an Owlbear',
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: "Player's Handbook", is_homebrew: false },
  is_homebrew: false,
  category: 'Combat',
  tags: ['grappling', 'combat'],
  description: 'Special rules for grappling an owlbear.',
  stats: {},
};

describe('RuleCard', () => {
  it('shows the name, category, system, and tags', () => {
    render(<RuleCard rule={rule} />);
    expect(screen.getByText('Grappling with an Owlbear')).toBeInTheDocument();
    expect(screen.getByText('Combat')).toBeInTheDocument();
    expect(screen.getByText(/D&D 5e/)).toBeInTheDocument();
    expect(screen.getByText('grappling')).toBeInTheDocument();
    expect(screen.getByText('combat')).toBeInTheDocument();
  });

  it('labels official sources as Official', () => {
    render(<RuleCard rule={rule} />);
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('labels homebrew sources as Homebrew', () => {
    render(<RuleCard rule={{ ...rule, is_homebrew: true }} />);
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('links to the rule detail page', () => {
    render(<RuleCard rule={rule} />);
    expect(screen.getByRole('link', { name: /Grappling with an Owlbear/i })).toHaveAttribute('href', '/rules/r-1');
  });

  it('renders each tag as a link back into the filtered browse view', () => {
    render(<RuleCard rule={rule} />);
    const tagLink = screen.getByRole('link', { name: 'grappling' });
    expect(tagLink).toHaveAttribute('href', '/rules?tags=grappling');
  });
});
