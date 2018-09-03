<template>
  <div>
    <main-header-comp :title="walletName"/>
    <b-container class="p-3">

      <b-row v-if="walletID == null">
        <b-col>
          <b-button
            variant="primary"
            size="sm"
            block
            to="/new-wallet"
          >Add wallet</b-button>
        </b-col>
      </b-row>

      <template v-else>
        <b-row class="mb-2">
          <b-col class="__row">
            <div class="__left">Address</div>
            <div class="__right __mono">
              <sumus-address-comp :value="walletAddress"/>
              <b-link size="sm" title="Copy" @click="copyPublicKey()"><icon name="copy" scale="1" class="ml-2"/></b-link>
            </div>
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col class="__row">
            <div class="__left">Utility</div>
            <div class="__right __mono">?</div>
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col class="__row">
            <div class="__left">Commodity</div>
            <div class="__right __mono">?</div>
          </b-col>
        </b-row>

        <b-row class="mb-4 mt-2">
          <b-col class="__row" style="font-size: 0.8rem;">
            <b-link @click="copyPrivateKey()">Copy PK</b-link>
          </b-col>
        </b-row>
      </template>

    </b-container>
  </div>
</template>

<script>
import MainHeaderComp from "@/components/main-header.vue";
import SumusAddressComp from "@/components/sumus-address.vue";

export default {
  name: "home",
  components: {
    MainHeaderComp,
    SumusAddressComp
  },

  data() {
    return {
      walletID: null,
      walletName: null,
      walletAddress: null,
      walletPrivateKey: null,
    };
  },

  mounted() {
    var w = this.$root.gm.storage.getCurrentWallet();
    if (w != null) {
      this.walletID = w.id;
      this.walletName = w.name;
      this.walletAddress = w.publicKey;
      this.walletPrivateKey = w.privateKey;
    }
  },

  methods: {

    copyPublicKey() {
      var data = this.walletAddress;
      document.oncopy = function(event) {
        event.clipboardData.setData("text/plain", data);
        event.preventDefault();
      };
      document.execCommand("copy", false, null);
    },

    copyPrivateKey() {
      var data = this.walletPrivateKey;
      document.oncopy = function(event) {
        event.clipboardData.setData("text/plain", data);
        event.preventDefault();
      };
      document.execCommand("copy", false, null);
    }
  }
};
</script>

<style lang="scss">
@import "../common.scss";

.__row {
  display: flex;
  justify-content: space-between;

  .__left {
    white-space: nowrap;
    overflow: hidden;
    max-width: 40%;
    text-overflow: ellipsis;
  }
  .__right {
    white-space: nowrap;
    overflow: hidden;
    max-width: 60%;
    text-overflow: ellipsis;
  }
}

.__mono {
  font-family: monospace;
  font-size: 1.2rem;
}

</style>