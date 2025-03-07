<template>
  <div class="picture-container">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">上传或拖拽</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { uploadPictureUsingPost } from '@/service/api/pictureController.ts'

interface Props {
  picture?: API.PictureVo
  onSuccess?: (newPicture: API.PictureVo) => void
}
const props = defineProps<Props>()

import { ref, computed } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import type { UploadProps } from 'ant-design-vue'

const loading = ref<boolean>(false)

const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('图片格式错误,推荐jpeg,png 格式')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片尺寸过大')
  }
  return isJpgOrPng && isLt2M
}
const route = useRoute()

const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 处理图片上传的函数
 * @param file - 上传的文件对象
 */
const handleUpload = async ({ file }: any) => {
  // 设置加载状态为true，显示加载图标
  loading.value = true

  // 创建请求参数对象，如果已有图片则包含图片ID
  const params: any = props.picture ? { id: props.picture.id } : {}

  // 添加空间ID参数，用于指定图片保存的位置
  params.spaceId = spaceId.value

  // 调用上传图片API，发送请求
  const res = await uploadPictureUsingPost(params, {}, file)

  // 检查请求是否成功
  if (res.data?.code === 0 && res.data.data) {
    // 调用成功回调函数，传递新上传的图片数据
    props.onSuccess?.(res.data.data)
    // 显示成功提示消息
    message.success('成功')
  }

  // 无论成功与否，最后都将加载状态设为false
  loading.value = false
}
</script>



<style scoped>
.picture-container:deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-container img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
