import { render, screen } from '@testing-library/react';
import Page from './page';

describe('Home page', () => {
  it('renders the compendium heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /compendium/i })).toBeInTheDocument();
  });
});
