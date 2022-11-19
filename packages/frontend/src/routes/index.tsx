import RequestList from 'components/requests/RequestList'
import { createBrowserRouter } from 'react-router-dom'
import CollectionRuns from "routes/CollectionRuns";
import Collections from 'routes/Collections'
import CreateMonitor from "routes/CreateMonitor";
import CreateRequest from 'routes/CreateRequest'
import EditMonitor from "routes/EditMonitor";
import EditRequest from 'routes/EditRequest'
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
            children: [
              {
                path: 'requests',
                element: <RequestList/>,
                children: [
                  {
                    path: 'new',
                    element: <CreateRequest/>
                  },
                  {
                    path: ':requestId/edit',
                    element: <EditRequest/>
                  },
                ],
              },
            ],
          },
        ]
      },
      {
        path: 'monitors',
        element: <Monitors/>,
        children: [
          {
            path: 'new',
            element: <CreateMonitor/>
          },
          {
            path: ':id',
            element: <Monitor/>,
          },
          {
            path: ':id/edit',
            element: <EditMonitor/>,
          },
        ]
      },
      {
        path: 'collection-runs/:collectionId',
        element: <CollectionRuns/>
      },
    ]
  }
])

export default router