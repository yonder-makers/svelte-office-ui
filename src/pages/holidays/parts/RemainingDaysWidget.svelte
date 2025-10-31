<script lang="ts">
  import { Tile, SkeletonText } from 'carbon-components-svelte';
  import { remainingDaysStore, loadingRemainingStore } from '../store/state';

  $: remaining = $remainingDaysStore.remaining;
  $: total = $remainingDaysStore.total;
  $: used = $remainingDaysStore.used;
  $: pending = $remainingDaysStore.pending;
  $: loading = $loadingRemainingStore;

  $: percentage = total > 0 ? (remaining / total) * 100 : 0;
  $: statusClass =
    percentage > 50 ? 'status-good' : percentage > 25 ? 'status-warning' : 'status-low';
</script>

<Tile class="remaining-tile">
  <div class="remaining-widget">
    {#if loading}
      <SkeletonText />
    {:else}
      <div class="compact-balance">
        <div class="balance-header">
          <h3 class="widget-title">Holiday Balance</h3>
        </div>
        
        <div class="balance-stats">
          <div class="stat-item primary">
            <span class="stat-value {statusClass}">{remaining.toFixed(1)}</span>
            <span class="stat-label">Available</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{used.toFixed(1)}</span>
            <span class="stat-label">Used</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{pending.toFixed(1)}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{total.toFixed(1)}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        
        <div class="progress-bar-compact">
          <div class="progress-fill {statusClass}" style="width: {percentage}%"></div>
        </div>
      </div>
    {/if}
  </div>
</Tile>

<style>
  .remaining-widget {
    padding: 0.5rem 0;
  }

  .compact-balance {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .balance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .widget-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #161616;
  }

  .balance-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
  }

  .stat-item.primary .stat-value {
    font-size: 2rem;
    font-weight: 700;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #161616;
    line-height: 1;
  }

  .stat-value.status-good {
    color: #24a148;
  }

  .stat-value.status-warning {
    color: #f1c21b;
  }

  .stat-value.status-low {
    color: #da1e28;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6f6f6f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-divider {
    width: 1px;
    height: 2.5rem;
    background: #e0e0e0;
  }

  .progress-bar-compact {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease, background-color 0.3s ease;
  }

  .progress-fill.status-good {
    background: linear-gradient(90deg, #24a148 0%, #42be65 100%);
  }

  .progress-fill.status-warning {
    background: linear-gradient(90deg, #f1c21b 0%, #fdd13a 100%);
  }

  .progress-fill.status-low {
    background: linear-gradient(90deg, #da1e28 0%, #fa4d56 100%);
  }

  .days-display .number {
    text-align: center;
    margin-bottom: 1rem;
  }

  .days-display .number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .days-display .label {
    font-size: 0.875rem;
    color: #6f6f6f;
  }

  .days-display.status-good .number {
    color: #24a148;
  }

  .days-display.status-warning .number {
    color: #f1c21b;
  }

  .days-display.status-low .number {
    color: #da1e28;
  }

  .circular-chart {
    display: block;
    margin: 0 auto;
    max-width: 120px;
  }

  .circle-bg {
    fill: none;
    stroke: #e0e0e0;
    stroke-width: 3.8;
  }

  .circle {
    fill: none;
    stroke-width: 3.8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }

  .circle.high {
    stroke: #24a148;
  }

  .circle.medium {
    stroke: #f1c21b;
  }

  .circle.low {
    stroke: #da1e28;
  }

  .circle-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .percentage {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .percentage-label {
    font-size: 0.875rem;
    color: #6f6f6f;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: #f4f4f4;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6f6f6f;
  }
</style>
