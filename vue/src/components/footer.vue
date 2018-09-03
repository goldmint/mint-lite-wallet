<template>
	<b-container class="ph-3">
		<b-row id="version">
		<b-col class="text-center">v {{version}} ({{browser}}) / GoldMint, PTE, LTD © 2018</b-col>
		</b-row>
	</b-container>
</template>

<script>
export default {
  name: "footer-comp",

  data() {
    return {
      version: null,
      browser: null
    };
  },

  mounted() {
    this.version = this.$root.gm.version;
    this.browser = this.$root.gm.browser;
  }
};
</script>

<style lang="scss">
@import "../common.scss";

#version {
  color: rgb(179, 179, 179);
  font-family: monospace;
  font-size: 0.8rem;
}
</style>
