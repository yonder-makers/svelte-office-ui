<script lang="ts">
  import { onMount } from 'svelte';

  let today = new Date();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  
  // Calculate Easter date using the Meeus/Jones/Butcher algorithm.
  // This algorithm is accurate for Gregorian calendar years 1900-2099.
  // For years outside this range, the result may be incorrect.
  // It does not handle Julian calendar years (pre-1583) or years far in the future.
  // If called with years outside 1900-2099, the function will return a date, but its correctness is not guaranteed.
  function getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  let celebration = '';
  let emoji = '';

  onMount(() => {
    const year = today.getFullYear();
    const easterDate = getEasterDate(year);
    const easterMonth = easterDate.getMonth() + 1;
    const easterDay = easterDate.getDate();

    // Romania Day - December 1st
    if (month === 12 && day === 1) {
      celebration = 'Romania Day';
      emoji = '🇷🇴';
    }
    // Christmas - December 25th
    else if (month === 12 && day === 25) {
      celebration = 'Merry Christmas!';
      emoji = '🎄';
    }
    // Easter
    else if (month === easterMonth && day === easterDay) {
      celebration = 'Happy Easter!';
      emoji = '🐰';
    }
  });
</script>

{#if celebration}
  <div class="festive-container">
    <span class="emoji">{emoji}</span>
    <span class="text">{celebration}</span>
    <span class="emoji">{emoji}</span>
  </div>
{/if}

<style>
  .festive-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    font-weight: 500;
    font-size: 14px;
    animation: bounce 1s infinite;
  }

  .emoji {
    font-size: 20px;
  }

  .text {
    white-space: nowrap;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
</style>
