import Vue from 'vue'
import App from './app.vue'
import router from './router'

// bootstrap
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

// font awesome
import 'vue-awesome/icons'
import FaIcon from 'vue-awesome/components/Icon'
Vue.component('icon', FaIcon)

// ---

// storage
import { StorageData } from "./storage/data"
import { LocalStorage } from "./storage/local-storage"
import { ChromeStorage } from "./storage/chrome-storage"

var storageData = new StorageData();

if (process.env.NODE_ENV === "chrome") {
  storageData.setProvider(new ChromeStorage())
} else {
  storageData.setProvider(new LocalStorage())
}

// ---

// root data
var data = {
  gm: {
    version: process.env.VUE_APP_VERSION,
    env: process.env.NODE_ENV,
    browser: process.env.VUE_APP_TARGET_BROWSER,
    storage: storageData,
  }
}

// debug
Vue.config.productionTip = false
if (process.env.NODE_ENV === "development") {
  console.log(process.env)
}

// ---

storageData.load(() => {

  new Vue({
    router,
    render: h => h(App),
    data: data,
  }).$mount('#app')

});

