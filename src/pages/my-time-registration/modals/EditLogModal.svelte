<script lang="ts">
  import {
    Form,
    FormGroup,
    Modal,
    TextInput,
    Toggle,
  } from 'carbon-components-svelte';
  import { tick } from 'svelte';
  import TypOfWorkComboBox from '../parts/TypOfWorkComboBox.svelte';
  import { escapeKeyPressed } from '../store/actions';
  import { editingLog, isEditLogModalOpen, save } from './edit-log-modal.state';

  let isValid = true;

  let hoursInput: HTMLInputElement;

  async function onOpen() {
    await tick();
    hoursInput.focus();
    hoursInput.setSelectionRange(0, hoursInput.value.length);
  }

  function onClose(ev: CustomEvent) {
    escapeKeyPressed();
  }

  function onSubmit(ev: CustomEvent) {
    save();
  }
</script>

<Modal
  open={$isEditLogModalOpen}
  preventCloseOnClickOutside={true}
  modalHeading="Add a new task"
  primaryButtonText="Save"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={!isValid}
  on:open={onOpen}
  on:close={onClose}
  on:submit={onSubmit}
  on:click:button--secondary={onClose}
>
  <Form on:submit>
    <FormGroup>
      <TypOfWorkComboBox
        bind:selectedIndex={$editingLog.selectedTypeOfWorkIndex}
      />
      <TextInput
        labelText="Hours"
        bind:ref={hoursInput}
        bind:value={$editingLog.hours}
        placeholder="Hours"
      />
      <TextInput
        labelText="Description"
        bind:value={$editingLog.description}
        placeholder="Description"
      />
    </FormGroup>
    <FormGroup>
      <Toggle
        labelText="Work from home"
        bind:toggled={$editingLog.isWorkFromHome}
      />
    </FormGroup>
    {#if $editingLog.isWorkFromHome}
      <FormGroup>
        <TextInput
          labelText="Work day started"
          placeholder="Enter when have you started working"
          bind:value={$editingLog.workFromHomeStarted}
        />
      </FormGroup>
    {/if}
  </Form>
</Modal>
