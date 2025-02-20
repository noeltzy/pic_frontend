<template>
  <div class="global-header">
    <div class="title-bar" @click="router.push('/')">
      <img src="@/assets/logo.svg" alt="logo" />
      <div class="title">云图库</div>
    </div>
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @Click="doMenuClick" />
    <div v-if="userStore.loginUser.id !== undefined" class="user-info-bar">
      <a-dropdown>
        <div class="user-avatar-wrapper">
          <a-avatar :size="32" :src="userStore.loginUser.userAvatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span class="username">{{ userStore.loginUser.userName ?? '默认用户' }}</span>
        </div>
        <template #overlay>
          <a-menu class="user-dropdown-menu">
            <a-menu-item @click="goMySpace" key="profile">
              <UserOutlined />
              <span>个人信息</span>
            </a-menu-item>
            <a-menu-item key="settings">
              <SettingOutlined />
              <span>设置</span>
            </a-menu-item>
            <a-menu-divider class="compact-divider" />
            <a-menu-item key="logout" @click="handleLogout" class="logout-item">
              <LogoutOutlined />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div v-else class="user-login-bar">
      <a-button type="primary" @click="goToLogin">登录</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { userLogoutUsingPost } from '@/service/api/userController'
const current = ref<string[]>(['mail'])
const userStore = useLoginUserStore()
const goMySpace = () => {
  router.push('/user/space')
}
const baseMenuItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: '/picture/upload',
    label: '图片上传',
    title: '图片上传',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
    role: 'admin',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
    role: 'admin',
  },

  {
    key: '/others',
    label: h('a', { href: 'https://github.com/noeltzy', target: '_blank' }, '支持我'),
    title: '支持我',
  },
]

const filterMenuItems = (items = [] as typeof baseMenuItems) => {
  return items?.filter((item) => {
    if (item?.role === 'admin') {
      return userStore.loginUser.userRole === 'admin'
    }
    return true
  })
}
const items = computed(() => filterMenuItems(baseMenuItems))
const router = useRouter()
// 菜单路由跳转
const doMenuClick = ({ key }: { key: string }) => {
  console.log(key)
  router.push(key)
}
// 监听路由变化 更新菜单选中状态
router.afterEach((to) => {
  current.value = [to.path]
})

const goToLogin = () => {
  router.push('/user/login')
}

const handleLogout = async () => {
  try {
    const res = await userLogoutUsingPost()
    if (res.data?.code === 0) {
      message.success('退出登录成功')
      userStore.clearLoginUser()
    }
  } catch (error) {
    message.error('退出登录失败')
  } finally {
    await router.push('/user/login')
  }
}
</script>

<style scoped>
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.title-bar {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-right: -24px;
}

.title-bar:hover {
  opacity: 0.85;
}

.title-bar img {
  height: 32px;
  margin-right: 12px;
}

.title-bar .title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  letter-spacing: 0.5px;
}

:deep(.ant-menu) {
  line-height: 64px;
  border-bottom: none;
  flex: 1;
  margin-left: 48px;
}

.user-info-bar {
  margin-left: 24px;
}

.user-login-bar {
  margin-left: 24px;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-avatar-wrapper:hover {
  background: rgba(0, 0, 0, 0.025);
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

:deep(.user-dropdown-menu) {
  min-width: 120px;
  padding: 4px 0;
}

:deep(.user-dropdown-menu .ant-dropdown-menu-item) {
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.user-dropdown-menu .ant-dropdown-menu-item .anticon) {
  margin-right: 6px;
  font-size: 13px;
}

:deep(.user-dropdown-menu .compact-divider) {
  margin: 4px 0;
}

:deep(.user-dropdown-menu .logout-item) {
  color: #ff4d4f;
}

:deep(.user-dropdown-menu .logout-item:hover) {
  background-color: #fff1f0;
}
</style>
