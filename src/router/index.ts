import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import AboutView from '@/pages/AboutView.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/picture/PictureDetailPage.vue'
import BatchAddPicturePage from '@/pages/picture/BatchAddPicturePage.vue'
import UserSpace from '@/pages/space/UserSpace.vue'
import AddSpacePage from '@/pages/space/AddSpacePage.vue'
import SpaceDetailPage from '@/pages/space/components/SpaceDetailPage.vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import NoAuth from '@/pages/noAuth/NoAuth.vue'
import TeamSpace from '@/pages/space/TeamSpace.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 用户登录注册相关路由 - 使用 UserLayout
    {
      path: '/user',
      component: UserLayout,
      children: [
        {
          path: 'login',
          name: '用户登录',
          component: UserLoginPage,
        },
        {
          path: 'register',
          name: '用户注册',
          component: UserRegisterPage,
        },
      ],
    },
    // 主应用路由 - 使用 BasicLayout
    {
      path: '/',
      component: BasicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'picture/upload',
          name: '上传图片',
          component: AddPicturePage,
        },
        {
          path: 'admin/userManage',
          name: '用户管理',
          component: UserManagePage,
        },
        {
          path: 'user/space',
          name: '用户空间',
          component: UserSpace,
        },
        {
          path: 'team/space',
          name: '团队空间',
          component: TeamSpace,
        },
        {
          path: 'picture/:id',
          name: '图片详情',
          component: PictureDetailPage,
          props: true,
        },
        {
          path: 'admin/pictureManage',
          name: '图片管理',
          component: PictureManagePage,
        },
        {
          path: 'picture/batchUpload',
          name: '批量添加',
          component: BatchAddPicturePage,
        },
        {
          path: 'about',
          name: 'about',
          component: AboutView,
        },
        {
          path: 'add_space',
          name: '创建空间',
          component: AddSpacePage,
        },
        {
          path: 'space/:id',
          name: '空间详情',
          component: SpaceDetailPage,
          props: true,
        },
        {
          path: 'noAuth',
          name: '无权限',
          component: NoAuth,
        },
      ],
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
