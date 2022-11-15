import { ApolloProvider } from "@apollo/client";
import client from "lib/apollo-client";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './prism.css'
import { RouterProvider } from 'react-router-dom'
import router from "routes";

// if (process.env.NODE_ENV === 'development') {
//   const {worker} = require('mocks/browser')
//   worker.start().then(() => console.log('worker started'))
// }

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router}/>
    </ApolloProvider>
  </React.StrictMode>
);
