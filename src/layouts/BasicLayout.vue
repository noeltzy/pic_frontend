<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh">
      <!-- 固定顶部 - 非登录页面显示 -->
      <a-layout-header v-if="!isLoginPage"><GlobalHeader /></a-layout-header>

      <!-- 内容区域 -->
      <a-layout>
        <!-- 侧边栏 - 仅登录用户可见 -->
        <a-layout-sider v-if="loginUserStore.loginUser.id" class="side">
          <GlobalSider />
        </a-layout-sider>

        <!-- 主内容区 -->
        <a-layout>
          <a-layout-content
            :class="[
              'content',
              {
                'no-sider': !loginUserStore.loginUser.id,
                'no-header': isLoginPage,
              },
            ]"
          >
            <RouterView />
          </a-layout-content>

          <!-- 页脚 -->
          <a-layout-footer
            :class="[
              'footer',
              {
                'no-sider': !loginUserStore.loginUser.id,
                'no-header': isLoginPage,
              },
            ]"
          >
            <a href="https://github.com/noeltzy" target="_blank">
              <a-space>
                <GithubOutlined />
                By 程序员 Noel
              </a-space>
            </a>
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalSider from '@/components/GlobalSider.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import { GithubOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRoute } from 'vue-router'
import { computed, watchEffect } from 'vue'

// 获取用户登录状态
const loginUserStore = useLoginUserStore()

// 获取路由信息
const route = useRoute()

// 判断是否为登录页面
const isLoginPage = computed(() => {
  const loginPaths = ['/user/login', '/user/register', '/login', '/register']
  return loginPaths.includes(route.path)
})

// 调试用：监听路由变化
watchEffect(() => {
  console.log('Current route path:', route.path)
  console.log('Is login page:', isLoginPage.value)
})
</script>

<style scoped>
#basic-layout .ant-layout {
  background: #f5f5f5;
}

#basic-layout .ant-layout-header {
  background: #fff;
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  z-index: 1000;
}

#basic-layout .ant-layout-sider {
  background: #fff;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: calc(100vh - 64px);
  left: 0;
  top: 64px;
  z-index: 100;
}

#basic-layout .content {
  margin-left: 200px; /* 侧边栏宽度 */
  padding: 84px 24px 24px;
  min-height: calc(100vh - 64px - 69px); /* 减去头部和底部高度 */
  background: #f5f5f5;
  transition: all 0.3s ease;
}

#basic-layout .content.no-sider {
  margin-left: 0;
}

#basic-layout .content.no-header {
  padding-top: 0; /* 移除顶部padding */
  min-height: calc(100vh - 69px);
}

#basic-layout .content-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: 100%; /* 确保容器高度填满 */
}

#basic-layout .footer {
  margin-left: 200px; /* 与内容区对齐 */
  background: #fff;
  padding: 16px;
  text-align: center;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
  transition: margin-left 0.3s ease;
}

#basic-layout .footer.no-sider {
  margin-left: 0;
}

#basic-layout .footer.no-header {
  position: fixed;
  bottom: 0;
  width: 100%;
  margin-left: 0;
}

#basic-layout .footer a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

#basic-layout .footer a:hover {
  color: #1890ff;
}

/* 登录页面特殊样式 */
#basic-layout .no-header .content-container {
  border-radius: 0;
  box-shadow: none;
  height: calc(100vh - 69px); /* 减去footer高度 */
}
</style>
