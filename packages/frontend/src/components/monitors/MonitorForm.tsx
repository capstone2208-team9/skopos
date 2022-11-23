import ToggleInputField from 'components/shared/ToggleInputField'
import React, {useEffect, useState} from 'react'
import {Button, Card, Form, Input} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import Select from 'react-select'
import {ICollection, Monitor, MonitorContactInfo, MonitorCreateInput, MonitorUpdateInput} from 'types'

type SelectOptions = { label: string, value: string }
const units = ['minute', 'hour', 'day']
const unitOptions: SelectOptions[] = units.map(unit => ({value: unit, label: unit.toUpperCase()}))

const defaultUnitOption = (schedule: string) => {
  const units = schedule.split(' ')[1]
  return {
    label: units.toUpperCase(),
    value: units
  }
}

interface Props {
  availableCollections?: ICollection[];
  loading: boolean;
  monitor?: Monitor;
  onSave?: (input: MonitorCreateInput) => void;
  onUpdate?: (input: MonitorUpdateInput) => void;
}


export default function MonitorForm({
  availableCollections = [],
  loading, monitor,
  onSave,
  onUpdate}: Props) {
  const [collections, setCollections] = useState<number[]>([])
  const [contactInfo, setContactInfo] = useState<MonitorContactInfo>(monitor?.contactInfo || {})
  const [value, setValue] = useState(monitor?.schedule.split(' ')[0] || '')
  const [units, setUnits] = useState(monitor?.schedule.split(' ')[1] || 'hours')
  const [disabled, setDisabled] = useState(true)
  const navigate = useNavigate()

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    const inputCollections = collections.map(Number)
    const input = {collections: inputCollections, value, units, contactInfo}
    if (monitor) {
      onUpdate && onUpdate({...input, id: monitor.id})
    } else {
      onSave && onSave(input)
    }
  }

  const handleUpdateContactInfo = (name: string, value: string) => {
    setContactInfo({...contactInfo, [name]: value})
  }

  const collectionOptions = availableCollections?.map(({id, title}: ICollection) => ({value: id, label: title}))

  const {length } = collections

  useEffect(() => {
    let isDisabled = !value || !units
    if (!monitor) {
      isDisabled = length === 0
    }
    setDisabled(isDisabled)
  }, [value, units, length])

  return (
    <Card className='p-4 rounded bg-sky-50 bg-opacity-95 shadow-xl'>
      <Card.Title>
        <h2>{monitor ? 'Edit' : 'Add A'} Monitor</h2>
      </Card.Title>
      <Card.Body>
        <Form id='add-monitor' onSubmit={handleSubmit}>
          <div className='flex gap-4 items-center'>
            <div>
              <Form.Label title='Run every' htmlFor='value'/>
              <Input className='w-24 h-[36px]' type='number' min='1' max='30' name='value' value={value}
                     onChange={(e) => {
                       setValue(e.target.value)
                     }}/>
            </div>
            <div className='form-control'>
              <Form.Label title='Unit' htmlFor='unit'/>
              <Select
                id='unit' name='unit'
                defaultValue={monitor?.schedule ? defaultUnitOption(monitor.schedule) : unitOptions[0]}
                options={unitOptions}
                onChange={(newValue) => {
                  setUnits(newValue?.value || 'hour')
                }}
              />
            </div>
            {/* Only allow adding collections when monitor created */}
            {!monitor && <div className='form-control'>
              <Form.Label title='Collections' htmlFor='collections'/>
              <Select
                id='collections'
                name='collections'
                isMulti
                options={collectionOptions}
                classNamePrefix='select'
                onChange={(newValue) => {
                  setCollections(newValue.map(v => v.value))
                }}
              />
            </div>}
          </div>

          <fieldset>
            <h4 className='capitalize my-2 font-medium'>Get Notified When a monitor fails</h4>
            {/* Alert Email*/}
            <ToggleInputField name='email' value={contactInfo.email || ''} onChangeValue={handleUpdateContactInfo}
                              placeholder='your contact email'
            />
            {/* Alert Slack*/}
            <ToggleInputField name='slack' value={contactInfo.slack || ''} onChangeValue={handleUpdateContactInfo}
                              placeholder='slack webhook url'
            />
            {/* Alert PagerDuty*/}
            <ToggleInputField name='pagerDuty' value={contactInfo.pagerDuty || ''} onChangeValue={handleUpdateContactInfo}
                              placeholder='pagerDuty url'
            />
          </fieldset>
        </Form>
      </Card.Body>
      <Card.Actions className='justify-end'>
        <Button form='add-monitor' type='submit' className='bg-sky-blue'
                disabled={disabled}
        >
          {loading ? <FaSpinner className='animate-spin mr-1'/> : 'Save'}
        </Button>
        <Button className='bg-cadmium-orange' type='button' onClick={() => navigate(-1)}>Cancel</Button>
      </Card.Actions>
    </Card>
  )
}