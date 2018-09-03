<template>
  <div>
    <header-comp title="Wallets"/>
    <b-container class="p-3">

      <b-row v-for="item in wallets" class="mb-3">
        <b-col>
          <b-link 
            @click="selectWallet(item.id)"
            block
            class="__row"
          >
            <div class="__left">
              {{item.name}}
            </div>
            <div class="__right __mono">
              <sumus-address-comp v-bind:value="item.publicKey"/>
            </div>
          </b-link>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-button
            variant="primary"
            size="sm"
            block
            to="/new-wallet"
          >Add wallet</b-button>
        </b-col>
      </b-row>

    </b-container>
  </div>
</template>

<script>
import HeaderComp from "@/components/header.vue";
import SumusAddressComp from "@/components/sumus-address.vue";

export default {
  name: "wallet-list",
  components: {
    HeaderComp,
    SumusAddressComp
  },

  data() {
    return {
      wallets: []
    };
  },

  mounted() {
    var w = this.$root.gm.storage.getWallets();
    if (w != null) {
      this.wallets = w;
    }
  },

  methods: {
    selectWallet(id) {
      this.$root.gm.storage.setCurrentWallet(id);
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss">

.__row {
  display: flex;
  justify-content: space-between;

  .__left {
    white-space: nowrap;
    overflow: hidden;
    max-width: 50%;
    text-overflow: ellipsis;
  }
  .__right {
    white-space: nowrap;
    overflow: hidden;
    max-width: 50%;
  }
}

.__mono {
  font-family: monospace;
  font-size: 1.2rem;
}
</style>