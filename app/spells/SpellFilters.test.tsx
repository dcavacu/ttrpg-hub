import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('navigates with a search query param when typing, after the debounce delay', () => {
    vi.useFakeTimers();
    render(<SpellFilters systems={systems} initial={{}} />);
    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: 'bolt' } });
    expect(push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(250));
    expect(push).toHaveBeenLastCalledWith('/spells?search=bolt');
    vi.useRealTimers();
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
