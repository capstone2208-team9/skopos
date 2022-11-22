import React, {useState} from 'react'
import {Button, Form, Input, Select} from 'react-daisyui'
import {AiOutlinePlus} from 'react-icons/ai'
import {Assertion} from 'types'

interface AssertionFormProps {
  assertions: Assertion[]
  setAssertions: (assertions: Assertion[]) => void
}

export default function AssertionForm({assertions, setAssertions}: AssertionFormProps) {
  const [property, setProperty] = useState<string>('status')
  const [comparison, setComparison] = useState<string>('is equal to')
  const [expected, setExpected] = useState<string>('')
  const [body, setBody] = useState<string>('body.')
  const [headers, setHeaders] = useState<string>('headers.')

  const disabled = !property || !comparison

  const handleAddAssertion = () => {
    setAssertions([...assertions, {property, comparison, expected}])
  }

  const handlePropertyChange = (value: string) => {
    setProperty(value)
  }

  const handleBodyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBody(e.target.value)
    setProperty(e.target.value)
  }

  const handleHeaderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaders(e.target.value)
    setProperty(e.target.value)
  }

  const grid = (['body', 'headers'].includes(property) && !comparison.includes('null')) ? 'grid-cols-3 grid-rows-2' : 'grid-cols-4'

  return (
    <div>
      <div className={`grid ${grid} gap-4 items-end`}>
        <div className='form-control' title='Property'>
          <Form.Label htmlFor='property' title='Property'/>
          <Select id='property' name='property' className='w-full'
                  onChange={handlePropertyChange}
          >
            <Select.Option value='status'>Status</Select.Option>
            <Select.Option value='latency'>Latency</Select.Option>
            <Select.Option value='body'>Body</Select.Option>
            <Select.Option value='headers'>Headers</Select.Option>
          </Select>
        </div>
        {property.startsWith('body') &&
          <div className='form-group'>
            <Form.Label title='Key' htmlFor='body-key'/>
            <Input value={body} onChange={handleBodyInputChange}
                   name='body-key' className='w-full'/>
          </div>
        }
        {property.startsWith('headers') &&
          <div className='form-control'>
            <Form.Label htmlFor='header-key' title='Key'/>
            <Input value={headers} onChange={handleHeaderInputChange}
                   name='header-key' className='w-full'/>
          </div>
        }
        <div className='form-control'>
          <Form.Label htmlFor='comparison' title='Comparison'/>
          <Select id='comparison' name='comparison'
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

        </div>

        {!comparison.includes('null') &&
          <div className='form-control'>
            <Form.Label htmlFor='expected' title='Expected'/>
            <Input value={expected} placeholder='expected value' className='w-full'
                   onChange={(e) => setExpected(e.target.value)} name='expected'/>
          </div>}
        <Button className='bg-sky-blue w-12' type='button' onClick={handleAddAssertion}
                disabled={disabled}
        >
          <span className='sr-only'>Add</span>
          <AiOutlinePlus/></Button>
      </div>
    </div>
  )
}