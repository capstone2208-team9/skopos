import SelectField from 'components/shared/SelectField'
import TextInput from 'components/shared/TextInput'
import ToggleInputField from 'components/shared/ToggleInputField'
import {Field, Form, Formik} from 'formik'
import React from 'react'
import {Button, Card} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import {ICollection, Monitor} from 'types'
import * as Yup from 'yup'

type SelectOptions = { label: string, value: string }
const units = ['minute', 'hour', 'day']
const unitOptions: SelectOptions[] = units.map(unit => ({value: unit, label: unit.toUpperCase()}))

// const defaultUnitOption = (schedule: string) => {
//   const units = schedule.split(' ')[1]
//   return {
//     label: units.toUpperCase(),
//     value: units
//   }
// }

const validationSchema = Yup.object({
  id: Yup.number().nullable(),
  collections: Yup.array().of(Yup.number().required()).default([]),
  value: Yup.number().required(),
  units: Yup.string().oneOf([...units, ...units.map(u => u + 's')]).required(),
  contactInfo: Yup.object().shape({
    email: Yup.string().email('valid email required'),
    slack: Yup.string().url('valid slack url required'),
    pagerDuty: Yup.string().url('valid pagerDuty url required')
  }).nullable(),
})

export type MonitorFormValues = Yup.InferType<typeof validationSchema>

const initialValues: MonitorFormValues = {
  id: undefined,
  collections: [] as number[],
  contactInfo: {},
  units: 'day',
  value: 1,
}

interface Props {
  availableCollections?: ICollection[];
  loading: boolean;
  monitor?: Monitor;
  onSave?: (input: MonitorFormValues) => void;
  onUpdate?: (input: MonitorFormValues) => void;
}


export default function MonitorForm({
                                      availableCollections = [],
                                      loading, monitor,
                                      onSave,
                                      onUpdate
                                    }: Props) {
  const navigate = useNavigate()

  const handleSubmit = async (values: MonitorFormValues) => {
    if (monitor) {
      onUpdate && onUpdate(values)
    } else {
      onSave && onSave(values)
    }
  }

  const collectionOptions = availableCollections?.map(({id, title}: ICollection) => ({value: id, label: title}))

  return (
    <Card className='p-4 rounded bg-sky-50 bg-opacity-95 shadow-xl'>
      <Card.Title>
        <h2>{monitor ? 'Edit' : 'Add A'} Monitor</h2>
      </Card.Title>
      <Card.Body>
        <Formik
          initialValues={monitor ? {
            ...monitor,
            value: Number(monitor.schedule.split(' ').at(0)),
            units: monitor.schedule.split(' ').at(-1)
          } : initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {resetForm}) => {
            await handleSubmit(values as MonitorFormValues)
            resetForm()
          }}
        >
          {({isValid, dirty, values}) => (
            <Form id='add-monitor'>
              <div className='flex gap-4 items-center'>
                <TextInput wrapperClassName='w-20' label='Run every' name='value'/>
                <Field name='units'>
                  {(props) => (
                    <SelectField
                      defaultValue={{label: String(values.units).toUpperCase(), value: String(values.units)}}
                      {...props}
                      options={unitOptions}
                    />
                  )}
                </Field>
                {/* Only allow adding collections when monitor created */}
                {!monitor &&
                  <Field name='collections' multiple={true}>
                    {(props) => (
                      <SelectField
                        defaultValue={collectionOptions.at(0)}
                        isMulti={true}
                        {...props}
                        options={collectionOptions}
                      />
                    )}
                  </Field>
                }
              </div>

              <fieldset className='mb-4'>
                <h4 className='capitalize my-2 font-medium'>Get Notified When a monitor fails</h4>
                {/* Alert Email*/}
                <Field name='contactInfo.email'>
                  {(props) => (
                    <ToggleInputField {...props} placeholder='your contact email'/>
                  )}
                </Field>
                {/* Alert Slack*/}
                <Field name='contactInfo.slack'>
                  {(props) => (
                    <ToggleInputField {...props} placeholder='slack webhook url'/>
                  )}
                </Field>
                {/* Alert PagerDuty*/}
                <Field name='contactInfo.pagerDuty'>
                  {(props) => (
                    <ToggleInputField {...props} placeholder='pagerDuty url'/>
                  )}
                </Field>
              </fieldset>
              <div className='w-full text-right'>
                <Button form='add-monitor' type='submit' className='bg-sky-blue mr-4'
                        disabled={!isValid || !dirty}
                >
                  {loading ? <FaSpinner className='animate-spin mr-1'/> : 'Save'}
                </Button>
                <Button className='bg-cadmium-orange' type='button' onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  )
}