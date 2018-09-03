<template>
  <div id="well">
    <div id="app">
      <router-view/>
    </div>
    <div id="footer">
      <footer-comp/>
    </div>
  </div>
</template>

<script>
import FooterComp from "@/components/footer.vue";

export default {
  name: "app",
  components: {
    FooterComp,
  },
};
</script>

<style lang="scss">
  @import 'common.scss';
  @import 'bootstrap/scss/bootstrap.scss';
  //@import 'bootstrap-vue/dist/bootstrap-vue.css';

  #well {
    width: 100%;
    background: $page_background;
  }
  #app {
    background: $page_material;
	  min-height: $extension_height;
    max-width: $extension_width;
    margin: 0 auto;
    color: $white;
  }
  #footer {
    max-width: $extension_width;
    height: $extension_footer_height;
    line-height: $extension_footer_height;
	  margin: 0 auto;
    background: $page_material;
  }
  
</style>
