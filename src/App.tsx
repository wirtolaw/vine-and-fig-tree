import { Outlet } from 'react-router-dom'
import BottomTabBar from './components/BottomTabBar'

function App() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <BottomTabBar />
    </>
  )
}

export default App
