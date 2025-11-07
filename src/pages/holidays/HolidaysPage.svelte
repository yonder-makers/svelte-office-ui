<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Column, Grid, InlineNotification, Row, Tile } from 'carbon-components-svelte';
  import Add from 'carbon-icons-svelte/lib/Add.svelte';
  import Calendar from 'carbon-icons-svelte/lib/Calendar.svelte';
  import UserCertification from 'carbon-icons-svelte/lib/UserCertification.svelte';
  import HolidaysGrid from './parts/HolidaysGrid.svelte';
  import HolidayRequestModal from './parts/HolidayRequestModal.svelte';
  import HolidayEditModal from './parts/HolidayEditModal.svelte';
  import RemainingDaysWidget from './parts/RemainingDaysWidget.svelte';
  import CareerStatsWidget from './parts/CareerStatsWidget.svelte';
  import YearNavigator from './parts/YearNavigator.svelte';
  import { openCreateModal, openCareerStatsModal, registerEffects } from './store';
  import { errorStore } from './store/state';

  onMount(() => {
    registerEffects();
  });
</script>

<div class="holidays-page">
  <Grid>
    <Row class="header-row">
      <Column lg={16}>
        <div class="page-header">
          <div class="header-content">
            <Calendar size={32} />
            <div class="header-text">
              <h1>My Holidays</h1>
              <p class="subtitle">Manage your time off and holiday requests</p>
            </div>
          </div>
          <div class="header-center">
            <YearNavigator hideRefresh={true} />
          </div>
          <div class="header-actions">
            <Button icon={UserCertification} size="field" class="career-button" on:click={openCareerStatsModal}>Career</Button>
            <Button icon={Add} size="field" on:click={openCreateModal}>New Request</Button>
          </div>
        </div>
      </Column>
    </Row>

    {#if $errorStore}
      <Row class="error-row">
        <Column lg={16}>
          <InlineNotification kind="warning" title="Backend Not Ready" subtitle={$errorStore} hideCloseButton />
        </Column>
      </Row>
    {/if}

    <Row class="stats-row">
      <Column lg={16}><RemainingDaysWidget /></Column>
    </Row>

    <Row class="table-row">
      <Column lg={16}>
        <Tile class="table-tile"><HolidaysGrid /></Tile>
      </Column>
    </Row>
  </Grid>
</div>

<HolidayRequestModal />
<HolidayEditModal />
<CareerStatsWidget />

<style>
  .holidays-page {
    background: var(--custom-bg-secondary);
    min-height: 100vh;
    margin: -1.5rem;
    padding: 1.5rem;
  }

  :global(.holidays-page .bx--grid) {
    padding: 0;
    max-width: 1400px;
    margin: 0 auto;
  }

  :global(.header-row) {
    margin-bottom: 1.25rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: var(--custom-bg);
    border: 1px solid var(--custom-border);
    border-radius: 8px;
    gap: 2rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-content :global(svg) {
    width: 32px;
    height: 32px;
    color: var(--cds-link-01, #0f62fe);
    flex-shrink: 0;
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .career-button {
    position: relative;
    animation: pulse 2.5s infinite ease-in-out 1s;
  }

  .career-button:focus {
    outline: 3px solid color-mix(in srgb, var(--cds-link-01, #0f62fe) 30%, transparent 70%);
    outline-offset: 2px;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(15,98,254,0.18); }
    70% { box-shadow: 0 0 0 12px rgba(15,98,254,0); }
    100% { box-shadow: 0 0 0 0 rgba(15,98,254,0); }
  }

  .header-text h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--custom-text);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .header-text .subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--custom-text-secondary);
    line-height: 1.3;
  }

  :global(.controls-row) {
    margin-bottom: 1rem;
    gap: 0.75rem;
  }

  :global(.stats-row) {
    margin-bottom: 1.25rem;
  }

  :global(.remaining-tile),
  :global(.year-tile),
  :global(.table-tile) {
    border-radius: 8px;
    border: 1px solid var(--custom-border);
  }

  :global(.year-tile) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem !important;
    background: var(--custom-bg);
  }

  :global(.table-tile) {
    padding: 0 !important;
    overflow: hidden;
    background: var(--custom-bg);
  }

  :global(.table-row) {
    margin-bottom: 1.25rem;
  }

  /* Improve notification spacing */
  :global(.holidays-page .bx--inline-notification) {
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .holidays-page {
      padding: 1rem;
      margin: -1rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
      padding: 1rem 1.25rem;
    }

    .header-content {
      width: 100%;
    }

    .header-center {
      width: 100%;
    }

    .header-text h1 {
      font-size: 1.25rem;
    }

    .header-text .subtitle {
      font-size: 0.8125rem;
    }

    :global(.stats-row),
    :global(.header-row) {
      margin-bottom: 0.75rem;
    }
  }
</style>
