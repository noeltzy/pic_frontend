<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh">
      <a-layout-header><GlobalHeader /></a-layout-header>
      <div class="side"><GlobalSider /></div>
      <a-layout-content class="content">
        <div class="content-container">
          <RouterView />
        </div>
      </a-layout-content>
      <a-layout-footer class="footer">
        <!--        TODO 添加图标-->
        <a href="https://github.com/noeltzy" target="_blank"> By 程序员 Noel</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalSider from '@/components/GlobalSider.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
.side {
  margin-top: 80px;
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

#basic-layout .content {
  padding: 84px 24px 24px;
  min-height: calc(100vh - 64px - 53px);
  background: #f5f5f5;
  margin-bottom: 24px;
}

#basic-layout .footer {
  background: #fff;
  padding: 16px;
  text-align: center;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

#basic-layout .footer a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

#basic-layout .footer a:hover {
  color: #1890ff;
}
</style>
