<template>
  <div class="picture-detail-container">
    <div class="content-card">
      <h2 class="page-title">{{ picture?.picName }}</h2>
      <div class="detail-layout">
        <!-- 图片展示区域 -->
        <div class="image-section">
          <div class="image-wrapper">
            <img :src="picture?.url" :alt="picture?.picName" />
          </div>
        </div>

        <!-- 详细信息区域 -->
        <div class="info-section">
          <div class="tags-section">
            <a-tag color="green">{{ picture?.category || '默认' }}</a-tag>
            <template v-if="picture?.tags && picture.tags.length">
              <a-tag v-for="tag in picture.tags" :key="tag" color="blue">{{ tag }}</a-tag>
            </template>
          </div>

          <div class="info-item">
            <h3>图片信息</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">尺寸：</span>
                <span>{{ picture?.picWidth }} x {{ picture?.picHeight }}</span>
              </div>
              <div class="info-row">
                <span class="label">比例：</span>
                <span>{{ picture?.picScale }}</span>
              </div>
              <div class="info-row">
                <span class="label">格式：</span>
                <span>{{ picture?.picFormat }}</span>
              </div>
              <div class="info-row">
                <span class="label">大小：</span>
                <span>{{ formatFileSize(picture?.picSize) }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <h3>简介</h3>
            <p class="introduction">{{ picture?.introduction || '暂无简介' }}</p>
          </div>

          <div class="info-item">
            <h3>上传信息</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">上传者：</span>
                <span>{{ picture?.userVo?.userName || picture?.userVo?.userAccount }}</span>
              </div>
              <div class="info-row">
                <span class="label">上传时间：</span>
                <span>{{ formatDate(picture?.createTime) }}</span>
              </div>
              <div class="info-row">
                <span class="label">更新时间：</span>
                <span>{{ formatDate(picture?.updateTime) }}</span>
              </div>
            </div>
          </div>
          <!-- 下载按钮 放在最下面 -->
          <div class="button-section">
            <a-button type="primary" @click="handleDownload"
              ><DownloadOutlined /> 免费下载
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPictureVoByIdUsingGet } from '@/service/api/pictureController'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  id: string | number | undefined
}>()

const picture = ref<API.PictureVo | undefined>({})

const fetchPicture = async () => {
  console.log(props.id)
  try {
    const res = await getPictureVoByIdUsingGet({ id: props.id })
    const data = res.data
    if (data?.code === 0 && data.data) {
      picture.value = data.data
    } else {
      message.error(data?.message || '获取图片详情失败')
    }
  } catch (error) {
    message.error('获取图片详情失败')
  }
}

// 格式化文件大小
const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 下载图片
const handleDownload = () => {
  window.open(picture.value?.url, '_blank')
}

onMounted(() => {
  fetchPicture()
})
</script>

<style scoped>
.picture-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.detail-layout {
  display: flex;
  gap: 32px;
}

.image-section {
  flex: 1;
  min-width: 0;
}

.image-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
}

.info-section {
  flex: 1;
  min-width: 0;
  max-width: 500px;
}

.title {
  margin: 0 0 16px;
  font-size: 24px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.85);
}

.tags-section {
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-item {
  margin-bottom: 24px;
}

.info-item h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: rgba(0, 0, 0, 0.45);
  min-width: 70px;
}

.introduction {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }

  .info-section {
    max-width: none;
  }

  .content-card {
    padding: 16px;
  }

  .picture-detail-container {
    padding: 16px;
  }
}

.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}
</style>
