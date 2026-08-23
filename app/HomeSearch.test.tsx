import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { HomeSearch } from './HomeSearch';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('HomeSearch', () => {
  beforeEach(() => push.mockClear());

  it('renders a search box', () => {
    render(<HomeSearch />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('navigates to the monsters browse page with the query on submit', async () => {
    render(<HomeSearch />);
    await userEvent.type(screen.getByLabelText(/search the compendium/i), 'Caerys');
    await userEvent.keyboard('{Enter}');
    expect(push).toHaveBeenLastCalledWith('/monsters?search=Caerys');
  });

  it('navigates to the monsters browse page with no query when submitted empty', async () => {
    render(<HomeSearch />);
    const form = screen.getByRole('search');
    (form as HTMLFormElement).requestSubmit();
    expect(push).toHaveBeenLastCalledWith('/monsters');
  });
});
