import AddCollection from 'components/AddCollection'
import DrawerContent from 'components/DrawerContent'
import {ToastProvider} from 'hooks/ToastProvider'
import React, {useState} from 'react'
import {Button, Drawer} from 'react-daisyui'
import {RiMenu3Line} from 'react-icons/ri'
import {Link, Outlet, useLocation} from 'react-router-dom'
import { ReactComponent as CollectionSVG} from 'assets/SVGs/Skopos_Branding_Final Logo_SKOPOS_logo_color.svg'
import {ReactComponent as Logo} from "assets/SVGs/Skopos_Branding_Final Logo_SKOPOS_logo_inverted.svg";

export default function Root() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  const toggleDrawer = () => setDrawerOpen(prev => !prev)

  return (
    <ToastProvider>
      <Drawer side={<DrawerContent onToggleDrawer={toggleDrawer}/>} open={drawerOpen} onClickOverlay={() => setDrawerOpen(!drawerOpen)} >
        <div className='grid grid-rows-layout h-full'>
          <header className='flex items-center p-4'>
            <Button size='xs' color="ghost" onClick={() => setDrawerOpen(!drawerOpen)}>
              <RiMenu3Line size={24}/>
            </Button>
            <Link to='/' className='pt-2'>
              <Logo height={64} width={64}/>
            </Link>
          </header>
          <main className="mt-16 px-8">
            {location.pathname === '/' ? (<div className='grid place-items-center'>
              <AddCollection/>
              <CollectionSVG className='max-w-md'/>
            </div>) : (<Outlet/>)}
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
