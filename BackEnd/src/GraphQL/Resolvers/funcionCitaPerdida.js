import { dbc } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'
import * as cron from 'node-cron'

const swichStatusPerdida = async () => {
  try {
    await dbc.none(`UPDATE public.d006t_citas_medicas
    SET co_estatus=6
    WHERE co_estatus = 1 AND fe_cita BETWEEN now() - CAST('365 days' AS INTERVAL) AND now() - CAST('1 days' AS INTERVAL);
    `)
  } catch (e) {
    throw new ApolloError(e.message)
  }
}

const funcionLimpiarSolicitudes = async () => {
  try {
    cron.schedule('0 1 0 * * *', () => {
      try {
        swichStatusPerdida()
      } catch (e) {
        throw new Error(e.message)
      }
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

funcionLimpiarSolicitudes()
