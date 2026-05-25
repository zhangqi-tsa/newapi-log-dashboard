import { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { login } from '../../services/api'

interface LoginForm {
  username: string
  password: string
}

interface TokenForm {
  accessToken: string
}

interface LoginProps {
  onSuccess: () => void
}

export default function Login({ onSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('password')

  const handlePasswordSubmit = async (values: LoginForm) => {
    setLoading(true)
    try {
      const success = await login(values.username, values.password)
      if (success) {
        message.success('登录成功')
        onSuccess()
      } else {
        message.error('用户名或密码错误')
      }
    } catch (error) {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSubmit = async (values: TokenForm) => {
    setLoading(true)
    try {
      const success = await login('', '', values.accessToken.trim())
      if (success) {
        message.success('登录成功')
        onSuccess()
      } else {
        message.error('Access Token 无效')
      }
    } catch (error) {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: 'password',
      label: '用户名密码',
      children: (
        <Form onFinish={handlePasswordSubmit} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'token',
      label: 'Access Token',
      children: (
        <Form onFinish={handleTokenSubmit} layout="vertical">
          <Form.Item
            name="accessToken"
            rules={[{ required: true, message: '请输入 Access Token' }]}
          >
            <Input.TextArea
              prefix={<KeyOutlined />}
              placeholder="请输入 NewAPI 的 Access Token"
              size="large"
              rows={3}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card
        title="New API Dashboard 登录"
        style={{ width: 400 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          centered
        />
      </Card>
    </div>
  )
}
