<template>
  <div class="picture-editor">
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
          <a-button @click="rotate(-90)">
            <template #icon><RotateLeftOutlined /></template>
          </a-button>
          <a-button @click="rotate(90)">
            <template #icon><RotateRightOutlined /></template>
          </a-button>
        </a-button-group>
      </div>
      <div class="control-group">
        <a-button-group>
          <a-button @click="flipHorizontal">
            <template #icon><SwapOutlined /></template>
          </a-button>
          <a-button @click="flipVertical">
            <template #icon><SwapOutlined style="transform: rotate(90deg)" /></template>
          </a-button>
        </a-button-group>
      </div>
      <div class="control-group">
        <a-select v-model:value="currentAspectRatio" style="width: 120px">
          <a-select-option :value="null">自由比例</a-select-option>
          <a-select-option :value="1">1:1</a-select-option>
          <a-select-option :value="4 / 3">4:3</a-select-option>
          <a-select-option :value="16 / 9">16:9</a-select-option>
          <a-select-option :value="3 / 4">3:4</a-select-option>
          <a-select-option :value="9 / 16">9:16</a-select-option>
        </a-select>
      </div>
      <div class="control-group">
        <a-button type="primary" @click="applyChanges">应用更改</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { RotateLeftOutlined, RotateRightOutlined, SwapOutlined } from '@ant-design/icons-vue'

interface Props {
  imageUrl: string
  onComplete: (editedImageUrl: string) => void
}

const props = defineProps<Props>()
const emit = defineEmits(['update:complete'])

const cropperRef = ref<any>(null)
const currentAspectRatio = ref<number | null>(null)
const coordinates = ref<any>(null)

// 旋转图片
const rotate = (angle: number) => {
  if (cropperRef.value) {
    cropperRef.value.rotate(angle)
  }
}

// 水平翻转
const flipHorizontal = () => {
  if (cropperRef.value) {
    cropperRef.value.flipX()
  }
}

// 垂直翻转
const flipVertical = () => {
  if (cropperRef.value) {
    cropperRef.value.flipY()
  }
}

// 裁剪变化时触发
const onChange = (data: any) => {
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

onMounted(() => {
  // 组件挂载后的初始化逻辑
})
</script>

<style scoped>
.picture-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
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
</style>
