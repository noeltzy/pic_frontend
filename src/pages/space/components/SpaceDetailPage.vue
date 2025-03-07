<template>
  <a-card :bordered="false" class="space-detail-page">
    <!-- 空间信息头部 -->
    <a-skeleton :loading="loading" active>
      <a-row class="space-header" align="middle" :gutter="[16, 16]">
        <a-col :span="16">
          <a-space direction="vertical" size="small">
            <a-space align="center">
              <h2 class="space-title">{{ space.spaceName }}</h2>
              <a-tag color="blue">{{ space.spaceType == 0 ? '私有空间' : '团队空间' }}</a-tag>
              <a-tag :color="spaceLevelColor">{{ spaceLevelText }}</a-tag>
            </a-space>
            <a-space class="space-info">
              <span>创建时间：{{ formatDate(space.createTime) }}</span>
              <a-divider type="vertical" />
              <span>图片数量：{{ total }} / {{ space.maxCount }}</span>
            </a-space>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-space size="middle" align="center">
            <a-button
              type="primary"
              :href="`/picture/upload?spaceId=${id}`"
              target="_blank"
              :disabled="isSpaceFull"
            >
              <template #icon><upload-outlined /></template>
              上传图片
            </a-button>
            <a-button type="primary" :href="`/picture/upload?spaceId=${id}`" target="_blank">
              <template #icon><upload-outlined /></template>
              AI生成图片
            </a-button>

            <a-tooltip>
              <template #title>
                已使用：{{ formatSize(space.totalSize) }} / {{ formatSize(space.maxSize) }}
              </template>
              <a-progress
                type="circle"
                :percent="spaceUsagePercent"
                :size="48"
                :status="isSpaceFull ? 'exception' : undefined"
              />
            </a-tooltip>
          </a-space>
        </a-col>
      </a-row>
    </a-skeleton>

    <!-- 搜索和筛选区域 -->
    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline">
        <a-form-item label="图片名称">
          <a-input
            v-model:value="searchParams.name"
            placeholder="请输入图片名称"
            allow-clear
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item label="图片格式">
          <a-select
            v-model:value="searchParams.picFormat"
            placeholder="请选择格式"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="PNG">PNG</a-select-option>
            <a-select-option value="JPG">JPG</a-select-option>
            <a-select-option value="GIF">GIF</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><search-outlined /></template>
            搜索
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 图片列表 -->
    <SpacePictureList
      :dataList="dataList"
      :loading="loading"
      :viewMode="viewMode"
      @refresh="fetchData"
    />
    <div class="pagination-container">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        :show-total="(totalCount: number) => `共 ${totalCount} 张图片`"
        :show-size-changer="true"
        :page-size-options="['5', '10']"
        @change="onPageChange"
      />
    </div>
  </a-card>
</template>

<script lang="ts" setup>
import { listPictureVoPageUsingPost } from '@/service/api/pictureController'
import { getSpaceVoByIdUsingGet } from '@/service/api/spaceController'
import SpacePictureList from './SpacePictureList.vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import {
  UploadOutlined,
  SearchOutlined,
  AppstoreOutlined as AppStoreOutlined,
  BarsOutlined,
} from '@ant-design/icons-vue'
import { SPACE_LEVEL_MAP } from '@/constants/space'

// 防抖函数
function useDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Props 定义
interface Props {
  id: number
}
const props = defineProps<Props>()

// Store
const loginUserStore = useLoginUserStore()

// 状态定义
const space = ref<API.SpaceVO>({})
const dataList = ref<API.PictureVo[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(true)
const viewMode = ref<'grid' | 'list'>('grid')

// 计算属性
const spaceUsagePercent = computed(() => {
  if (!space.value.totalSize || !space.value.maxSize) return 0
  return Number(((space.value.totalSize * 100) / space.value.maxSize).toFixed(1))
})

const isSpaceFull = computed(() => {
  return spaceUsagePercent.value >= 100
})

const spaceLevelText = computed(() => {
  const level = space.value.spaceLevel ?? 0
  return SPACE_LEVEL_MAP[level] || '未知级别'
})

const spaceLevelColor = computed(() => {
  const level = space.value.spaceLevel ?? 0
  switch (level) {
    case 0: // 普通版
      return 'blue'
    case 1: // 专业版
      return 'purple'
    case 2: // 旗舰版
      return 'gold'
    default:
      return 'default'
  }
})

// 搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
  name: undefined,
  picFormat: undefined,
})

// 工具函数
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatSize = (size: number | undefined) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`
}

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error: unknown) {
    const err = error as Error
    message.error('获取空间详情失败：' + err.message)
  }
}

// 获取图片列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: API.PictureQueryRequest = {
      ...searchParams,
      spaceId: props.id,
      userId: loginUserStore.loginUser.id,
    }

    const res = await listPictureVoPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error: unknown) {
    const err = error as Error
    message.error('获取数据失败：' + err.message)
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleSearch = useDebounce(() => {
  searchParams.current = 1
  fetchData()
}, 300)

const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 生命周期
onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})
// 空间 id 改变时，必须重新获取数据
watch(
  () => props.id,
  (newSpaceId) => {
    fetchSpaceDetail()
    fetchData()
  },
)
</script>

<style scoped>
.space-detail-page .space-header {
  margin-bottom: 24px;
}

.space-detail-page .space-header .space-title {
  margin: 0;
  font-size: 24px;
  display: inline-block;
}

.space-detail-page .space-header .space-info {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.space-detail-page .filter-card {
  margin-bottom: 24px;
  background: #fafafa;
}

.space-detail-page .list-card .pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style>
