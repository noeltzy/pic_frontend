<template>
  <a-card :bordered="false" class="space-detail-page">
    <!-- 空间信息头部 -->
    <a-skeleton :loading="loading" active>
      <div class="space-header-container">
        <a-row class="space-header" align="middle" :gutter="[16, 16]">
          <a-col :span="16">
            <div class="space-info-container">
              <div class="space-title-row">
                <h2 class="space-title">{{ space.spaceName }}</h2>
                <a-tag color="blue" class="space-tag">{{
                  space.spaceType == 0 ? '私有空间' : '团队空间'
                }}</a-tag>
                <a-tag :color="spaceLevelColor" class="space-tag">{{ spaceLevelText }}</a-tag>
              </div>
              <div class="space-meta-info">
                <div class="meta-item">
                  <calendar-outlined class="meta-icon" />
                  <span>创建时间：{{ formatDate(space.createTime) }}</span>
                </div>
                <a-divider type="vertical" />
                <div class="meta-item">
                  <picture-outlined class="meta-icon" />
                  <span
                    >图片数量：<strong>{{ total }}</strong> / {{ space.maxCount }}</span
                  >
                </div>
                <template v-if="space.spaceType == 1">
                  <a-divider type="vertical" />
                  <div class="meta-item">
                    <team-outlined class="meta-icon" />
                    <span>团队成员：</span>
                    <a-avatar-group
                      :max-count="5"
                      :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }"
                      class="member-avatars"
                    >
                      <a-tooltip
                        v-for="member in teamMembers"
                        :key="member.userId"
                        :title="member.spaceRole"
                        placement="bottom"
                      >
                        <a-avatar
                          :src="member.userAvatar || 'https://joeschmoe.io/api/v1/random'"
                        />
                      </a-tooltip>
                    </a-avatar-group>
                    <a-button
                      v-if="isCurrentUserAdmin"
                      type="link"
                      size="small"
                      @click="showAddMemberModal"
                      class="add-member-btn"
                    >
                      <template #icon><user-add-outlined /></template>
                      添加成员
                    </a-button>
                  </div>
                </template>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="space-actions">
              <a-space size="middle" align="center">
                <a-button
                  type="primary"
                  :href="`/picture/upload?spaceId=${id}`"
                  target="_blank"
                  :disabled="isSpaceFull"
                  class="action-button"
                >
                  <template #icon><upload-outlined /></template>
                  上传图片
                </a-button>
                <a-button
                  type="primary"
                  :href="`/picture/upload?spaceId=${id}`"
                  target="_blank"
                  class="action-button ai-button"
                >
                  <template #icon><upload-outlined /></template>
                  AI生成图片
                </a-button>

                <a-tooltip placement="left">
                  <template #title>
                    <div class="storage-tooltip">
                      <div>已使用空间：</div>
                      <div class="storage-values">
                        {{ formatSize(space.totalSize) }} / {{ formatSize(space.maxSize) }}
                      </div>
                    </div>
                  </template>
                  <a-progress
                    type="circle"
                    :percent="spaceUsagePercent"
                    :size="60"
                    :status="isSpaceFull ? 'exception' : undefined"
                    :stroke-color="isSpaceFull ? '#ff4d4f' : '#1890ff'"
                    class="storage-progress"
                  />
                </a-tooltip>
              </a-space>
            </div>
          </a-col>
        </a-row>
      </div>
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

    <!-- 添加成员模态框 -->
    <a-modal
      v-model:visible="addMemberModalVisible"
      title="添加团队成员"
      @ok="handleAddMember"
      :confirmLoading="addMemberLoading"
    >
      <a-form :model="addMemberForm" layout="vertical">
        <a-form-item
          label="用户ID"
          name="userId"
          :rules="[{ required: true, message: '请输入用户ID' }]"
        >
          <a-input
            v-model:value="addMemberForm.userId"
            placeholder="请输入用户ID"
            style="width: 100%"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="角色" name="spaceRole">
          <a-select v-model:value="addMemberForm.spaceRole" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="editor">编辑者</a-select-option>
            <a-select-option value="viewer">普通成员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script lang="ts" setup>
import { listPictureVoPageUsingPost } from '@/service/api/pictureController'
import { getSpaceVoByIdUsingGet } from '@/service/api/spaceController'
import { listMembersUsingPost, addSpaceUserUsingPost } from '@/service/api/spaceUserController'
import SpacePictureList from './SpacePictureList.vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import {
  UploadOutlined,
  SearchOutlined,
  CalendarOutlined,
  PictureOutlined,
  TeamOutlined,
  UserAddOutlined,
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
const teamMembers = ref<API.SpaceMemberVo[]>([])

// 添加成员相关状态
const addMemberModalVisible = ref<boolean>(false)
const addMemberLoading = ref<boolean>(false)
const addMemberForm = reactive<API.SpaceUserAddRequest>({
  spaceRole: 'viewer',
})

// 判断当前用户是否为管理员
const isCurrentUserAdmin = computed(() => {
  const currentUserId = loginUserStore.loginUser.id
  const currentMember = teamMembers.value.find((member) => member.userId === currentUserId)
  return currentMember?.spaceRole === 'admin'
})

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

// 显示添加成员模态框
const showAddMemberModal = () => {
  addMemberForm.userId = undefined
  addMemberForm.spaceRole = 'viewer'
  addMemberForm.spaceId = props.id
  addMemberModalVisible.value = true
}

// 处理添加成员
const handleAddMember = async () => {
  if (!addMemberForm.userId) {
    message.error('请输入用户ID')
    return
  }

  addMemberLoading.value = true
  try {
    const res = await addSpaceUserUsingPost(addMemberForm)
    if (res.data.code === 0 && res.data.data) {
      message.success('添加成员成功')
      addMemberModalVisible.value = false
      // 重新获取成员列表
      fetchTeamMembers()
    } else {
      message.error('添加成员失败：' + res.data.message)
    }
  } catch (error: unknown) {
    const err = error as Error
    message.error('添加成员失败：' + err.message)
  } finally {
    addMemberLoading.value = false
  }
}

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data

      // 如果是团队空间，获取成员信息
      if (space.value.spaceType === 1) {
        fetchTeamMembers()
      }
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error: unknown) {
    const err = error as Error
    message.error('获取空间详情失败：' + err.message)
  }
}

// 获取团队成员
const fetchTeamMembers = async () => {
  try {
    const res = await listMembersUsingPost({
      spaceId: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      teamMembers.value = res.data.data
    } else {
      console.error('获取团队成员失败：', res.data.message)
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取团队成员失败：', err.message)
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
.space-detail-page {
  box-shadow:
    0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12),
    0 5px 12px 4px rgba(0, 0, 0, 0.09);
  border-radius: 8px;
}

.space-header-container {
  padding: 8px 0;
  background: linear-gradient(to right, #f5f7fa, #ffffff);
  border-radius: 8px;
  margin-bottom: 24px;
}

.space-header {
  padding: 16px 8px;
}

.space-info-container {
  padding: 8px;
}

.space-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.space-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin-right: 12px;
  display: inline-block;
}

.space-tag {
  margin-right: 8px;
  font-weight: 500;
}

.space-meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.meta-icon {
  margin-right: 6px;
  font-size: 16px;
  color: #1890ff;
}

.member-avatars {
  margin-left: 8px;
  margin-right: 8px;
}

.add-member-btn {
  padding: 0 8px;
  color: #1890ff;
  font-size: 14px;
}

.add-member-btn:hover {
  color: #40a9ff;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
}

.space-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.action-button {
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}

.ai-button {
  background: linear-gradient(to right, #1890ff, #52c41a);
  border-color: transparent;
}

.ai-button:hover {
  background: linear-gradient(to right, #40a9ff, #73d13d);
  border-color: transparent;
}

.storage-progress {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.storage-tooltip {
  text-align: center;
}

.storage-values {
  font-weight: bold;
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .space-header .ant-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .space-actions {
    justify-content: flex-start;
    margin-top: 16px;
  }
}
</style>
