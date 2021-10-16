<script lang="ts">
  import { format } from 'date-fns';
  import { goNextMonth, goPreviousMonth } from '../store/actions';

  import { currentMonth } from '../store/state';
</script>

<bx-btn on:click={goPreviousMonth} kind="primary" size icon-layout>
  <span slot="icon">-</span>
</bx-btn>

{format($currentMonth, 'yyyy MMM')}

<bx-btn on:click={goNextMonth} kind="primary" size icon-layout>
  <span slot="icon">+</span>
</bx-btn>
