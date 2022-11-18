import {NavLink, useRouteError} from 'react-router-dom'
import { ReactComponent as UndrawSVG} from "assets/undraw_happy_music_g6wc.svg";

export default function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <div className='grid place-items-center gap-4 min-w-screen pt-8'>
      <h1 className='text-5xl font-bold'>Oops!</h1>
      <p>We couldn&post find what you were looking for</p>
      <NavLink className='text-primary' to='/'>Back Home</NavLink>
      <UndrawSVG className='max-w-sm md:max-w-lg'/>
    </div>
  )
}