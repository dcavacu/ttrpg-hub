import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Sidebar } from './Sidebar';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const counts = { monsters: 324, items: 0, spells: 0, rules: 0 };
const tags = ['Aberration', 'Beast', 'Dragon'];

describe('Sidebar', () => {
  beforeEach(() => push.mockClear());

  it('renders category counts with Monsters as a real link', () => {
    render(<Sidebar counts={counts} tags={tags} initial={{}} category="monsters" />);
    const monstersLink = screen.getByRole('link', { name: /monsters/i });
    expect(monstersLink).toHaveAttribute('href', '/monsters');
    expect(screen.getByText('(324)')).toBeInTheDocument();
  });

  it('renders Items, Spells, and Rules as real links with the right hrefs', () => {
    render(<Sidebar counts={counts} tags={tags} initial={{}} category="monsters" />);
    expect(screen.getByRole('link', { name: /items/i })).toHaveAttribute('href', '/items');
    expect(screen.getByRole('link', { name: /spells/i })).toHaveAttribute('href', '/spells');
    expect(screen.getByRole('link', { name: /rules/i })).toHaveAttribute('href', '/rules');
  });

  it('navigates with the tag added when checking an unchecked tag', async () => {
    render(<Sidebar counts={counts} tags={tags} initial={{}} category="monsters" />);
    await userEvent.click(screen.getByLabelText('Dragon'));
    expect(push).toHaveBeenLastCalledWith('/monsters?tags=Dragon');
  });

  it('navigates with the tag removed when unchecking a checked tag', async () => {
    render(<Sidebar counts={counts} tags={tags} initial={{ tags: ['Dragon'] }} category="monsters" />);
    await userEvent.click(screen.getByLabelText('Dragon'));
    expect(push).toHaveBeenLastCalledWith('/monsters');
  });

  it('preserves other active filters when toggling a tag', async () => {
    render(
      <Sidebar counts={counts} tags={tags} initial={{ search: 'dragon', tags: ['Beast'] }} category="monsters" />,
    );
    await userEvent.click(screen.getByLabelText('Dragon'));
    expect(push).toHaveBeenLastCalledWith('/monsters?search=dragon&tags=Beast%2CDragon');
  });

  it('navigates tag toggles relative to the current category', async () => {
    render(<Sidebar counts={counts} tags={tags} initial={{}} category="items" />);
    await userEvent.click(screen.getByLabelText('Dragon'));
    expect(push).toHaveBeenLastCalledWith('/items?tags=Dragon');
  });
});
