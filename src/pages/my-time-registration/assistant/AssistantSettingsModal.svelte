<script lang="ts">
    import { Modal, Select, SelectItem, Toggle } from 'carbon-components-svelte';
    import { availableLanguages } from '../constants/languages';
    import { assistantLanguageCode, isHeyYondereOn, isSpeakResponseOn, isAutoListenOn } from '../store/selectors';
    import { get, writable } from 'svelte/store';
    import { saveAssistantSettings } from '../store';
    import type { AssistantSettings } from '../models';
    import { Languages } from '../enums/languages.enum';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();

    export let open = false;
    const selectedLanguageCode = writable<Languages>(get(assistantLanguageCode));
    const isSpeakResponsesOn = writable<boolean>(get(isSpeakResponseOn));
    const isAutoListenQuestionsOn = writable<boolean>(get(isAutoListenOn));
    const isHelloYonderOn = writable<boolean>(get(isHeyYondereOn));

    selectedLanguageCode.subscribe((languageCode) => {
      if (languageCode === Languages.Romanian) {
        isSpeakResponsesOn.set(false);
        isHelloYonderOn.set(false);
      }
    })

    function reset(): void {
      open = false;
      selectedLanguageCode.set(get(assistantLanguageCode));
      isHelloYonderOn.set(get(isHeyYondereOn));
      isSpeakResponsesOn.set(get(isSpeakResponseOn));
      dispatch('close');
    }

    function submit(): void {
      open = false;
      const newSettings: AssistantSettings = {
        languageCode: get(selectedLanguageCode),
        isSpeakResponse: get(isSpeakResponsesOn),
        isAutoListen: get(isAutoListenQuestionsOn),
        isHeyYonder: get(isHelloYonderOn)
      };
      saveAssistantSettings(newSettings);
    }
</script>

<Modal
  bind:open
  modalHeading="Assistant Settings"
  secondaryButtonText="Cancel"
  primaryButtonText="Save"
  on:click:button--secondary={reset}
  on:open
  on:close={reset}
  on:submit={submit}
>
  <div class="form-container">    
    <Select labelText="Select language" bind:selected={$selectedLanguageCode}>
      {#each availableLanguages as languageId}
        <SelectItem value={languageId} text={languageId.toUpperCase()} />          
      {/each}
    </Select>
    <div class="toggle-field">
      <Toggle
        disabled={$selectedLanguageCode === Languages.Romanian}
        labelText="Speak responses"
        bind:toggled={$isSpeakResponsesOn}
      />
    </div>
    <div class="toggle-field">
      <Toggle
          labelText="Automatically listen for questions after response"
          bind:toggled={$isAutoListenQuestionsOn}
        />
      </div>
    <div class="toggle-field">
      <Toggle
          disabled
          labelText="Use 'Hey Yonder' feature (Experimental)"
          bind:toggled={$isHelloYonderOn}
        />
      </div>
  </div>
</Modal>

<style>
  .form-container {
    padding: 0 16px 24px 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .toggle-field {
    padding-bottom: 8px;
  }
</style>