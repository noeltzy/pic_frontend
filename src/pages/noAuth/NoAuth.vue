<template>
  <div class="no-auth-container">
    <div class="content">
      <div class="icon-wrapper">
        <ExclamationCircleOutlined />
      </div>
      <h1 class="title">访问受限</h1>
      <p class="description">抱歉，您没有权限访问该页面</p>
      <div class="countdown">{{ time }} 秒后自动返回首页</div>
      <div class="action">
        <a-button type="primary" @click="goHome">
          <template #icon><HomeOutlined /></template>
          立即返回首页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const time = ref(3)
let timer: number | null = null

// 倒计时逻辑
const startCountdown = () => {
  timer = window.setInterval(() => {
    time.value--
    if (time.value <= 0) {
      if (timer) {
        window.clearInterval(timer)
      }
      router.push('/')
    }
  }, 1000)
}

// 立即返回首页
const goHome = () => {
  if (timer) {
    window.clearInterval(timer)
  }
  router.push('/')
}

// 组件挂载时启动倒计时
onMounted(() => {
  startCountdown()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<style scoped>
.no-auth-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f5f7fa;
}

.content {
  text-align: center;
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 480px;
  width: 100%;
}

.icon-wrapper {
  font-size: 64px;
  color: #ff4d4f;
  margin-bottom: 24px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.title {
  font-size: 28px;
  color: #1f1f1f;
  margin-bottom: 16px;
  font-weight: 600;
}

.description {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.countdown {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
}

.action {
  margin-top: 8px;
}

.action :deep(.ant-btn) {
  height: 40px;
  padding: 0 24px;
  font-size: 15px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  transition: all 0.3s ease;
}

.action :deep(.ant-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 576px) {
  .content {
    padding: 32px 24px;
  }

  .icon-wrapper {
    font-size: 48px;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }
}
</style>
