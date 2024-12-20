<template>
  <div class="upload-picture-container">
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

import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
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
const handleUpload = async ({ file }: any) => {
  loading.value = true
  const params = props.picture ? { id: props.picture.id } : {}
  const res = await uploadPictureUsingPost(params, {}, file)
  if (res.data?.code === 0 && res.data.data) {
    props.onSuccess?.(res.data.data)
    message.success('成功')
  }
  loading.value = false
}
</script>
<style scoped>
.upload-picture-container:deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.upload-picture-container img {
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
