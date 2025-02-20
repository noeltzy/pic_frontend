<template>
  <a-form layout="vertical" :model="formData" @finish="handleSubmit">
    <a-form-item label="空间名称" name="spaceName">
      <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
    </a-form-item>
    <a-form-item label="空间级别" name="spaceLevel">
      <a-select
        v-model:value="formData.spaceLevel"
        :options="SPACE_LEVEL_OPTIONS"
        placeholder="请输入空间级别"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
        提交
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { SPACE_LEVEL_OPTIONS, SPACE_LEVEL_ENUM } from '@/constants/space'
import { useRouter } from 'vue-router'
import { addSpaceUsingPost } from '@/service/api/spaceController'
import { message } from 'ant-design-vue'
import { reactive, ref } from 'vue'
const router = useRouter()
const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)

const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await addSpaceUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>
