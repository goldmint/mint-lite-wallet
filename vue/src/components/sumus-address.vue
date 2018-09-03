<template>
  <span>{{masked}}</span>
</template>

<script>
export default {
  name: "sumus-address-comp",
  props: {
    value: ""
  },

  data() {
    return {};
  },

  computed: {
    masked() {
      var addr = this.value;
      if (addr != null && addr.length >= 10) {
      addr =
        addr.substring(0, 6) +
        "..." +
        addr.substring(addr.length - 4, addr.length);
      }
      return addr;
    }
  }
};
</script>

