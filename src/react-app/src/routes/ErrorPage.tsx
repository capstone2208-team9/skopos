import {NavLink, useRouteError} from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <div className='grid grid-rows-error-page place-items-center max-h-screen gap-4 min-w-screen p-8'>
      <h1 className='text-5xl font-bold'>Oops!</h1>
      <p>We couldn&apos;t find what you were looking for</p>
      <NavLink className='text-primary' to='/'>Back Home</NavLink>
      <div className='h-[75vh]'>
        <img className='max-h-full' src='/SKOPOS_logo_color.png' alt='logo'/>
      </div>
    </div>
  )
}