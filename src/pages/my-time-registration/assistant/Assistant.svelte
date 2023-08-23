<script lang="ts">
  import { Button, TextArea, Loading } from 'carbon-components-svelte';
  import { readable, derived, writable, get } from 'svelte/store';
  import type { ServiceLayerActions, TimeLog } from './service-layer';
  import { ServiceLayer, formatAssistantDate } from './service-layer';
  import { map, sortBy } from 'lodash';
  import type { LogId } from '../store';
  import {
    currentMonthState,
    logEntries,
    selectedLogs,
    submitHours,
    typesOfWork,
  } from '../store';
  import { format, isSameMonth } from 'date-fns';

  let messagesRef: any = undefined;

  let isLoading = false;

  let question = '';
  let messages = writable<
    {
      who: 'user' | 'bot' | 'code';
      message: string;
    }[]
  >([]);

  $: if (messagesRef) {
    console.log('Scrolling to bottom', $messages.length);
    setTimeout(() => {
      messagesRef.scroll({
        top: messagesRef.scrollHeight + 200,
        behavior: 'smooth',
      });
    }, 100);
  }

  const timeLogs = derived(logEntries, (entries) => {
    return entries.map((l) => {
      return {
        id: l.uid,
        date: formatAssistantDate(l.date),
        hours: l.hours,
        taskNumber: l.taskId,
      };
    });
  });

  async function getAnswer(question: string) {
    const response = await fetch('http://localhost:8000/ask?q=' + question);
    const content = await response.json();
    return content.output;
  }

  function createExecutionPlan(serviceLayer: ServiceLayer, answer: string) {
    'use strict';
    console.log('Executing: ', answer);
    eval(answer);
  }

  function cleanupJS(answer: string) {
    console.log('Raw response: ', answer);
    if (answer.startsWith('```javascript')) {
      answer = answer.substring(14, answer.length - 3);
    }

    answer = answer.replace(/(?:\\[rn])+/g, '\n');
    answer = answer.trim();
    while (true) {
      const newAnswer = answer.replace('\\"', '"');
      if (newAnswer === answer) {
        break;
      }
      answer = newAnswer;
    }

    answer = answer.replace('const serviceLayer = new ServiceLayer();', '');
    return answer;
  }

  async function addTimeLog(taskNumber: number, date: Date, hours: number) {
    const logId: LogId = {
      day: date,
      status: 'selected',
      taskId: taskNumber,
    };

    console.info('Adding time log: ', taskNumber, date, hours);

    if (!isSameMonth(logId.day, get(currentMonthState))) {
      return;
    }

    selectedLogs.set([logId]);

    const typeOfWork = get(typesOfWork)[0].key;
    await submitHours(typeOfWork, hours, 'imported by the assistant', true, 8);
  }

  async function updateTimeLog(id: string, hours: number) {
    const logEntryToDelete = get(logEntries).find((l) => l.uid === id);
    const logId: LogId = {
      day: logEntryToDelete.date,
      status: 'selected',
      taskId: logEntryToDelete.taskId,
    };

    console.info(
      'Updating time log: ',
      logId.taskId,
      formatAssistantDate(logId.day),
      logEntryToDelete.hours,
    );

    if (!isSameMonth(logId.day, get(currentMonthState))) {
      return;
    }

    selectedLogs.set([logId]);

    const typeOfWork = get(typesOfWork)[0].key;
    await submitHours(typeOfWork, hours, 'imported by the assistant', true, 8);
  }

  async function deleteTimeLog(id: string) {
    const logEntryToDelete = get(logEntries).find((l) => l.uid === id);
    const logId: LogId = {
      day: logEntryToDelete.date,
      status: 'selected',
      taskId: logEntryToDelete.taskId,
    };

    console.info(
      'Deleting time log: ',
      logId.taskId,
      formatAssistantDate(logId.day),
      logEntryToDelete.hours,
    );

    if (!isSameMonth(logId.day, get(currentMonthState))) {
      return;
    }

    selectedLogs.set([logId]);

    const typeOfWork = get(typesOfWork)[0].key;
    await submitHours(typeOfWork, 0, 'imported by the assistant', true, 8);
  }

  async function playAction(action: ServiceLayerActions) {
    switch (action.type) {
      case 'add-or-update-time-log':
        await addTimeLog(action.taskNumber, action.date, action.hours);
        break;

      case 'delete-time-log':
        await deleteTimeLog(action.id);
        break;

      case 'print-message':
        addMessage(action.message, 'bot');
        break;
      case 'update-time-log':
        await updateTimeLog(action.id, action.hours);
        break;

      default: {
        console.warn('Unknown action: ', action);
      }
    }
  }

  async function playActions(actions: ServiceLayerActions[]) {
    for (const action of actions) {
      await playAction(action);
    }
  }

  function addMessage(message: string, who: 'bot' | 'user' | 'code') {
    messages.update((old) => {
      return [...old, { message, who }];
    });
  }

  async function submit() {
    const q = question.trim();
    question = '';
    addMessage(q, 'user');
    const currentLogs = get(timeLogs);
    const facade = new ServiceLayer([...currentLogs]);

    isLoading = true;
    try {
      const rawJsToExecute = await getAnswer(q);
      const jsToExecute = cleanupJS(rawJsToExecute);
      addMessage(jsToExecute, 'code');

      createExecutionPlan(facade, jsToExecute);

      await playActions(facade.actions);
    } catch (e) {
      addMessage(e.message, 'bot');
      question = q;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container">
  <h3>Svelte Copilot</h3>
  <ul bind:this={messagesRef} class="messages">
    {#each $messages as message}
      <li class={message.who}>
        <pre>
          {message.message}
        </pre>
      </li>
    {/each}
  </ul>
  <div class="footer">
    <TextArea
      multiple={true}
      bind:value={question}
      placeholder="Enter your question"
      on:keyup={(ev) => {
        if (ev.key === 'Enter') {
          submit();
        }
      }}
    />

    <Button on:click={submit}>
      {#if isLoading}
        <Loading withOverlay={false} small />
      {/if}
      Ask
    </Button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
  }
  .messages {
    background-color: rgb(224, 224, 224);
    flex: 1 1 auto;
    font-size: 30;
    overflow-y: scroll;
    padding: 8px;
    display: flex;
    flex-direction: column;
  }
  .bot,
  .user,
  .code {
    border: 1px solid gray;
    border-radius: 4px;
    margin-bottom: 4px;
    padding: 4px;
  }
  .bot {
    background-color: turquoise;
    max-width: 80%;
    align-self: flex-start;
  }
  .user {
    background-color: rgb(63, 212, 115);
    text-align: right;
    max-width: 80%;
    align-self: flex-end;
  }
  .code {
    background-color: rgba(255, 245, 245, 0.753);
    text-align: left;
    font-style: italic;
  }
  pre {
    white-space: pre-wrap;
    display: flex;
  }
  .footer {
    flex: 0 0 auto;
  }
</style>
