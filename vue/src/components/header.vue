<template>
  <div>
    <b-container id="header" class="p-3 mb-2">
      <b-row>
        <b-col class="text-left">{{title}}</b-col>
        <b-col class="text-right">
          <b-link variant="primary" size="sm" title="Close" to="/">
            <icon name="times" scale="1.25" />
          </b-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "header-comp",
  props: {
    title: ""
  }
};
</script>

<style lang="scss">
@import "../common.scss";
</style>
