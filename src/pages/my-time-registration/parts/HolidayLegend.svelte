<div class="legend">
  <div class="legend-item">
    <span class="legend-color pending"></span>
    <span class="legend-label">Pending Holiday</span>
  </div>
  <div class="legend-item">
    <span class="legend-color approved"></span>
    <span class="legend-label">Approved Holiday</span>
  </div>
  <div class="legend-item">
    <span class="legend-color legal"></span>
    <span class="legend-label">Legal Holiday</span>
  </div>
</div>

<style>
  .legend {
    display: inline-flex;
    gap: 1.5rem;
    padding: 0.75rem 1rem;
    background-color: var(--cds-ui-02, #f4f4f4);
    border: 1px solid var(--cds-ui-03, #e0e0e0);
    border-radius: 4px;
    font-size: 0.875rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Dark theme support */
  :global([data-carbon-theme='g90']) .legend,
  :global([data-carbon-theme='g100']) .legend {
    background-color: var(--cds-ui-02, #393939);
    border-color: var(--cds-ui-03, #525252);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-label {
    font-weight: 500;
    color: var(--cds-text-01, #161616);
  }

  :global([data-carbon-theme='g90']) .legend-label,
  :global([data-carbon-theme='g100']) .legend-label {
    color: var(--cds-text-01, #f4f4f4);
  }

  .legend-color {
    width: 1.25rem;
    height: 1.25rem;
    display: inline-block;
    border-radius: 3px;
    border: 2px solid;
    flex-shrink: 0;
  }

  .legend-color.pending {
    background-color: rgba(255, 165, 0, 0.3);
    border-color: orange;
  }

  .legend-color.approved {
    background-color: rgba(0, 128, 255, 0.3);
    border-color: #0080ff;
  }

  .legend-color.legal {
    background-color: rgba(0, 128, 0, 0.3);
    border-color: green;
  }
</style>
