<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
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

const validatePassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请输入密码')
  }
  if (value.length < 8) {
    return Promise.reject('密码长度不能小于8位')
  }
  return Promise.resolve()
}

const validateConfirmPassword = async (_rule: any, value: string) => {
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
  } catch (error) {
    message.error('注册失败，请重试')
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
    <div class="register-box">
      <h2>用户注册</h2>
      <a-form :model="formState" name="register" autocomplete="off" @finish="handleFinish">
        <a-form-item
          name="userAccount"
          :rules="[
            { required: true, message: '请输入账号!' },
            { min: 4, message: '账号长度不能小于4位!' },
          ]"
        >
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="userPassword" :rules="[{ validator: validatePassword }]">
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="checkPassword" :rules="[{ validator: validateConfirmPassword }]">
          <a-input-password v-model:value="formState.checkPassword" placeholder="请确认密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="register-button"
            :loading="loading"
            block
          >
            注册
          </a-button>
        </a-form-item>

        <div class="form-footer">
          <a @click="goToLogin">已有账号？立即登录</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  background: #f5f5f5;
}

.register-box {
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
