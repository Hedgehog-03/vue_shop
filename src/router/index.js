import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},  //路由重定向
  {path: '/login', component: Login},
  {path: '/home', component: Home}
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from代表从哪个路径跳转而来
  //next放行函数
  //next()放行 或 next('/login')强制跳转
  if (to.path === '/login') return next();
  //获取token
  const tonkenStr = window.sessionStorage.getItem('token');
  if (!tonkenStr) return next('/login');
  next();
})

export default router
