import DrawerContent from 'components/shared/DrawerContent'
import Landing from './Landing'
import {ToastProvider} from 'hooks/ToastProvider'
import React, {useState} from 'react'
import {Button, Drawer} from 'react-daisyui'
import {RiMenu3Line} from 'react-icons/ri'
import {Link, Outlet, useLocation} from 'react-router-dom'
import {ReactComponent as Logo} from "assets/SVGs/Skopos_Branding_Final Logo_Favicon_with circle.svg";

export default function Root() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const toggleDrawer = () => setDrawerOpen(prev => !prev)

  return (
    <ToastProvider>
      <Drawer side={<DrawerContent onToggleDrawer={toggleDrawer}/>} open={drawerOpen} onClickOverlay={() => setDrawerOpen(!drawerOpen)} >
        <div className='grid grid-rows-layout p-4 w-full h-full'>
          <header className='flex items-center'>
            <Button size='sm' className='bg-transparent border-none text-dark-green hover:scale-110 hover:bg-transparent hover:text-cadmium-orange' onClick={() => setDrawerOpen(!drawerOpen)}>
              <RiMenu3Line size={28}/>
            </Button>
            <Link to='/' className='pt-2'>
              <Logo height={60} width={60}/>
            </Link>
            <h1 className='tracking-wide text-5xl font-bold self-center m-auto'>Skopos</h1>
          </header>
          <main className="min-w-[680px] w-full">
            {location.pathname === '/' ? (<Landing/>) : (<Outlet/>)}
          </main>
          <footer className='w-full text-center self-center'>
            <p>Illustrations by <a className='text-cadmium-orange font-medium' href='https://undraw.co'>unDraw</a></p>
            <p>Logo Design by Maria Alejandra Bazante</p>
          </footer>
        </div>
      </Drawer>

    </ToastProvider>
  )
}
