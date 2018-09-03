import Vue from 'vue'
import Router from 'vue-router'
import HomeView from './views/home.vue'
import NewWalletView from './views/new-wallet.vue'
import ImportWalletView from './views/import-wallet.vue'
import WalletListView from './views/wallet-list.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new-wallet',
      name: 'new-wallet',
      component: NewWalletView
    },
    {
      path: '/import-wallet',
      name: 'import-wallet',
      component: ImportWalletView
    },
    {
      path: '/wallet-list',
      name: 'wallet-list',
      component: WalletListView
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
})
