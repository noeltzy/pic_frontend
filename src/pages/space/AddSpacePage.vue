<!--
  功能说明：这是一个创建空间的页面组件
  主要流程：
  1. 用户输入空间名称和选择空间级别
  2. 点击提交按钮后，调用后端API创建空间
  3. 创建成功后自动跳转到新创建的空间页面
-->
<template>
  <!-- 表单部分：使用 ant-design-vue 的表单组件 -->
  <h1>创建{{ spaceType == 0 ? '个人' : '团队' }}空间</h1>
  <a-form layout="vertical" :model="formData" @finish="handleSubmit">
    <!-- 空间名称输入框 -->
    <a-form-item label="空间名称" name="spaceName">
      <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
    </a-form-item>
    <!-- 空间级别选择器 -->
    <a-form-item label="空间级别" name="spaceLevel">
      <a-select
        v-model:value="formData.spaceLevel"
        :options="SPACE_LEVEL_OPTIONS"
        placeholder="请输入空间级别"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <!-- 提交按钮 -->
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
        提交
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
// 导入所需的常量、组件和API
import { SPACE_LEVEL_OPTIONS, SPACE_LEVEL_ENUM } from '@/constants/space'
import { useRouter, useRoute } from 'vue-router'
import { addSpaceUsingPost } from '@/service/api/spaceController'
import { message } from 'ant-design-vue'
import { computed, reactive, ref } from 'vue'

// 初始化路由实例，用于页面跳转
const router = useRouter()

const route = useRoute()
const spaceType = computed(() => route.query.spaceType)

// 定义表单数据结构，使用 reactive 使其具有响应式
const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '', // 空间名称，初始为空
  spaceLevel: SPACE_LEVEL_ENUM.COMMON, // 空间级别，默认为普通级别
})

// 定义加载状态，用于控制提交按钮的loading效果
const loading = ref(false)

// 表单提交处理函数
const handleSubmit = async (values: any) => {
  loading.value = true // 开启加载状态
  // 调用创建空间的API
  const res = await addSpaceUsingPost({
    spaceType: spaceType.value == 0 ? 0 : 1,
    ...formData,
  })
  // 处理API响应结果
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功') // 显示成功提示
    // 跳转到新创建的空间页面
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('创建失败，' + res.data.message) // 显示错误信息
  }
  loading.value = false // 关闭加载状态
}
</script>
