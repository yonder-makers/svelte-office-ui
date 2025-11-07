<script lang="ts">
  import {
    Modal,
    SkeletonText,
  } from 'carbon-components-svelte';
  import { currentEmployeeStore, loadingEmployeeStore, remainingDaysStore, showCareerStatsModalStore } from '../store/state';
  import { differenceInDays, differenceInYears, parse } from 'date-fns';

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

  function handleClose() {
    showCareerStatsModalStore.set(false);
  }

  $: modalHeading = `Career Stats ${pensionEmoji}`;
</script>

<Modal
  bind:open={$showCareerStatsModalStore}
  {modalHeading}
  primaryButtonText="Close"
  size="lg"
  on:click:button--primary={handleClose}
  on:close={handleClose}
>
  {#if loading}
    <SkeletonText />
  {:else if employee}
    <div class="career-content">
      <div class="career-message-inline">{careerMessage}</div>
        <!-- Career Overview Section -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-icon">📊</span>
            <h4 class="section-title">Career Overview</h4>
          </div>
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
        </div>

        <!-- Vacation Progress Section -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-icon">🎁</span>
            <h4 class="section-title">Bonus Vacation Progress</h4>
          </div>
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

        <!-- Retirement Timeline Section -->
        {#if yearsUntilPension > 0}
          <div class="form-section">
            <div class="section-header">
              <span class="section-icon">🏖️</span>
              <h4 class="section-title">Retirement Timeline</h4>
            </div>
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
  {:else}
    <div class="no-data">
      <div class="no-data-icon">📊</div>
      <div class="no-data-text">Career stats loading...</div>
    </div>
  {/if}
</Modal>

<style>
  .career-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .career-content > .form-section:not(:last-child) {
    margin-bottom: 1.75rem;
  }

  .form-section {
    background: linear-gradient(135deg, var(--custom-bg-secondary) 0%, var(--custom-bg) 100%);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--custom-border);
    transition: all 0.3s cubic-bezier(0.2, 0, 0.38, 0.9);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .form-section:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--cds-link-01, #0f62fe);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0;
    border-bottom: none;
  }

  .section-icon {
    font-size: 1.5rem;
    line-height: 1;
    opacity: 0.9;
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--custom-text);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .career-message-inline {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--cds-link-01, #0f62fe);
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, rgba(229, 246, 255, 0.08) 0%, rgba(229, 246, 255, 0.04) 100%);
    border: 2px solid var(--cds-link-01, #0f62fe);
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    display: block;
  }

  /* Dark theme specific overrides */
  :global([data-carbon-theme="g90"]) .career-message-inline,
  :global([data-carbon-theme="g100"]) .career-message-inline {
    color: #78a9ff;
    background: linear-gradient(135deg, rgba(120, 169, 255, 0.12) 0%, rgba(120, 169, 255, 0.06) 100%);
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
    padding: 0.875rem 0.625rem;
    background: var(--custom-bg-tertiary);
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 2px solid transparent;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .stat-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  :global([data-carbon-theme="g90"]) .stat-box,
  :global([data-carbon-theme="g100"]) .stat-box {
    background: var(--custom-bg-tertiary);
  }

  :global([data-carbon-theme="g90"]) .stat-box:hover,
  :global([data-carbon-theme="g100"]) .stat-box:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .stat-box.highlight {
    background: linear-gradient(135deg, color-mix(in srgb, var(--status-success, rgba(66,190,101,1)) 15%, transparent 85%) 0%, color-mix(in srgb, var(--status-success-2, rgba(36,161,72,1)) 15%, transparent 85%) 100%);
    border-color: color-mix(in srgb, var(--status-success, rgba(66,190,101,1)) 30%, transparent 70%);
  }

  :global([data-carbon-theme="g90"]) .stat-box.highlight,
  :global([data-carbon-theme="g100"]) .stat-box.highlight {
    background: linear-gradient(135deg, rgba(66, 190, 101, 0.2) 0%, rgba(36, 161, 72, 0.2) 100%);
    border-color: rgba(66, 190, 101, 0.4);
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
    letter-spacing: 0.5px;
    text-align: center;
    white-space: nowrap;
    font-weight: 600;
  }


  .progression-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .progression-list li {
    font-size: 0.9rem;
    color: var(--custom-text-secondary);
    padding-left: 1.75rem;
    position: relative;
    line-height: 1.5;
  }

  .progression-list li::before {
    content: '○';
    position: absolute;
    left: 0;
    color: var(--custom-text-secondary);
    font-weight: bold;
    font-size: 1.1rem;
  }

  .progression-list li.achieved {
    color: #24a148;
    font-weight: 600;
  }

  :global([data-carbon-theme="g90"]) .progression-list li.achieved,
  :global([data-carbon-theme="g100"]) .progression-list li.achieved {
    color: #42be65;
  }

  .progression-list li.achieved::before {
    content: '●';
    color: #24a148;
  }

  :global([data-carbon-theme="g90"]) .progression-list li.achieved::before,
  :global([data-carbon-theme="g100"]) .progression-list li.achieved::before {
    color: #42be65;
  }

  .next-milestone {
    font-size: 0.9rem;
    color: #0f62fe;
    font-weight: 600;
    padding: 0.875rem 1rem;
    background: rgba(229, 246, 255, 0.15);
    border-left: 4px solid var(--cds-link-01, #0f62fe);
    border-radius: 6px;
    line-height: 1.5;
  }

  :global([data-carbon-theme="g90"]) .next-milestone,
  :global([data-carbon-theme="g100"]) .next-milestone {
    color: #78a9ff;
    background: rgba(120, 169, 255, 0.15);
  }

  .max-level {
    font-size: 0.9rem;
    color: #24a148;
    font-weight: 600;
    padding: 0.875rem 1rem;
    background: rgba(66, 190, 101, 0.15);
    border-left: 4px solid #24a148;
    border-radius: 6px;
    line-height: 1.5;
  }

  :global([data-carbon-theme="g90"]) .max-level,
  :global([data-carbon-theme="g100"]) .max-level {
    color: #42be65;
    background: rgba(66, 190, 101, 0.15);
    border-left-color: #42be65;
  }

  .pension-fun {
    font-size: 0.95rem;
    color: var(--custom-text);
    line-height: 1.6;
  }

  .pension-fun strong {
    color: var(--cds-link-01, #0f62fe);
    font-weight: 700;
  }

  :global([data-carbon-theme="g90"]) .pension-fun strong,
  :global([data-carbon-theme="g100"]) .pension-fun strong {
    color: #78a9ff;
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

  /* Responsive */
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .form-section {
      padding: 1rem;
    }

    .career-content > .form-section:not(:last-child) {
      margin-bottom: 1.25rem;
    }

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

    .section-header {
      gap: 0.75rem;
    }

    .section-icon {
      font-size: 1.25rem;
    }

    .section-title {
      font-size: 0.95rem;
    }
  }
</style>
