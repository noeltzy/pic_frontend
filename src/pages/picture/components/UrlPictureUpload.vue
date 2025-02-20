<template>
  <div class="url-picture-container">
    <a-input-search
      v-if="!picture?.id"
      v-model:value="fileUrl"
      placeholder="你的图片url地址"
      enter-button="上传"
      size="large"
      @search="handleUpload"
    />
    <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
  </div>
</template>
<script lang="ts" setup>
import { uploadPictureByUrlUsingPost } from '@/service/api/pictureController.ts'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
interface Props {
  picture?: API.PictureVo
  onSuccess?: (newPicture: API.PictureVo) => void
}
const fileUrl = ref<string>()
const props = defineProps<Props>()

const route = useRoute()

const spaceId = computed(() => {
  return route.query?.spaceId
})

const handleUpload = async () => {
  let params: { id?: number | string; url?: string }
  if (props.picture) {
    params = { id: props.picture.id, url: fileUrl.value }
  } else {
    params = { url: fileUrl.value }
  }

  const res = await uploadPictureByUrlUsingPost(params, {})
  if (res.data?.code === 0 && res.data.data) {
    props.onSuccess?.(res.data.data)
    message.success('成功')
  } else {
    message.error('上传失败', res.data.message)
  }
}
</script>
<style scoped>
.url-picture-container img {
  margin-top: 14px;
  max-width: 100%;
  max-height: 480px;
}
</style>
