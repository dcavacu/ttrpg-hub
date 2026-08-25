import { createSupabaseClient } from '@/lib/supabase/client';
import { getCategoryCounts } from '@/lib/content/sidebar';
import { HomeSearch } from './HomeSearch';
import { SwordIcon, PotionIcon, WandIcon, ScrollIcon, PersonIcon } from './content/icons';
import styles from './page.module.css';

export default async function Page() {
  const client = createSupabaseClient();
  const counts = await getCategoryCounts(client);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>A Personal, Invite-Only Archive</p>
        <h1>
          Every creature, item, spell &amp; rule
          <br />
          you keep at the table
        </h1>
        <p className={styles.lede}>
          Gathered from official rulebooks and homebrewed by hand — searchable in the middle of a session, not
          buried in a PDF.
        </p>
        <HomeSearch />
      </section>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerGem} />
        <span className={styles.dividerLine} />
      </div>

      <section className={styles.shelf}>
        <a className={`${styles.tile} ${styles.monsters}`} href="/monsters">
          <span className={styles.tileNumeral} aria-hidden="true">I</span>
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <SwordIcon />
            </div>
            <span className={styles.tileCount}>{counts.monsters} entries</span>
          </div>
          <h2>Monsters</h2>
          <p>
            Stat blocks and lore for every creature you&apos;ll throw at your table — from lowly minions to
            world-ending legendaries.
          </p>
          <span className={styles.tileCta}>Browse the bestiary</span>
        </a>

        <a className={`${styles.tile} ${styles.items}`} href="/items">
          <span className={styles.tileNumeral} aria-hidden="true">II</span>
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <PotionIcon />
            </div>
            <span className={styles.tileCount}>{counts.items} entries</span>
          </div>
          <h2>Items</h2>
          <p>Weapons, armor and the loot lining ancient vaults — with the exact modifiers you&apos;ll actually roll.</p>
          <span className={styles.tileCta}>Raid the vault</span>
        </a>

        <a className={`${styles.tile} ${styles.spells}`} href="/spells">
          <span className={styles.tileNumeral} aria-hidden="true">III</span>
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <WandIcon />
            </div>
            <span className={styles.tileCount}>{counts.spells} entries</span>
          </div>
          <h2>Spells</h2>
          <p>
            Every element and school, with cost and effect laid out so you&apos;re not flipping pages mid-fight.
          </p>
          <span className={styles.tileCta}>Open the grimoire</span>
        </a>

        <a className={`${styles.tile} ${styles.rules}`} href="/rules">
          <span className={styles.tileNumeral} aria-hidden="true">IV</span>
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <ScrollIcon />
            </div>
            <span className={styles.tileCount}>{counts.rules} entries</span>
          </div>
          <h2>Rules</h2>
          <p>Core mechanics, conditions and the fine print that keeps an argument at the table short.</p>
          <span className={styles.tileCta}>Read the fine print</span>
        </a>

        <a className={`${styles.tile} ${styles.sheets}`} href="/character-sheet">
          <span className={styles.tileNumeral} aria-hidden="true">V</span>
          <div className={styles.tileTop}>
            <div className={styles.tileIcon}>
              <PersonIcon />
            </div>
            <span className={styles.tileCount}>9 classes</span>
          </div>
          <h2>Character Sheets</h2>
          <p>Pick a class, drop in a portrait and a color, and download a ready-to-fill PDF sheet for your hero.</p>
          <span className={styles.tileCta}>Build a sheet</span>
        </a>
      </section>

      <div className={`${styles.divider} ${styles.dividerFooter}`} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerGem} />
        <span className={styles.dividerLine} />
      </div>
      <p className={styles.colophon}>Bound in brass. Kept by hand.</p>
    </main>
  );
}
