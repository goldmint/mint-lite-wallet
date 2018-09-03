<template>
  <div>
    <b-container id="header" class="p-3 mb-2">
      <b-row>
        <b-col class="text-left">
          <b-link to="/wallet-list" class="__title">
            <span v-if="title != null" title="Change wallet">{{title}}</span>
            <span v-else title="Create new wallet">Select a wallet...</span>
          </b-link>
        </b-col>
        <b-col class="text-right">
          <!-- <b-link variant="primary" size="sm" title="New wallet" to="/new-wallet">
            <icon name="plus" scale="1.25" />
          </b-link> -->
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import SumusAddressComp from "@/components/sumus-address.vue";

export default {
  name: "main-header-comp",
  props: {
    title: null
  },
  components: {
    SumusAddressComp
  }
};
</script>

<style lang="scss">
@import "../common.scss";

.__title {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
}
</style>
