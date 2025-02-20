<template>
  <a-layout-sider
    v-if="userStore.loginUser.userName != '未登录'"
    v-model:collapsed="collapsed"
    :trigger="null"
    collapsible
  >
    <div class="logo" />
    <a-menu @click="onMenuClick" v-model:selectedKeys="selectedKeys" theme="light" mode="inline">
      <a-menu-item key="/">
        <user-outlined />
        <span>公共图库</span>
      </a-menu-item>
      <a-menu-item key="/user/space">
        <video-camera-outlined />
        <span>个人空间</span>
      </a-menu-item>
      <!-- <a-menu-item key="/">
        <upload-outlined />
        <span>团队空间</span>
      </a-menu-item> -->
    </a-menu>
  </a-layout-sider>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'

const selectedKeys = ref<string[]>(['/'])
const collapsed = ref<boolean>(false)
const userStore = useLoginUserStore()
const router = useRouter()
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path]
})

const onMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}
</script>
<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}
</style>
