import {Link, useParams} from 'react-router-dom'
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
  const {collectionId} = useParams()

  const activeClassName = String(collection.id) === collectionId ? 'text-sky-blue font-medium' : 'text-dark-green'

  return (
    <li className={`${activeClassName} group flex-1 flex items-center text-lg whitespace-nowrap leading-5 my-4`} key={collection.id}>
      <Link to={`${collection.id.toString()}/requests`} className='flex items-center gap-2'>
        <HiOutlineFolder className='group-hover:scale-105 group-hover:text-sky-blue' size='26'/>
        <span className='group-hover:scale-105 group-hover:text-sky-blue transition-transform transition-400'>{collection.title}</span>
      </Link>
      <Dropdown hover horizontal='right' className='group group-hover:text-sky-blue ml-auto'>
        <Dropdown.Toggle size='xs' color='ghost' className='ml-auto group-hover:text-sky-blue'>
          <MdMoreVert size='20' className='fill-current'/>
        </Dropdown.Toggle>
        <Dropdown.Menu className='shadow-xl bg-base-100'>
          <Dropdown.Item className='text-sky-blue' onClick={() => onSelect(collection)}><MdEdit/> <span>Edit</span></Dropdown.Item>
          <Dropdown.Item className='text-cedar-chest' onClick={() => onDelete(collection)}><MdDelete /> <span>Delete</span></Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

    </li>

  )
}
