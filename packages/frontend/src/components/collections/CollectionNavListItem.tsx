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
  const className = (isActive: boolean): string => {
    return [
        `group-active:text-cadmium-orange flex text-dark-green items-center gap-2`,
        isActive ? `text-cadmium-orange font-medium` : null
      ].filter(Boolean).join(' ')
  }

  return (
    <li className='group flex items-center text-lg whitespace-nowrap leading-5 my-4' key={collection.id}>
      <NavLink to={`${collection.id.toString()}/requests`} className={({isActive}) => className(isActive)}>
        <HiOutlineFolder className='group-hover:scale-105 group-hover:text-cadmium-orange' size='26'/>
        <span className='group-hover:scale-105 group-hover:text-cadmium-orange transition-transform transition-400'>{collection.title}</span>
      </NavLink>
      <Dropdown horizontal='right' className='group group-hover:text-cadmium-orange ml-auto'>
        <Dropdown.Toggle size='xs' color='ghost' className='ml-auto group-hover:text-cadmium-orange'>
          <MdMoreVert size='20' className='fill-current'/>
        </Dropdown.Toggle>
        <Dropdown.Menu className='shadow-xl bg-base-100'>
          <Dropdown.Item className='text-sky-blue' onClick={() => onSelect(collection)}><MdEdit/> Edit</Dropdown.Item>
          <Dropdown.Item className='text-cedar-chest' onClick={() => onDelete(collection)}><MdDelete /> Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

    </li>

  )
}