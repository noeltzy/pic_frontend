<template>
  <div class="picture-editor">
    <div class="editor-layout">
      <!-- 左侧编辑区域 -->
      <div class="editor-main">
        <div class="editor-container">
          <Cropper
            ref="cropperRef"
            class="cropper"
            :src="imageUrl"
            :stencil-props="{
              aspectRatio: currentAspectRatio,
            }"
            :resize-image="{
              adjustStencil: false,
            }"
            @change="onChange"
          />
        </div>
        <div class="editor-controls">
          <div class="control-group">
            <a-button-group>
              <a-button @click="rotate(-90)" :disabled="!canEdit">
                <template #icon><RotateLeftOutlined /></template>
              </a-button>
              <a-button @click="rotate(90)" :disabled="!canEdit">
                <template #icon><RotateRightOutlined /></template>
              </a-button>
            </a-button-group>
          </div>
          <!-- <div class="control-group">
            <a-button-group>
              <a-button @click="flipHorizontal">
                <template #icon><SwapOutlined /></template>
              </a-button>
              <a-button @click="flipVertical">
                <template #icon><SwapOutlined style="transform: rotate(90deg)" /></template>
              </a-button>
            </a-button-group>
          </div> -->
          <!-- <div class="control-group">
            <a-select v-model:value="currentAspectRatio" style="width: 120px">
              <a-select-option :value="null">自由比例</a-select-option>
              <a-select-option :value="1">1:1</a-select-option>
              <a-select-option :value="4 / 3">4:3</a-select-option>
              <a-select-option :value="16 / 9">16:9</a-select-option>
              <a-select-option :value="3 / 4">3:4</a-select-option>
              <a-select-option :value="9 / 16">9:16</a-select-option>
            </a-select>
          </div> -->
          <div class="control-group">
            <a-space direction="horizontal" :size="16">
              <a-button
                type="primary"
                :disabled="!CollaborativeButtonCanClick"
                @click="applyChanges"
                >应用更改</a-button
              >
              <!-- 添加间隔让样式好看  -->
              <a-button
                v-if="isTeamSpace"
                type="primary"
                @click="goOrLeaveCollaborativeEditing"
                :disabled="!CollaborativeButtonCanClick"
                >{{ CollaborativeButtonText }}</a-button
              >
            </a-space>
          </div>
        </div>
      </div>

      <!-- 右侧协同编辑状态和消息区域 -->
      <div class="editor-sidebar" v-if="isTeamSpace">
        <!-- 协同编辑状态 -->
        <div class="collaboration-status">
          <h3>协同编辑状态</h3>
          <div class="status-content">
            <div class="status-item">
              <div class="status-label">当前状态：</div>
              <div class="status-value">
                <a-tag :color="editingUser ? 'processing' : 'default'">
                  {{ editingUser ? '正在编辑中' : '等待编辑' }}
                </a-tag>
              </div>
            </div>
            <div class="status-item" v-if="editingUser">
              <div class="status-label">编辑者：</div>
              <div class="status-value editor-info">
                <a-avatar
                  :src="editingUser.userAvatar || 'https://joeschmoe.io/api/v1/random'"
                  :size="24"
                />
                <span class="editor-name">{{ editingUser.userName || '未知用户' }}</span>
                <a-tag v-if="editingUser.id === loginUser.id" color="green">我</a-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="message-list">
          <h3>编辑消息</h3>
          <a-empty
            v-if="messages.length === 0"
            description="暂无消息"
            :image-style="{ height: '60px' }"
          />
          <div class="message-container" v-else ref="messageContainer">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-item"
              :class="{ 'message-self': msg.user?.id === loginUser.id }"
            >
              <div class="message-avatar">
                <a-avatar
                  :src="msg.user?.userAvatar || 'https://joeschmoe.io/api/v1/random'"
                  :size="32"
                />
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">{{ msg.user?.userName || '系统消息' }}</span>
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <div class="message-body">{{ msg.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watchEffect, nextTick } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons-vue'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import PictureEditWebSocket from '@/utils/websocket'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
const userStore = useLoginUserStore()
const loginUser = userStore.loginUser
interface Props {
  imageUrl: string
  spaceType: number
  picture: API.PictureVo
  onComplete: (editedImageUrl: string) => void
}

// 定义裁剪器的类型
interface CropperRef {
  rotate: (angle: number) => void
  flip: (options: { horizontal?: boolean; vertical?: boolean }) => void
  getResult: () => { canvas: HTMLCanvasElement }
}

// 定义坐标类型
interface Coordinates {
  width: number
  height: number
  left: number
  top: number
}

// 定义onChange事件数据类型
interface CropperChangeEvent {
  coordinates: Coordinates
  canvas: HTMLCanvasElement
}

// 定义消息类型
interface EditorMessage {
  type: string
  message: string
  user?: API.UserVo
  timestamp: number
  editAction?: string
}

const props = defineProps<Props>()

const cropperRef = ref<CropperRef | null>(null)
const currentAspectRatio = ref<number | null>(null)
const coordinates = ref<Coordinates | null>(null)
const messageContainer = ref<HTMLElement | null>(null)

// 消息列表
const messages = ref<EditorMessage[]>([])

// 协同编辑
const CollaborativeButtonCanClick = computed(() => {
  if (editingUser.value?.id == undefined) {
    return true
  } else if (editingUser.value?.id == loginUser.id) {
    return true
  } else {
    return false
  }
})

// 协同编辑
const CollaborativeButtonText = computed(() => {
  if (editingUser.value?.id == undefined) {
    return '加入协同编辑'
  } else if (editingUser.value?.id == loginUser.id) {
    return '离开协同编辑'
  } else {
    return `当前由 ${editingUser.value?.userName || '他人'} 正在编辑`
  }
})

const goOrLeaveCollaborativeEditing = () => {
  if (editingUser.value?.id == undefined) {
    console.log('进入协同编辑')
    enterEdit()
  } else if (editingUser.value?.id == loginUser.id) {
    exitEdit()
    console.log('退出协同编辑')
  } else {
    addMessage({
      type: 'info',
      message: `当前由 ${editingUser.value?.userName || '他人'} 正在编辑`,
      timestamp: Date.now(),
    })
  }
}

const isTeamSpace = computed(() => {
  return props.spaceType == 1
})

const editingUser = ref<API.UserVo>()

// 旋转图片
const rotate = (angle: number) => {
  if (cropperRef.value) {
    cropperRef.value.rotate(angle)
    if (angle === -90) {
      editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
    } else if (angle === 90) {
      editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
    }
  }
}

// 裁剪变化时触发
const onChange = (data: CropperChangeEvent) => {
  coordinates.value = data.coordinates
}

// 应用更改
const applyChanges = () => {
  if (cropperRef.value) {
    const canvas = cropperRef.value.getResult().canvas
    if (canvas) {
      // 将Canvas转换为图片URL
      const editedImageUrl = canvas.toDataURL('image/jpeg')
      props.onComplete(editedImageUrl)
    }
  }
}

// 添加消息到消息列表
const addMessage = (msg: EditorMessage) => {
  messages.value.push(msg)
  // 限制消息数量，只保留最新的3条
  if (messages.value.length > 3) {
    messages.value = messages.value.slice(messages.value.length - 3)
  }
  // 滚动到底部
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// WEBSOCKET
let websocket: PictureEditWebSocket | null

// 初始化 WebSocket 连接，绑定事件
const initWebsocket = () => {
  const pictureId = props.picture?.id

  // 防止之前的连接未释放
  if (websocket) {
    websocket.disconnect()
  }

  if (!pictureId) {
    console.error('图片ID不存在，无法建立WebSocket连接')
    return
  }

  // 创建 WebSocket 实例
  websocket = new PictureEditWebSocket(pictureId)
  // 建立 WebSocket 连接
  websocket.connect()

  // 监听通知消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    if (msg.editUser) {
      editingUser.value = msg.editUser
    }
    addMessage({
      type: 'info',
      message: msg.message,
      user: msg.user,
      timestamp: Date.now(),
    })
  })

  // 监听错误消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息：', msg)
    message.error(msg.message) // 错误消息仍使用全局提示
    addMessage({
      type: 'error',
      message: msg.message,
      user: msg.user,
      timestamp: Date.now(),
    })
  })

  // 监听进入编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息：', msg)
    editingUser.value = msg.user
    addMessage({
      type: 'enter',
      message: msg.message,
      user: msg.user,
      timestamp: Date.now(),
    })
  })

  // 监听编辑操作消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作消息：', msg)
    addMessage({
      type: 'action',
      message: msg.message,
      user: msg.user,
      editAction: msg.editAction,
      timestamp: Date.now(),
    })

    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef?.value?.rotate(-90)
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef?.value?.rotate(90)
        break
    }
  })

  // 监听退出编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息：', msg)
    editingUser.value = undefined
    addMessage({
      type: 'exit',
      message: msg.message,
      user: msg.user,
      timestamp: Date.now(),
    })
  })
}

// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 可以编辑
const canEdit = computed(() => {
  // 不是团队空间，则默认可编辑
  if (!isTeamSpace.value) {
    return true
  }
  return editingUser.value?.id === loginUser.id
})

watchEffect(() => {
  // 团队空间才初始化
  if (isTeamSpace.value) {
    initWebsocket()
  }
})

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}

onUnmounted(() => {
  // 断开连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})
</script>

<style scoped>
.picture-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.editor-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止flex子项溢出 */
}

.editor-container {
  flex: 1;
  min-height: 400px;
  background-color: #f0f0f0;
  position: relative;
}

.cropper {
  height: 100%;
  width: 100%;
}

.editor-controls {
  display: flex;
  justify-content: center;
  padding: 16px;
  gap: 16px;
  background-color: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.control-group {
  display: flex;
  align-items: center;
}

/* 右侧边栏样式 */
.editor-sidebar {
  width: 300px;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.collaboration-status {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.collaboration-status h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
}

.status-content {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
}

.status-item {
  display: flex;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  width: 80px;
  color: #666;
}

.status-value {
  flex: 1;
}

.editor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-name {
  font-weight: 500;
}

/* 消息列表样式 */
.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.message-list h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-avatar {
  margin-right: 8px;
}

.message-content {
  flex: 1;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 8px 12px;
  max-width: calc(100% - 48px);
}

.message-self .message-content {
  background-color: #e6f7ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-body {
  word-break: break-word;
  font-size: 14px;
}
</style>
