import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { PageContainer } from './ui'

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main container">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  )
}

export default Layout
