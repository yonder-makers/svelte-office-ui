<script lang="ts">
  import {
    Button,
    Link,
    Modal,
    Tab,
    TabContent,
    Tabs,
    CodeSnippet,
  } from 'carbon-components-svelte';
  import { UnorderedList, ListItem } from 'carbon-components-svelte';
  import { fetchCopilotPrompt } from '../../../apis/copilot.api';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open = false;

  let hintsRomanian = [
    'Salutare',
    'Câte ore am pe luna asta?',
    'Câte ore am pe taskul 12345?',
    'Câte ore am pe taskul 12345 pe data de 18?',
    'Adaugă 3 ore pe taskul 12345 pe data de 18',
    'Adaugă 2 ore pe taskul 12345 zilele de vineri',
    'Șterge toate orele de pe taskul 12345',
    'Șterge orele de pe taskul 12345 pe data de 18',
    'Mută orele de pe taskul 12345 pe taskul 42323',
    'În zilele pare adaugă câte 8 ore pe taskul 12345',
    'În zilele ce sunt numere prime adaugă câte 8 ore pe taskul 12345',
    'În ce zile nu am completat?',
    'Cine este cel mai bun programator din Yonder?',
    'Câte zile de concediu de odihnă?',
    'Câte zile de concediu legal am?',
    'Who is Mihai Eminescu?',
  ];

  let hintsEnglish = [
    'Hello',
    'How many hours do I have this month?',
    'How many hours do I have on task 12345?',
    'How many hours do I have on task 12345 on the 18th?',
    'Add 3 hours on task 12345 on the 18th',
    'Add 2 hours on task 12345 on Fridays',
    'Delete all hours on task 12345',
    'Delete hours on task 12345 on the 18th',
    'Move hours from task 12345 to task 42323',
    'On even days add 8 hours on task 12345',
    'On prime days add 8 hours on task 12345',
    'On what days did I not fill in?',
    'Who is the best programmer in Yonder?',
    'How many days of vacation?',
    'How many legal vacation days do I have?',
    'Who is Mihai Eminescu?',
  ];

  function onHintSelected(hint: string) {
    dispatch('hintSelected', hint);
    open = false;
  }

  let prompt = '';

  onMount(async () => {
    const result = await fetchCopilotPrompt();
    prompt = result.prompt;
  });
</script>

<Modal
  bind:open
  passiveModal 
  modalHeading="Get inspired"
  on:open
  on:close
>
  <Tabs>
    <Tab label="For Romanian" />
    <Tab label="For English" />
    <Tab label="Prompt under the hood" />
    <svelte:fragment slot="content">
      <TabContent>
        <UnorderedList style="padding: 24px">
          {#each hintsRomanian as hint}
            <ListItem>
              <Link
                style="cursor: pointer"
                on:click={() => onHintSelected(hint)}>{hint}</Link
              >
            </ListItem>
          {/each}
        </UnorderedList>
      </TabContent>
      <TabContent>
        <UnorderedList style="padding: 24px">
          {#each hintsEnglish as hint}
            <ListItem>
              <Link
                style="cursor: pointer"
                on:click={() => onHintSelected(hint)}>{hint}</Link
              >
            </ListItem>
          {/each}
        </UnorderedList>
      </TabContent>
      <TabContent>
        <CodeSnippet code={prompt} type="multi" wrapText />
      </TabContent>
    </svelte:fragment>
  </Tabs>
</Modal>

<style>
  :global(.bx--modal-content) {
    padding-right: 0 !important;
    margin-bottom: 0 !important;
  }
</style>
