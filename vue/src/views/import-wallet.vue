<template>
  <div>
    <header-comp title="Import wallet"/>
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
          <b-form-input
            size="sm"
            type="password"
            placeholder="Private key"
            :state="privateKeyValid"
            v-model="privateKey"
            @input="privateKeyValid = null"
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button
            variant="primary"
            size="sm"
            block
            @click="importw()"
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
  name: "import-wallet",
  components: {
    HeaderComp,
  },
  
  data() {
    return {
      name: null,
      nameValid: null,
      privateKey: null,
      privateKeyValid: null
    };
  },

  methods: {
    importw() {
      // validate name
      if (this.name == null || this.name.trim() === "") {
        this.nameValid = false;
        return;
      }
      // validate pk
      if (this.privateKey == null) {
        this.privateKeyValid = false;
        return;
      }

      this.name = this.name.trim();
      console.log("Import new wallet with name", this.name);

      // unpack pk
      var pkBytes = base58.unpack(this.privateKey)
      if (pkBytes == null) {
        this.privateKeyValid = false;
        return;
      }

      // get public from prehashed pk
      var publicKey = base58.pack(nacl.sign.keyPair.publicFromPrehashedSecretKey(pkBytes));

      // add new wallet
      var id = this.$root.gm.storage.addWallet(this.name, this.privateKey, publicKey);
      this.$root.gm.storage.setCurrentWallet(id);

      // cleanup
      this.name = null;
      this.nameValid = null;
      this.privateKey = null;
      this.privateKeyValid = null;
      
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss">
  @import "../common.scss";
</style>