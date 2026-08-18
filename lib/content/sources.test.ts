import type { SupabaseClient } from '@supabase/supabase-js';
import { listSources } from './sources';

describe('listSources', () => {
  it('returns each source labeled with its parent system name', async () => {
    const client = {
      from: () => ({
        select: () => ({
          order: () => ({
            data: [
              { id: 'src-1', name: 'SRD', is_homebrew: false, system: { name: 'D&D 5e' } },
              { id: 'src-2', name: 'Core Rules', is_homebrew: false, system: { name: 'Nimble' } },
            ],
            error: null,
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await listSources(client);
    expect(result).toEqual([
      { id: 'src-1', name: 'SRD', is_homebrew: false, systemName: 'D&D 5e' },
      { id: 'src-2', name: 'Core Rules', is_homebrew: false, systemName: 'Nimble' },
    ]);
  });
});
