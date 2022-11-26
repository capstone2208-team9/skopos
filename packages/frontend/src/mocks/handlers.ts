import { GetCollection, GetCollectionNames } from "graphql/queries";
import {CreateOneMonitor, CreateOneRequest} from 'graphql/mutations'
import { Monitor} from 'types'
import { graphql } from "msw";

let lastMonitorId = 0
let lastRequestId = 0
const monitors: Monitor[] = []

export const handlers = [
  graphql.query(GetCollectionNames, (req, res, ctx) =>{
    return res(
      ctx.data({
        collections: [
          {id: 1, title: 'Collection 1'},
          {id: 2, title: 'Collection 2'},
        ]
      })
    )
  }),

  graphql.query(GetCollection, (req, res,ctx) =>{
    const collection1 =  {collection:{id:1,title:"Collection 1",requests:[{id:2,title:"Post 1",body:"",url:"https://jsonplaceholder.typicode.com/posts/1",method:"GET",headers:{},stepNumber:1,assertions:[{id:2,expected:"200",property: "status",comparison:"is equal to",__typename:"Assertion"}],__typename:"Request"}],"__typename":"Collection"}}
    const collection2 =  {collection:{id:2,title:"Collection 2",requests:[{id:2,title:"Post 1",body:"",url:"https://jsonplaceholder.typicode.com/posts/1",method:"GET",headers:{},stepNumber:1,assertions:[{id:2,expected:"200",property:"status",comparison:"is equal to",__typename:"Assertion"}],__typename:"Request"}],"__typename":"Collection"}}
    const {where} = req.variables
    return res(
      ctx.data(where.id === 1 ? collection1 : collection2)
    )
  }),

  graphql.mutation(CreateOneMonitor, (req, res, ctx) => {
    const newMonitor = {...req.variables.data, id: lastMonitorId++, __typename: "Monitor"}
    monitors.push(newMonitor)
    return res(
      ctx.data(newMonitor)
    )
  }),

  graphql.mutation(CreateOneRequest, (req, res, ctx) => {
    const newRequest = {data: req.variables.data, id: lastRequestId++, __typename: "Request"}
    return res(
      ctx.data(newRequest)
    )
  })
]