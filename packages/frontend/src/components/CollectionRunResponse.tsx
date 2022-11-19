import { Table } from "react-daisyui";
import { BsPatchExclamation } from "react-icons/bs";
import { BiBadgeCheck } from "react-icons/bi";
import { Response } from "types";

interface Props {
  response: Response;
}

export default function CollectionRunResponse({ response }: Props) {
  return (
    <div className='flex flex-col'>
      <h2 className='text-xl font-medium my-4'>{response.request.title} Results</h2>
      <Table>
        <Table.Head>
          <span>Property</span>
          <span>Expected</span>
          <span>Actual</span>
          <span>Pass</span>
        </Table.Head>
        <Table.Body>
          {response.assertionResults.map(result => (
            <Table.Row key={result.id}>
              <span>
                {result.assertion.property}
              </span>
              <span>
                {result.assertion.expected}
              </span>
              <span>
                {result.actual}
              </span>
              <span>
                {result.pass ? <BiBadgeCheck size={24} className='text-success'/> : <BsPatchExclamation size={24} className='text-error'/>}
              </span>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
