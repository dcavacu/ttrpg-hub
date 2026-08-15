import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SpellFilters } from './SpellFilters';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const systems = [
  { id: 'sys-1', name: 'D&D 5e' },
  { id: 'sys-2', name: 'Pathfinder 2e' },
];

describe('SpellFilters', () => {
  beforeEach(() => push.mockClear());

  it('navigates with a search query param when typing', async () => {
    render(<SpellFilters systems={systems} initial={{}} />);
    await userEvent.type(screen.getByLabelText(/search/i), 'bolt');
    expect(push).toHaveBeenLastCalledWith('/spells?search=bolt');
  });

  it('navigates with a system query param when selected', async () => {
    render(<SpellFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/system/i), 'sys-2');
    expect(push).toHaveBeenLastCalledWith('/spells?systemId=sys-2');
  });

  it('navigates with a sourceType query param when selected', async () => {
    render(<SpellFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/source/i), 'homebrew');
    expect(push).toHaveBeenLastCalledWith('/spells?sourceType=homebrew');
  });
});
