<script lang="ts">
  import {
    ComboBox,
    Form,
    FormGroup,
    Modal,
    TextInput,
    Toggle,
  } from 'carbon-components-svelte';
  import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox';
  import { tick } from 'svelte';
  import { escapeKeyPressed } from '../store/actions';
  import {
    editingLog,
    isEditLogModalOpen,
    save,
    typesOfWorkComboItems,
  } from './edit-log-modal.state';

  let isValid = true;

  let hoursInput: HTMLInputElement;

  function typeOfWorkString(typeOfWork: ComboBoxItem) {
    return `${typeOfWork.id} (${typeOfWork.text})`;
  }

  function typeOfWorkFilter(typeOfWork: ComboBoxItem, value: string) {
    value = value.toLocaleLowerCase();
    if (typeOfWork.id.toLocaleLowerCase().indexOf(value) >= 0) return true;
    if (typeOfWork.text.toLocaleLowerCase().indexOf(value) >= 0) return true;
    return false;
  }

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
>
  <Form on:submit>
    <FormGroup>
      <ComboBox
        items={$typesOfWorkComboItems}
        titleText="Type of work"
        placeholder="Select the type of work"
        itemToString={typeOfWorkString}
        shouldFilterItem={typeOfWorkFilter}
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

<style>
  :global(.bx--combo-box) {
    border-bottom: 0 !important; /* this is a bug in Carbon, it shows 2 bottom borders for some reason */
  }
</style>
