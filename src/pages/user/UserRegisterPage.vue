<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { registerUsingPost } from '@/service/api/userController'

const formState = ref({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const router = useRouter()
const loading = ref(false)

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('请输入密码')
  }
  if (value.length < 8) {
    return Promise.reject('密码长度不能小于8位')
  }
  return Promise.resolve()
}

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('请确认密码')
  }
  if (value !== formState.value.userPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const handleFinish = async (values: API.UserRegisterRequest) => {
  loading.value = true
  try {
    const res = await registerUsingPost({
      userAccount: values.userAccount,
      userPassword: values.userPassword,
      checkPassword: values.checkPassword,
    })
    if (res.data.code === 0) {
      message.success('注册成功')
      await router.push('/user/login')
    } else {
      message.error(res.data.message || '注册失败')
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : '未知错误'
    message.error('注册失败，请重试：' + err)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/user/login')
}
</script>

<template>
  <div class="register-container">
    <h2 class="title">账号注册</h2>
    <p class="subtitle">欢迎加入！请填写以下信息完成注册</p>

    <a-form
      :model="formState"
      name="register"
      autocomplete="off"
      @finish="handleFinish"
      class="register-form"
    >
      <a-form-item
        name="userAccount"
        :rules="[
          { required: true, message: '请输入账号!' },
          { min: 4, message: '账号长度不能小于4位!' },
        ]"
      >
        <a-input v-model:value="formState.userAccount" size="large" placeholder="请输入账号">
          <template #prefix>
            <UserOutlined class="field-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="userPassword" :rules="[{ validator: validatePassword }]">
        <a-input-password
          v-model:value="formState.userPassword"
          size="large"
          placeholder="请输入密码"
        >
          <template #prefix>
            <LockOutlined class="field-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="checkPassword" :rules="[{ validator: validateConfirmPassword }]">
        <a-input-password
          v-model:value="formState.checkPassword"
          size="large"
          placeholder="请确认密码"
        >
          <template #prefix>
            <LockOutlined class="field-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          class="register-button"
          :loading="loading"
          size="large"
          block
        >
          <template #icon><UserOutlined /></template>
          立即注册
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <a-space>
          <span class="text-muted">已有账号？</span>
          <a @click="goToLogin" class="login-link">立即登录</a>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 480px; /* 设置最小高度 */
  padding: 0 24px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.subtitle {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
}

.register-form {
  max-width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.register-form :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.register-form :deep(.ant-input-affix-wrapper) {
  height: 44px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.register-form :deep(.ant-input-affix-wrapper:hover),
.register-form :deep(.ant-input-affix-wrapper:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.register-form :deep(.ant-input) {
  font-size: 15px;
}

.field-icon {
  color: #bfbfbf;
  font-size: 16px;
  transition: color 0.3s ease;
}

.register-form :deep(.ant-input-affix-wrapper:hover) .field-icon,
.register-form :deep(.ant-input-affix-wrapper-focused) .field-icon {
  color: #1890ff;
}

.register-button {
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-bottom: 24px;
}

.text-muted {
  color: #999;
  font-size: 14px;
}

.login-link {
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .register-container {
    min-height: 420px;
    padding: 0 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .register-form :deep(.ant-input-affix-wrapper) {
    height: 40px;
  }

  .register-button {
    height: 40px;
    font-size: 15px;
  }
}
</style>
