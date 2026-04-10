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

const { Header, Content } = Layout

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/' || path === '') return 'user'
    if (path === '/model') return 'model'
    if (path === '/log') return 'log'
    return 'user'
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
          onClick={({ key }) => {
            if (key === 'user') navigate('/')
            else if (key === 'model') navigate('/model')
            else if (key === 'log') navigate('/log')
          }}
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