import {v4 as uuidv4} from 'uuid'
import React from 'react'
import {Button} from 'react-daisyui'
import {BiTrash} from 'react-icons/bi'
import {Assertion} from 'types'
import AssertionForm from './AssertionForm'

interface AssertionListProps {
  assertions: Assertion[]
  setAssertions: (assertions: Assertion[]) => void
}

export default function AssertionList({assertions, setAssertions}: AssertionListProps) {
  const handleClickDelete = (idx: number) => {
    const assertionCopy = [...assertions]
    setAssertions(assertionCopy.filter((assertion, copyIdx) => copyIdx !== idx))
  }

  return (
    <div>
      <ul>
      {assertions.map((assertion, idx) => (
        <li className='my-1 flex gap-4 items-center' key={uuidv4()}>
          <span className='text-sky-blue font-medium capitalize'>{assertion.property} {assertion.comparison} {assertion.expected}</span>
         <Button size='xs' color='ghost' type="button" onClick={() => handleClickDelete(idx)}><BiTrash className='text-lg text-error'/></Button>
        </li>
      ))}
      </ul>
      <AssertionForm assertions={assertions} setAssertions={setAssertions}/>
    </div>
  )
}
