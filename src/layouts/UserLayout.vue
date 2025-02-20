<template>
  <div class="user-layout">
    <!-- 背景装饰 -->
    <div class="background-wrapper">
      <div class="background-overlay"></div>
    </div>

    <!-- 顶部品牌 -->
    <div class="header">
      <a-space size="middle" align="center">
        <div class="logo">
          <PictureOutlined style="font-size: 32px; color: #fff" />
        </div>
        <h1 class="brand">腾图片</h1>
      </a-space>
    </div>

    <!-- 主要内容区 -->
    <div class="main">
      <div class="content-wrapper">
        <!-- 左侧介绍 -->
        <div class="intro-section">
          <h2>欢迎使用腾图片</h2>
          <p>一站式图片管理与分享平台</p>
          <div class="feature-list">
            <div class="feature-item">
              <CloudOutlined class="feature-icon" />
              <span>云端存储，随时随地访问</span>
            </div>
            <div class="feature-item">
              <PictureOutlined class="feature-icon" />
              <span>强大的图片管理功能</span>
            </div>
            <div class="feature-item">
              <TeamOutlined class="feature-icon" />
              <span>便捷的协作分享体验</span>
            </div>
          </div>
        </div>

        <!-- 右侧表单 -->
        <div class="form-container">
          <RouterView />
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <div class="footer-content">
        <a-space>
          <a href="https://github.com/noeltzy" target="_blank">
            <a-space>
              <GithubOutlined />
              <span>程序员 Noel</span>
            </a-space>
          </a>
          <a-divider type="vertical" style="border-color: rgba(255, 255, 255, 0.3)" />
          <a href="#" target="_blank">帮助文档</a>
          <a-divider type="vertical" style="border-color: rgba(255, 255, 255, 0.3)" />
          <a href="#" target="_blank">隐私政策</a>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GithubOutlined, CloudOutlined, PictureOutlined, TeamOutlined } from '@ant-design/icons-vue'
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f0f2f5;
}

.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  opacity: 0.8;
  z-index: 0;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.header {
  padding: 24px 40px;
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.brand {
  color: #fff;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  letter-spacing: 1px;
}

.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.content-wrapper {
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.intro-section {
  flex: 1;
  padding: 48px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(114, 46, 209, 0.05) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intro-section h2 {
  font-size: 32px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  font-weight: 600;
}

.intro-section p {
  font-size: 16px;
  color: #666;
  margin-bottom: 48px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateX(8px);
}

.feature-icon {
  font-size: 28px;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  padding: 12px;
  border-radius: 12px;
}

.feature-item span {
  font-size: 16px;
  color: #333;
}

.form-container {
  flex: 1;
  padding: 48px;
  background: #fff;
}

.footer {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.footer-content {
  text-align: center;
}

.footer a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 14px;
}

.footer a:hover {
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    margin: 16px;
    border-radius: 12px;
  }

  .intro-section {
    padding: 32px;
  }

  .form-container {
    padding: 32px;
  }

  .feature-list {
    gap: 24px;
  }

  .feature-icon {
    font-size: 24px;
    padding: 10px;
  }

  .header {
    padding: 16px 24px;
  }
}
</style>
