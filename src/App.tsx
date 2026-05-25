import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import UserSummary from './pages/UserSummary/index'
import ModelDimension from './pages/ModelDimension/index'
import LogDetail from './pages/LogDetail/index'
import Login from './pages/Login/index'
import { useState, useEffect } from 'react'
import { checkAuth } from './services/api'

const { Header, Content } = Layout

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    const path = location.pathname
    // 处理 basename /dashboard 后的路径
    const relativePath = path.replace(/^\/dashboard/, '') || '/'
    if (relativePath === '/') return 'user'
    if (relativePath === '/model') return 'model'
    if (relativePath === '/log') return 'log'
    return 'user'
  }

  const handleNavigate = (key: string) => {
    if (key === 'user') navigate('/')
    else if (key === 'model') navigate('/model')
    else if (key === 'log') navigate('/log')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 'bold', marginRight: 32 }}>
          New API Dashboard
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => handleNavigate(key)}
          items={[
            { key: 'user', icon: <UserOutlined />, label: '用户明细' },
            { key: 'model', icon: <AppstoreOutlined />, label: '模型维度' },
            { key: 'log', icon: <FileTextOutlined />, label: '详细日志' },
          ]}
          style={{ flex: 1, borderBottom: 'none' }}
        />
      </Header>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
          <Routes>
            <Route path="/" element={<UserSummary />} />
            <Route path="/model" element={<ModelDimension />} />
            <Route path="/log" element={<LogDetail />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isLoggedIn = await checkAuth()
        setIsAuthenticated(isLoggedIn)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }
    checkAuthentication()
  }, [])

  // 正在检查登录状态
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <div>加载中...</div>
      </div>
    )
  }

  // 未登录
  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />
  }

  // 已登录
  return <MainLayout />
}
