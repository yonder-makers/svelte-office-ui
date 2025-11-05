<script lang="ts">
  import { Tile, SkeletonText } from 'carbon-components-svelte';
  import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';
  import ChevronUp from 'carbon-icons-svelte/lib/ChevronUp.svelte';
  import { currentEmployeeStore, loadingEmployeeStore, remainingDaysStore } from '../store/state';
  import { differenceInDays, differenceInYears, parse } from 'date-fns';
  import { writable } from 'svelte/store';
  import { slide } from 'svelte/transition';

  // Persistent collapse state (saved to localStorage)
  const isCollapsedStore = writable<boolean>(
    localStorage.getItem('careerStatsCollapsed') === 'true'
  );

  $: isCollapsed = $isCollapsedStore;

  function toggleCollapse() {
    isCollapsedStore.update(val => {
      const newVal = !val;
      localStorage.setItem('careerStatsCollapsed', String(newVal));
      return newVal;
    });
  }

  $: employee = $currentEmployeeStore;
  $: loading = $loadingEmployeeStore;
  $: total = $remainingDaysStore.total;

  // Calculate years of service
  $: yearsOfService = employee ? calculateYearsOfService(employee.hireDate) : 0;

  // Calculate extra vacation days earned based on years of service
  $: extraDays = calculateExtraVacationDays(yearsOfService);

  // Calculate days until pension (retirement at 65)
  $: daysUntilPension = employee ? calculateDaysUntilPension(employee.birthDate) : 0;
  $: yearsUntilPension = Math.floor(daysUntilPension / 365.25);

  // Calculate vacation days progress
  $: nextMilestone = getNextVacationMilestone(yearsOfService);

  // Fun messages based on career stage
  $: careerMessage = getCareerMessage(yearsOfService, yearsUntilPension);
  $: pensionEmoji = getPensionEmoji(yearsUntilPension);

  function parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    // Handle both DD.MM.YYYY and DD-MM-YYYY formats
    const separator = dateString.includes('.') ? '.' : '-';
    const [day, month, year] = dateString.split(separator);
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  function calculateYearsOfService(hireDate: string): number {
    const hire = parseDate(hireDate);
    if (!hire) return 0;
    return differenceInYears(new Date(), hire);
  }

  function calculateDaysUntilPension(birthDate: string): number {
    const birth = parseDate(birthDate);
    if (!birth) return 0;

    const retirementDate = new Date(birth);
    retirementDate.setFullYear(birth.getFullYear() + 65);

    const days = differenceInDays(retirementDate, new Date());
    return days > 0 ? days : 0;
  }

  function calculateExtraVacationDays(years: number): number {
    let extra = 0;

    // First 3 years: 1 day per year
    if (years >= 1) extra += 1;
    if (years >= 2) extra += 1;
    if (years >= 3) extra += 1;

    // After 5 years: +1 day
    if (years >= 5) extra += 1;

    // After 7 years: +1 day
    if (years >= 7) extra += 1;

    return extra;
  }

  function getNextVacationMilestone(years: number): { years: number; description: string } | null {
    if (years < 1) return { years: 1, description: 'First bonus day' };
    if (years < 2) return { years: 2, description: 'Second bonus day' };
    if (years < 3) return { years: 3, description: 'Third bonus day' };
    if (years < 5) return { years: 5, description: '5-year milestone' };
    if (years < 7) return { years: 7, description: '7-year milestone' };
    return null; // Max level achieved!
  }

  function getCareerMessage(years: number, yearsLeft: number): string {
    if (years === 0) return 'Welcome aboard! 🎉';
    if (years === 1) return 'One year down, nice!';
    if (years < 3) return 'Building momentum...';
    if (years < 5) return 'Seasoned professional!';
    if (years < 7) return 'Veteran status unlocked!';
    if (years >= 7 && yearsLeft > 30) return 'Legend in the making!';
    if (yearsLeft <= 10) return 'The finish line is in sight!';
    if (yearsLeft <= 5) return 'Almost time to relax! 🏖️';
    return 'Living the dream!';
  }

  function getPensionEmoji(yearsLeft: number): string {
    if (yearsLeft > 40) return '👶';
    if (yearsLeft > 30) return '💼';
    if (yearsLeft > 20) return '🎯';
    if (yearsLeft > 10) return '🏆';
    if (yearsLeft > 5) return '🎊';
    return '🏖️';
  }
</script>

<Tile class="career-stats-tile">
  <div class="career-widget">
    {#if loading}
      <SkeletonText />
    {:else if employee}
      <div class="career-content">
        <button class="widget-header" on:click={toggleCollapse}>
          <div class="header-left">
            <h3 class="widget-title">Career Stats</h3>
            <span class="career-emoji">{pensionEmoji}</span>
          </div>
          <div class="collapse-icon">
            {#if isCollapsed}
              <ChevronDown size={20} />
            {:else}
              <ChevronUp size={20} />
            {/if}
          </div>
        </button>

        {#if !isCollapsed}
        <div class="collapsible-content" transition:slide={{ duration: 250 }}>
        <div class="career-message">{careerMessage}</div>

        <div class="stats-grid">
          <!-- Years at Company -->
          <div class="stat-box">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <div class="stat-value-large">{yearsOfService}</div>
              <div class="stat-label">Years Here</div>
            </div>
          </div>

          <!-- Extra Vacation Days -->
          <div class="stat-box highlight">
            <div class="stat-icon">🏖️</div>
            <div class="stat-info">
              <div class="stat-value-large">+{extraDays}</div>
              <div class="stat-label">Bonus Days</div>
            </div>
          </div>

          <!-- Years Until Pension -->
          <div class="stat-box">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-value-large">{yearsUntilPension}</div>
              <div class="stat-label">Years to Pension</div>
            </div>
          </div>

          <!-- Total Vacation Days -->
          <div class="stat-box">
            <div class="stat-icon">✨</div>
            <div class="stat-info">
              <div class="stat-value-large">{total}</div>
              <div class="stat-label">Total Days</div>
            </div>
          </div>
        </div>

        <!-- Vacation Progression Info -->
        <div class="progression-info">
          <div class="progression-title">🎁 Bonus Vacation Days Earned:</div>
          <ul class="progression-list">
            <li class:achieved={yearsOfService >= 1}>Year 1-3: +{Math.min(yearsOfService, 3)} days</li>
            <li class:achieved={yearsOfService >= 5}>After 5 years: {yearsOfService >= 5 ? '+1 day ✓' : '+1 day'}</li>
            <li class:achieved={yearsOfService >= 7}>After 7 years: {yearsOfService >= 7 ? '+1 day ✓' : '+1 day'}</li>
          </ul>
          {#if nextMilestone}
            <div class="next-milestone">
              🎯 Next: <strong>{nextMilestone.description}</strong> in {nextMilestone.years - yearsOfService} year{nextMilestone.years - yearsOfService === 1 ? '' : 's'}
            </div>
          {:else}
            <div class="max-level">
              🏆 Maximum vacation level achieved! (Up to 26 days/year)
            </div>
          {/if}
        </div>

        <!-- Fun Pension Counter -->
        {#if yearsUntilPension > 0}
          <div class="pension-counter">
            <div class="pension-fun">
              Only <strong>{daysUntilPension.toLocaleString()}</strong> days until retirement!
              {#if yearsUntilPension <= 5}
                Time flies! ⏰
              {:else if yearsUntilPension <= 10}
                Getting closer! 🎯
              {:else if yearsUntilPension <= 20}
                Plenty of adventures ahead! 🚀
              {:else}
                The journey is the reward! 🌟
              {/if}
            </div>
          </div>
        {/if}
        </div>
        {/if}
      </div>
    {:else}
      <div class="no-data">
        <div class="no-data-icon">📊</div>
        <div class="no-data-text">Career stats loading...</div>
      </div>
    {/if}
  </div>
</Tile>

<style>
  .career-widget {
    padding: 0;
    width: 100%;
  }

  .career-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .collapsible-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden;
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem;
    margin: -0.5rem -0.5rem 0.5rem -0.5rem;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .widget-header:hover {
    background: var(--cds-layer-hover-01, rgba(0, 0, 0, 0.05));
  }

  .widget-header:active {
    background: var(--cds-layer-active-01, rgba(0, 0, 0, 0.1));
  }

  .widget-header:focus {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 2px;
  }

  .widget-header:focus:not(:focus-visible) {
    outline: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--cds-text-01, var(--custom-text));
    letter-spacing: 0.02em;
  }

  .career-emoji {
    font-size: 1.5rem;
  }

  .collapse-icon {
    display: flex;
    align-items: center;
    color: var(--custom-text-secondary);
    transition: transform 0.2s ease;
  }

  .widget-header:hover .collapse-icon {
    color: var(--cds-text-01, var(--custom-text));
  }

  .career-message {
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--cds-link-01, #0f62fe);
    padding: 0.5rem;
    background: var(--cds-layer-accent-01, rgba(15, 98, 254, 0.1));
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  /* Dark theme specific overrides */
  :global([data-theme="g100"]) .widget-title {
    color: var(--cds-text-01, #f4f4f4);
  }

  :global([data-theme="g100"]) .career-message {
    color: #78a9ff;
    background: rgba(120, 169, 255, 0.15);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: var(--custom-bg-secondary);
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 2px solid transparent;
  }

  .stat-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-box.highlight {
    background: linear-gradient(135deg, rgba(66, 190, 101, 0.1) 0%, rgba(36, 161, 72, 0.1) 100%);
    border-color: rgba(66, 190, 101, 0.3);
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value-large {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--custom-text);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--custom-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    text-align: center;
    white-space: nowrap;
  }

  .progression-info {
    padding: 1rem;
    background: var(--custom-bg-secondary);
    border-radius: 8px;
    border-left: 4px solid #0f62fe;
  }

  .progression-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--custom-text);
    margin-bottom: 0.75rem;
  }

  .progression-list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progression-list li {
    font-size: 0.8rem;
    color: var(--custom-text-secondary);
    padding-left: 1.5rem;
    position: relative;
  }

  .progression-list li::before {
    content: '○';
    position: absolute;
    left: 0;
    color: #8d8d8d;
    font-weight: bold;
  }

  .progression-list li.achieved {
    color: #24a148;
    font-weight: 500;
  }

  .progression-list li.achieved::before {
    content: '●';
    color: #24a148;
  }

  .next-milestone {
    font-size: 0.8rem;
    color: #0f62fe;
    font-weight: 500;
    padding: 0.5rem;
    background: rgba(15, 98, 254, 0.05);
    border-radius: 4px;
    text-align: center;
  }

  .max-level {
    font-size: 0.8rem;
    color: #24a148;
    font-weight: 600;
    padding: 0.5rem;
    background: rgba(36, 161, 72, 0.1);
    border-radius: 4px;
    text-align: center;
  }

  .pension-counter {
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
    border-radius: 8px;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .pension-fun {
    font-size: 0.85rem;
    color: var(--custom-text);
    text-align: center;
    line-height: 1.5;
  }

  .pension-fun strong {
    color: #ff6f00;
    font-weight: 700;
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    opacity: 0.6;
  }

  .no-data-icon {
    font-size: 3rem;
  }

  .no-data-text {
    font-size: 0.875rem;
    color: var(--custom-text-secondary);
  }

  :global(.career-stats-tile.bx--tile) {
    padding: 1rem;
    overflow: hidden;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .stat-box {
      padding: 0.5rem;
    }

    .stat-icon {
      font-size: 1.25rem;
    }

    .stat-value-large {
      font-size: 1.25rem;
    }
  }
</style>
