import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from 'apollo-server-core'
import { buildSchema } from 'graphql'
import http from 'http'
import * as fs from 'fs'
import * as util from 'util'
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'
import jwt from 'jsonwebtoken'

dotenv.config()
const { SECRET_KEY, PORT, ALLOWED_ORIGINS } = process.env
const DEVELOPMENT = JSON.parse(process.env.DEVELOPMENT)

const createSchema = async () => {
  let typeDefs = ''
  const resolvers = { Query: {}, Mutation: {} }
  let customTypes = ''
  let queries = ''
  let mutations = ''
  const readdir = util.promisify(fs.readdir)
  const readFile = util.promisify(fs.readFile)
  const rootDir = path.resolve(__dirname, 'GraphQL')
  const typeFiles = await readdir(`${rootDir}/Types`).then(res => {
    return res
  })

  for (const file of typeFiles) {
    await readFile(`${rootDir}/Types/${file}`, 'utf8').then(res => {
      const indexTypeQuery1 = res.toString().search('type.{1,5}Query.{0,5}{')
      const indexTypeQuery2 = res.indexOf('}', indexTypeQuery1) + 1

      let typeQuery = ''
      if (indexTypeQuery1 >= 0) {
        typeQuery = res.toString().substring(indexTypeQuery1, indexTypeQuery2)
      }

      const indexTypeMutation1 = res.toString().search('type.{1,5}Mutation.{0,5}{')
      const indexTypeMutation2 = res.indexOf('}', indexTypeMutation1) + 1

      let typeMutation = ''
      if (indexTypeMutation1 >= 0) {
        typeMutation = res.toString().substring(indexTypeMutation1, indexTypeMutation2)
      }

      customTypes += '\n' + res.toString().replace(typeQuery, '').replace(typeMutation, '')
      queries += typeQuery.substring(typeQuery.indexOf('{') + 1, typeQuery.lastIndexOf('}'))
      mutations += typeMutation.substring(typeMutation.indexOf('{') + 1, typeMutation.lastIndexOf('}'))
    })
  }

  const resolverFiles = await readdir(`${rootDir}/Resolvers`).then(res => {
    return res
  })

  for (const file of resolverFiles) {
    const module = await import(`${rootDir}/Resolvers/${file}`)
    resolvers.Query = { ...resolvers.Query, ...module.default?.Query }
    resolvers.Mutation = { ...resolvers.Mutation, ...module.default?.Mutation }
    Object.keys(module.default).forEach(r => {
      if (r !== 'Query' && r !== 'Mutation') {
        Object.assign(resolvers, { [r]: module.default[r] })
      }
    })
  }
  typeDefs = `${customTypes}
                type Query {
                    ${queries}
                }
                type Mutation {
                    ${mutations}
                }`

  const _schemaTypeDefs = buildSchema(typeDefs)

  return { typeDefs: _schemaTypeDefs, resolvers }
}

async function startApolloServer () {
  const { typeDefs, resolvers } = await createSchema()
  const app = express()
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb', extended: true }))
  const corsOptions = {
    origin: ALLOWED_ORIGINS.split(','),
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions))

  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      DEVELOPMENT ? ApolloServerPluginLandingPageGraphQLPlayground() : ApolloServerPluginLandingPageDisabled()
    ],
    playground: DEVELOPMENT,
    introspection: DEVELOPMENT,
    context: ({ req, res }) => {
      const token = req?.headers?.authorization?.split(' ')[1]
      const ALLOWED_ORIGINS_ARRAY = ALLOWED_ORIGINS.split(',')
      const allowedOrigin = req.headers.origin && ALLOWED_ORIGINS_ARRAY.includes(req.headers.origin)
      const context = { req, res, auth: false }

      if (allowedOrigin) {
        if (typeof token !== 'undefined') {
          jwt.verify(token, SECRET_KEY, (error, decoded) => {
            context.auth = error ? false : decoded
          })
        } else {
          context.auth = false
        }
      } else {
        if (req.headers.host === '192.168.210.55:8000' && DEVELOPMENT) {
          context.auth = true
        } else {
          res.statusCode = 401
        }
      }

      return context
    }
  })

  await server.start()

  server.applyMiddleware({ app })
  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve))

  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
}

startApolloServer()
