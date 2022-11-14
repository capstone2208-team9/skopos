import { createBrowserRouter } from 'react-router-dom'
import CollectionRuns from "routes/CollectionRuns";
import Collections from 'routes/Collections'
import CreateMonitor from "routes/CreateMonitor";
import EditMonitor from "routes/EditMonitor";
import Monitor from "routes/Monitor";
import Monitors from 'routes/Monitors'
import Root from 'routes/Root'
import Collection from 'routes/Collection'
import ErrorPage from 'components/ErrorPage'

const router = createBrowserRouter([
  {
    "path": "/",
    element: <Root/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: 'collections',
        element: <Collections/>,
        children: [
          {
            path: ':collectionId',
            element: <Collection/>,
          }
        ]
      },
      {
        path: 'monitors',
        element: <Monitors/>,
      },
      {
        path: 'monitors/:id',
        element: <Monitor/>,
      },
      {
        path: 'monitors/new',
        element: <CreateMonitor/>
      },
      {
        path: 'monitors/:id/edit',
        element: <EditMonitor/>,
      },
      {
        path: 'collection-runs/:collectionId',
        element: <CollectionRuns/>
      },
    ]
  }
])

export default router