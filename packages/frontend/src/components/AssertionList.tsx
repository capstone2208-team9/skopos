import {getRequestVariables} from 'components/requests/RequestList'
import {DeleteOneAssertion} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {v4 as uuidv4} from 'uuid'
import React from 'react'
import {Button} from 'react-daisyui'
import {BiTrash} from 'react-icons/bi'
import {Assertion} from 'types'
import AssertionForm from './AssertionForm'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

interface AssertionListProps {
  assertions: Assertion[]
  setAssertions: (assertions: Assertion[]) => void
}

export default function AssertionList({assertions, setAssertions}: AssertionListProps) {
  const {collectionId} = useParams()
  const [deleteOneAssertion] = useMutation(DeleteOneAssertion, {
    update(cache, {data: {deleteOneAssertion}}) {
      cache.updateQuery({ query: GetRequests, variables: getRequestVariables(collectionId) }, (data) => {
        const request = data.requests.find(r => r.assertions.find(a => a.id === deleteOneAssertion.id))
        return {requests: data.requests.map(r=> {
            return r.id === request.id ? (
              {...r, assertions: r.assertions.filter(a => a.id !== deleteOneAssertion.id)}
            ) : r
          })}
      });
    },
  })
  const handleClickDelete = async (idx: number) => {
    const assertion = assertions[idx]
    if (assertion.id) {
      await deleteOneAssertion({
        variables: {
          where: { id: assertion.id}
        }
      })
    }
    const assertionCopy = [...assertions]
    setAssertions(assertionCopy.filter((assertion, copyIdx) => copyIdx !== idx))
  }

  return (
    <div>
      <ul>
      {assertions.map((assertion, idx) => (
        <li className='my-1 flex gap-4 items-center' key={assertion.id ? assertion.id : uuidv4()}>
          <span className='text-sky-blue font-medium capitalize'>{assertion.property} {assertion.comparison} {assertion.expected}</span>
         <Button size='xs' color='ghost' type="button" onClick={() => handleClickDelete(idx)}><BiTrash className='text-lg text-error'/></Button>
        </li>
      ))}
      </ul>
      <AssertionForm assertions={assertions} setAssertions={setAssertions}/>
    </div>
  )
}
