<!-- BaseModal.vue -->

<template>
  <div class="base-modal">
    <div
      class="base-modal-sub"
    ></div>

    <div class="base-modal-sub2">
      <div
        class="container"
      >
        <div
          @click="$emit('close')"
          :class="customClass"
          class="container-2"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    customClass: {
      type: String,
      default: "dark:bg-black dark:border-[#054F36] dark:shadow dark:border",
    },
  },
};
</script>

<style scoped>
.base-modal{
  z-index: 1000;
}
.base-modal-sub{
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.base-modal-sub2{
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
}
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem; /* Adjust the padding as needed */
  text-align: center;
}

@media (min-width: 640px) {
  .container {
    padding: 0; /* Remove padding on small screens */
  }
}
.container-2{
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Adjust shadow properties as needed */
  padding: 0.5rem; /* Adjust padding as needed */
  overflow-x: auto;
  text-align: left;
  overflow: hidden;
  transform: all 0.3s ease; /* Adjust transition properties as needed */
  margin-top: 2rem; /* Adjust margin-top as needed */
  border-radius: 0.75rem; /* Adjust border-radius as needed */
}
@media (min-width: 640px) {
  .container-2 {
    margin-top: 2rem; /* Adjust margin-top for small screens */
  }
}
/* .base-modal {
  z-index: 1000;
}



.base-modal .backdrop {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.base-modal .modal-wrapper {
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

.base-modal .modal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  text-align: center;
}

.base-modal .modal-inner {
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.5rem;
  overflow-x: auto;
  text-align: left;
  overflow: hidden;
  transform: translateZ(0);
  transition: all 0.3s;
}

.base-modal .modal-inner.dark-mode {
  background-color: #000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #054F36;
} */

</style>
