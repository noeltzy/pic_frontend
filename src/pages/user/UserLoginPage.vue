<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons-vue'
import { loginUsingPost } from '@/service/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const formState = ref({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const userStore = useLoginUserStore()
const loading = ref(false)

const handleFinish = async (values: API.UserLoginRequest) => {
  loading.value = true
  try {
    const res = await loginUsingPost({
      userAccount: values.userAccount,
      userPassword: values.userPassword,
    })
    if (res.data.code === 0) {
      message.success('登录成功')
      // 更新用户信息
      if (res.data.data) {
        userStore.setLoginUser(res.data.data)
        await router.push({
          path: '/',
          replace: true,
        })
      } else {
        message.error('登录失败,用户信息获取失败')
      }
    } else {
      message.error(res.data.message || '登录失败')
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error('未知错误')
    message.error('登录失败，请重试：' + err.message)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/user/register')
}
</script>

<template>
  <div class="login-container">
    <h2 class="title">账号登录</h2>
    <p class="subtitle">欢迎回来！请输入您的账号信息</p>

    <a-form
      :model="formState"
      name="login"
      autocomplete="off"
      @finish="handleFinish"
      class="login-form"
    >
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" size="large" placeholder="请输入账号">
          <template #prefix>
            <UserOutlined class="field-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="userPassword" :rules="[{ required: true, message: '请输入密码!' }]">
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

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          class="login-button"
          :loading="loading"
          size="large"
          block
        >
          <template #icon><LoginOutlined /></template>
          立即登录
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <a-space>
          <span class="text-muted">还没有账号？</span>
          <a @click="goToRegister" class="register-link">立即注册</a>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<style scoped>
.login-container {
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

.login-form {
  max-width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-form :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.login-form :deep(.ant-input-affix-wrapper) {
  height: 44px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.login-form :deep(.ant-input-affix-wrapper:hover),
.login-form :deep(.ant-input-affix-wrapper:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.login-form :deep(.ant-input) {
  font-size: 15px;
}

.field-icon {
  color: #bfbfbf;
  font-size: 16px;
  transition: color 0.3s ease;
}

.login-form :deep(.ant-input-affix-wrapper:hover) .field-icon,
.login-form :deep(.ant-input-affix-wrapper-focused) .field-icon {
  color: #1890ff;
}

.login-button {
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
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

.register-link {
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-container {
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

  .login-form :deep(.ant-input-affix-wrapper) {
    height: 40px;
  }

  .login-button {
    height: 40px;
    font-size: 15px;
  }
}
</style>
