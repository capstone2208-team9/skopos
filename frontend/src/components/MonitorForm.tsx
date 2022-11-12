import { useQuery } from "@apollo/client";
import { GetCollectionsWithoutMonitors} from "graphql/queries";
import React, { useMemo, useState } from "react";
import { Button, Card, Form, Input, Toggle } from "react-daisyui";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { ICollection, Monitor, MonitorCreateInput, MonitorUpdateInput } from "types";

interface Props {
  loading: boolean;
  monitor?: Monitor;
  onSave?: (input: MonitorCreateInput) => void;
  onUpdate?: (input: MonitorUpdateInput) => void;
}

type CollectionData = { collections: Pick<ICollection, "id" | "title" | "monitors">[] }
type SelectOptions = { label: string, value: string }
const units = ["minutes", "hours", "days"];
const unitOptions: SelectOptions[] = units.map(unit => ({ value: unit, label: unit.toUpperCase() }));

const defaultUnitOption = (schedule: string) => {
  let [_, units] = schedule.split(" ");
  return {
    label: units.toUpperCase(),
    value: units
  };
};

export default function MonitorForm({ loading, monitor, onSave = () => {}, onUpdate = () => {
  }
                                    }: Props) {
  const [alert, setAlert] = useState(!!monitor?.contactInfo);
  const [collections, setCollections] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState(monitor?.contactInfo || "");
  const [value, setValue] = useState(monitor?.schedule.split(" ")[0] || "");
  const [units, setUnits] = useState(monitor?.schedule.split(" ")[1] || "hours");
  const { data: collectionData } = useQuery(GetCollectionsWithoutMonitors, {
    variables: {
      where: {
        monitor: {
          is: null,
        }
      }
    },
  });
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const inputCollections = collections.map(Number)
    const input = {collections: inputCollections, value, units, contactInfo}
    return monitor ? onUpdate({...input, id: monitor.id}) : onSave(input);
  };

  const handleToggleAlert = () => {
    if (alert) {
      if (contactInfo) {
        setContactInfo("");
      }
    }
    setAlert(prev => !prev);
  };

  const collectionOptions = useMemo<{label: string, value: string}[]>(() => {
    console.log('usememo')
    if (!collectionData) return [];
    return collectionData.collections.map(({ id, title }) => ({ value: id, label: title }));
  }, [collectionData]);



  return (
    <Card className='p-4'>
      <Card.Title>
        <h2>{monitor ? 'Edit' : 'Add A'} Monitor</h2>
      </Card.Title>
      <Card.Body>
        <Form id="add-monitor" onSubmit={handleSubmit}>
          <div className="flex gap-4 items-center">
            <div>
              <Form.Label title="Run every" htmlFor="value" />
              <Input className="w-24 h-[36px]" type="number" min="1" max="30" name="value" value={value}
                     onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className='form-control'>
              <Form.Label title="Unit" htmlFor='unit' />
              <Select
                id="unit" name="unit"
                defaultValue={monitor?.schedule ? defaultUnitOption(monitor.schedule) : unitOptions[0]}
                options={unitOptions}
                onChange={(newValue) => setUnits(newValue?.value || "hours")}
              />
            </div>
            {!monitor &&  <div className='form-control'>
              <Form.Label title="Collections" htmlFor='collections' />
              <Select
                id="collections"
                name="collections"
                isMulti
                options={collectionOptions}
                classNamePrefix="select"
                onChange={(newValue) => setCollections(newValue.map(v => v.value))}
              />
            </div>}
          </div>
          <div className='flex items-center justify-between'>
            <div className='form-control'>
              <Form.Label htmlFor="notification" title="Alert on Error"/>
              <Toggle size='lg' id="notification" checked={alert} onChange={handleToggleAlert}
                      className="m-2 bg-sky-blue" />
            </div>
            <div className={`form-control ${alert ? '' : ' hidden'}`}>
              <Form.Label title="Email" className="w-full" />
              <Input type="email" name="contactInfo" placeholder="your email" value={contactInfo}
                     onChange={(e) => setContactInfo(e.target.value)} />
            </div>
          </div>
        </Form>
      </Card.Body>
      <Card.Actions className='justify-end'>
        <Button form="add-monitor" type="submit" className="bg-sky-blue">
          {loading ? <FaSpinner className="animate-spin mr-1" /> : 'Save'}
        </Button>
        <Button className="bg-cadmium-orange" type="button" onClick={() => navigate(-1)}>Cancel</Button>
      </Card.Actions>
    </Card>
  );
}