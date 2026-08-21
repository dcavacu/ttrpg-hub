import { render, screen } from '@testing-library/react';
import Page from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({}),
}));
vi.mock('@/lib/content/sidebar', () => ({
  getCategoryCounts: async () => ({ monsters: 450, items: 123, spells: 77, rules: 103 }),
}));

describe('Home page', () => {
  it('shows a tile for each content type with its live count', async () => {
    render(await Page());
    expect(screen.getByRole('link', { name: /Monsters/i })).toHaveAttribute('href', '/monsters');
    expect(screen.getByText('450 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Items/i })).toHaveAttribute('href', '/items');
    expect(screen.getByText('123 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Spells/i })).toHaveAttribute('href', '/spells');
    expect(screen.getByText('77 entries')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rules/i })).toHaveAttribute('href', '/rules');
    expect(screen.getByText('103 entries')).toBeInTheDocument();
  });
});
