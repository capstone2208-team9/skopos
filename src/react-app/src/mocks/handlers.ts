import {GetCollection, GetCollectionNames, GetCollectionsWithoutMonitors, GetMonitors} from 'graphql/queries'
import {
  CreateCollection,
  CreateOneMonitor,
  CreateOneRequest,
  DeleteOneMonitor,
  UpdateCollectionTitle
} from 'graphql/mutations'
import { graphql } from "msw";
import monitors from "mocks/mock_data/monitors"
import collections from 'mocks/mock_data/collections'

let lastMonitorId = 0
let lastRequestId = 0
let lastCollectionId = 20


export const handlers = [
  graphql.query(GetCollectionNames, (req, res, ctx) =>{
    return res(
      ctx.data({
        collections: collections.map(({id, title}) => ({
          id,title,
          _count: { requests: 0}
        }))
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

  graphql.query(GetMonitors, (req, res,ctx) =>{
    return res(
      ctx.data({monitors})
    )
  }),

  graphql.query(GetCollectionsWithoutMonitors, (req, res,ctx) =>{
    return res(
      ctx.data({collections})
    )
  }),

  graphql.mutation(UpdateCollectionTitle, (req, res,ctx) =>{
    const {data, where} = req.variables
    return res(
      ctx.data({updateOneCollection: {id: where.id, title: data.title.set}})
    )
  }),

  graphql.mutation(CreateOneMonitor, (req, res, ctx) => {
    const newMonitor = {...req.variables.data, id: lastMonitorId++, __typename: "Monitor"}
    monitors.push(newMonitor)
    return res(
      ctx.data(newMonitor)
    )
  }),

  graphql.mutation(DeleteOneMonitor, (req, res, ctx) => {
    return res(
      ctx.data({deleteOneMonitor: {id: req.variables.where}})
    )
  }),

  graphql.mutation(CreateOneRequest, (req, res, ctx) => {
    const newRequest = {data: req.variables.data, id: lastRequestId++, __typename: "Request"}
    return res(
      ctx.data(newRequest)
    )
  }),

  graphql.mutation(CreateCollection, (req, res, ctx) => {
    const newCollection = {data: req.variables.data, id: lastCollectionId++, __typename: "Collection"}
    return res(
      ctx.data(newCollection)
    )
  })
]