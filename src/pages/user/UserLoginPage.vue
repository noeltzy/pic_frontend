<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
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
  } catch (error) {
    message.error('登录失败，请重试')
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
    <div class="login-box">
      <h2>用户登录</h2>
      <a-form :model="formState" name="login" autocomplete="off" @finish="handleFinish">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="userPassword" :rules="[{ required: true, message: '请输入密码!' }]">
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" class="login-button" :loading="loading" block>
            登录
          </a-button>
        </a-form-item>

        <div class="form-footer">
          <a @click="goToRegister">还没有账号？立即注册</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  background: #f5f5f5;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #1890ff;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
}

.form-footer a {
  color: #1890ff;
  cursor: pointer;
}

.form-footer a:hover {
  color: #40a9ff;
}
</style>
