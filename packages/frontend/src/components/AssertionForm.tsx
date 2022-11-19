import { useState } from 'react'
import {Button, Form, Select} from 'react-daisyui'
import {AiOutlinePlus} from 'react-icons/ai'
import { Assertion} from 'types'

interface AssertionFormProps {
  assertions: Assertion[]
  setAssertions: (assertions: Assertion[]) => void
}

export default function AssertionForm ({ assertions, setAssertions }: AssertionFormProps) {
  const [property, setProperty] = useState<string>("status")
  const [comparison, setComparison] = useState<string>("is equal to")
  const [expected, setExpected] = useState<string>("")
  const [displayBodyInput, setDisplayBodyInput] = useState<boolean>(false)
  const [bodyInput, setBodyInput] = useState<string>("body.")

  const disabled = !property || !comparison || !expected

  const handleAddAssertion = () => {
    setDisplayBodyInput(false)
    setAssertions([...assertions, { property, comparison, expected } ])
  }

  const handlePropertyChange = (value: string) => {
    setProperty(value)
    setDisplayBodyInput(value === 'body')
  }

  const handleBodyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyInput(e.target.value)
    setProperty(e.target.value)
  }

  return (
    <div>
      <div className='flex gap-2 items-center'>
        <Form.Label htmlFor='property'>
          <Select className='select select-bordered select-sm' id='property' name='property'
                  onChange={handlePropertyChange}
          >
            <Select.Option value='status'>Status</Select.Option>
            <Select.Option value='latency'>Latency</Select.Option>
            <Select.Option value='body'>Body</Select.Option>
            <Select.Option value='header'>Header</Select.Option>
          </Select>
        </Form.Label>
        { displayBodyInput?
          <input className='input input-bordered input-sm' value={bodyInput} onChange={handleBodyInputChange} name="value" />
          : null }
        <Form.Label htmlFor='comparison'>
          <Select className='select select-bordered select-sm' id='comparison' name='comparison'
                  onChange={setComparison}
          >
            <Select.Option value='is equal to'>is equal to</Select.Option>
            <Select.Option value='is not equal to'>is not equal to</Select.Option>
            <Select.Option value='is null'>is null</Select.Option>
            <Select.Option value='is not null'>is not null</Select.Option>
            <Select.Option value='is greater than'>is greater than</Select.Option>
            <Select.Option value='is less than'>is less than</Select.Option>
            <Select.Option value='includes'>includes</Select.Option>
            <Select.Option value='does not include'>does not include</Select.Option>
          </Select>
        </Form.Label>
        <input className='input input-bordered input-sm' value={expected} placeholder='expected value' onChange={(e) => setExpected(e.target.value)} name="value" />
        <Button className='bg-viridian-green' type='button' size='sm' onClick={handleAddAssertion}
                disabled={disabled}
        >
          <span className='sr-only'>Add</span>
          <AiOutlinePlus/></Button>
      </div>
    </div>
  )
}