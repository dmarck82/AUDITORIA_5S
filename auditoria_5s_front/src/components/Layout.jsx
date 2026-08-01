import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { PageContainer } from './ui'

function Layout() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </>
  )
}

export default Layout
