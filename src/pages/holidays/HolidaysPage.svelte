<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Column, Grid, InlineNotification, Row, Tile } from 'carbon-components-svelte';
  import Add from 'carbon-icons-svelte/lib/Add.svelte';
  import Calendar from 'carbon-icons-svelte/lib/Calendar.svelte';
  import HolidaysGrid from './parts/HolidaysGrid.svelte';
  import HolidayRequestModal from './parts/HolidayRequestModal.svelte';
  import RemainingDaysWidget from './parts/RemainingDaysWidget.svelte';
  import CareerStatsWidget from './parts/CareerStatsWidget.svelte';
  import YearNavigator from './parts/YearNavigator.svelte';
  import { openCreateModal, registerEffects } from './store';
  import { errorStore } from './store/state';

  onMount(() => {
    registerEffects();
  });
</script>

<div class="holidays-page">
  <Grid>
    <!-- Header Section -->
    <Row class="header-row">
      <Column lg={16}>
        <div class="page-header">
          <div class="header-content">
            <div class="header-icon">
              <Calendar size={32} />
            </div>
            <div class="header-text">
              <h1>My Holidays</h1>
              <p class="subtitle">Manage your time off and holiday requests</p>
            </div>
          </div>
          <Button icon={Add} size="field" on:click={openCreateModal}>
            New Request
          </Button>
        </div>
      </Column>
    </Row>

    {#if $errorStore}
      <Row>
        <Column lg={16}>
          <InlineNotification
            kind="warning"
            title="Backend Not Ready"
            subtitle={$errorStore}
            hideCloseButton
          />
        </Column>
      </Row>
    {/if}

    <!-- Stats and Navigator Section -->
    <Row class="controls-row">
      <Column lg={5} md={4} sm={4}>
        <RemainingDaysWidget />
      </Column>
      <Column lg={11} md={4} sm={4}>
        <Tile class="year-tile">
          <YearNavigator />
        </Tile>
      </Column>
    </Row>

    <!-- Career Stats Section -->
    <Row class="career-row">
      <Column lg={16}>
        <CareerStatsWidget />
      </Column>
    </Row>

    <!-- Table Section -->
    <Row class="table-row">
      <Column lg={16}>
        <Tile class="table-tile">
          <HolidaysGrid />
        </Tile>
      </Column>
    </Row>
  </Grid>
</div>

<HolidayRequestModal />

<style>
  .holidays-page {
    background: var(--custom-bg-secondary);
    min-height: 100vh;
    margin: -2rem;
    padding: 2rem;
  }

  :global(.holidays-page .bx--grid) {
    padding: 0;
    max-width: 100%;
  }

  :global(.header-row) {
    margin-bottom: 1.5rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: var(--custom-bg);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #0f62fe 0%, #0353e9 100%);
    border-radius: 12px;
    color: white;
  }

  .header-text h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--custom-text);
    line-height: 1.2;
  }

  .header-text .subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--custom-text-secondary);
    line-height: 1.4;
  }

  :global(.controls-row) {
    margin-bottom: 1.5rem;
  }

  :global(.career-row) {
    margin-bottom: 1.5rem;
  }

  :global(.year-tile) {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 1.5rem !important;
  }

  :global(.table-tile) {
    padding: 0 !important;
    overflow: hidden;
  }

  :global(.table-row) {
    margin-bottom: 2rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .holidays-page {
      padding: 1rem 0;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .header-content {
      width: 100%;
    }

    .header-text h1 {
      font-size: 1.5rem;
    }
  }
</style>
