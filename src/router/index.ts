import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import AboutView from '@/pages/AboutView.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },

    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})
// 权限控制
let firstFetchLoginUser = true
router.beforeEach((to, from, next) => {
  const userStore = useLoginUserStore()
  if (firstFetchLoginUser) {
    firstFetchLoginUser = false
    userStore.fetchLoginUser()
  }

  if (to.fullPath.startsWith('/admin')) {
    if (!userStore.loginUser || userStore.loginUser.userRole !== 'admin') {
      message.warning('您没有权限访问该页面')
      next('/')
    }
  }
  next()
})

export default router