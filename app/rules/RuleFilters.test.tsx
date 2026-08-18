import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RuleFilters } from './RuleFilters';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const systems = [
  { id: 'sys-1', name: 'D&D 5e' },
  { id: 'sys-2', name: 'Pathfinder 2e' },
];

describe('RuleFilters', () => {
  beforeEach(() => push.mockClear());

  it('navigates with a search query param when typing, after the debounce delay', () => {
    vi.useFakeTimers();
    render(<RuleFilters systems={systems} initial={{}} />);
    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: 'grapple' } });
    expect(push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(250));
    expect(push).toHaveBeenLastCalledWith('/rules?search=grapple');
    vi.useRealTimers();
  });

  it('navigates with a system query param when selected', async () => {
    render(<RuleFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/system/i), 'sys-2');
    expect(push).toHaveBeenLastCalledWith('/rules?systemId=sys-2');
  });

  it('navigates with a sourceType query param when selected', async () => {
    render(<RuleFilters systems={systems} initial={{}} />);
    await userEvent.selectOptions(screen.getByLabelText(/source/i), 'homebrew');
    expect(push).toHaveBeenLastCalledWith('/rules?sourceType=homebrew');
  });
});
