<script lang="ts">
  import { format } from 'date-fns';

  export let day: Date;
</script>

<bx-table-header-cell>
  <div>
    <span>
      {format(day, 'd')}
    </span>
    <i>{format(day, 'EEE')}</i>
  </div>
</bx-table-header-cell>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  i {
    font-size: smaller;
  }
</style>
