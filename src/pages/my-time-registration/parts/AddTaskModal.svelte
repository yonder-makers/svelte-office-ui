<script lant="ts">
  export let open = false;

  function onClose() {
    console.log('closed');
  }
</script>

<bx-modal {open} size="lg" on:bx-modal-closed={onClose}>
  <bx-modal-header>Add new task</bx-modal-header>
  <bx-modal-body>Some body here</bx-modal-body>
  <bx-modal-footer>
    <bx-btn icon-layout size kind="secondary">Cancel</bx-btn>
    <bx-btn icon-layout kind="primary">Add</bx-btn>
  </bx-modal-footer>
</bx-modal>
