import promise from 'bluebird'
import pgPromise from 'pg-promise'
import plantillaConfig from '../../postgres-plantilla.json'
import camiConfig from '../../postgres-cami.json'
import siacperConfig from '../../postgres-siacper.json'
import inetConfig from '../../postgres-inet.json'
import acConfig from '../../postgres-ac.json' 
// import {Diagnostics} from './diagnostics'

const initOptions = {
  promiseLib: promise
}
const pgp = pgPromise(initOptions)
export const dbp = pgp(plantillaConfig)
export const dbc = pgp(camiConfig)
export const dbs = pgp(siacperConfig)
export const dbi = pgp(inetConfig)
export const dba = pgp(acConfig)
// Diagnostics.init(initOptions);
