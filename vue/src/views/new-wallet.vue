<template>
  <div>
    <header-comp title="New wallet"/>
    <b-container class="p-3">
      <b-row class="mb-2">
        <b-col>
          <b-form-input 
            size="sm"
            type="text"
            placeholder="New wallet name"
            :state="nameValid"
            v-model="name"
            @input="nameValid = null"
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col>
          <b-button
            variant="primary"
            size="sm"
            block
            @click="generate()"
          >Generate</b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button
            variant="primary"
            size="sm"
            block
            to="/import-wallet"
          >Import</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import HeaderComp from "@/components/header.vue";
import nacl from "./../sumus/nacl.js"
import base58 from "./../sumus/base58.js"

export default {
  name: "new-wallet",
  components: {
    HeaderComp,
  },

  data() {
    return {
      name: null,
      nameValid: null
    };
  },

  methods: {
    generate() {
      // validate name
      if (this.name == null || this.name.trim() === "") {
        this.nameValid = false;
        return;
      }

      this.name = this.name.trim();
      console.log("Generate new wallet with name", this.name);

      // generate
      var pair = nacl.sign.keyPair();
      // prehash pk
      var pkPrehashed = nacl.sign.keyPair.prehashSecretKey(pair.secretKey)
      // pack pk
      var newPrivate = base58.pack(pkPrehashed);
      // get and pack public
      var newPublic = base58.pack(nacl.sign.keyPair.publicFromPrehashedSecretKey(pkPrehashed));

      // add new wallet
      var id = this.$root.gm.storage.addWallet(this.name, newPrivate, newPublic);
      this.$root.gm.storage.setCurrentWallet(id);

      // cleanup
      this.name = null;
      this.nameValid = null;
      
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss">
  @import "../common.scss";
</style>