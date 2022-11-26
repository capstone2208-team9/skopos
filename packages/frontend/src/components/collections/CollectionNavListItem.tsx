import {useState} from 'react'
import {NavLink} from 'react-router-dom'
import {Dropdown } from 'react-daisyui'
import {HiOutlineFolder} from 'react-icons/hi'
import {MdDelete, MdEdit} from 'react-icons/md'
import {MdMoreVert} from 'react-icons/md'
import {ICollection} from 'types'

interface Props {
  collection: Pick<ICollection, 'id' | 'title'>
  onDelete: (collection: Pick<ICollection, 'id' | 'title'>) => Promise<void>
  onSelect: (collection: Pick<ICollection, 'id' | 'title'>) => void
}

export default function CollectionNavListItem({collection, onDelete, onSelect}: Props) {
  const [color, setColor] = useState('text-dark-green')
  const className = (isActive: boolean): string => {
    setColor(isActive ? 'text-sky-blue font-medium' : 'text-dark-green')
    return `flex text-inherit items-center gap-2`
  }

  return (
    <li className={`${color} group hover:text-sky-blue flex items-center text-lg whitespace-nowrap leading-5 my-4`}
        key={collection.id}>
      <NavLink to={`${collection.id}/requests`} className={({isActive}) => className(isActive)}>
        <HiOutlineFolder className='group-hover:scale-105 ' size='26'/>
        <span className='group-hover:scale-105 group-hover:text-sky-blue transition-transform transition-400'>{collection.title}</span>
      </NavLink>
      <Dropdown horizontal='right' className='ml-2 text-inherit'>
        <Dropdown.Toggle size='xs' color='ghost' className='fill-current ml-auto'>
          <MdMoreVert size='20'/>
        </Dropdown.Toggle>
        <Dropdown.Menu className='shadow-xl bg-base-100'>
          <Dropdown.Item className='text-sky-blue' onClick={() => onSelect(collection)}><MdEdit/> Edit</Dropdown.Item>
          <Dropdown.Item className='text-cedar-chest' onClick={() => onDelete(collection)}><MdDelete /> Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </li>

  )
}