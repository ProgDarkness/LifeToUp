import { dbc } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    getEspecialidadesTabla: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const especialidades = dbc.manyOrNone(
          `SELECT el.co_especialidad_locacion, e.co_especialidad, e.nb_especialidad, l.nb_locacion, l.co_locacion, 
          el.bl_activo, el.bl_orden, el.bl_personal_disponible
        FROM public.i001t_especialidades e, public.d007t_especialidades_locacion el, public.i003t_locaciones l 
          WHERE e.co_especialidad = el.co_especialidad AND el.co_locacion = l.co_locacion ORDER BY e.co_especialidad ASC;`
        )

        return especialidades
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getLocacionesCrearEspe: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const locaciones =
          dbc.manyOrNone(`SELECT co_locacion as code, nb_locacion as name
          FROM public.i003t_locaciones;`)

        return locaciones
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    actualizarEspecialidad: async (
      _,
      { codigoEspecialidadLocacion, distinc },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const co_especialidad_locacion = await dbc.oneOrNone(
          `SELECT co_especialidad, bl_activo, bl_orden FROM public.d007t_especialidades_locacion WHERE co_especialidad_locacion = $1 ;`,
          [codigoEspecialidadLocacion]
        )

        if (co_especialidad_locacion !== null) {
          if (distinc) {
            const orden = !co_especialidad_locacion.bl_orden

            await dbc.none(
              `UPDATE public.d007t_especialidades_locacion
                SET bl_orden=$2 
                  WHERE co_especialidad = $1`,
              [co_especialidad_locacion.co_especialidad, orden]
            )

            return {
              status: 200,
              message: 'Se ha cambiado la peticion de Orden en la Especialidad',
              type: 'success'
            }
          } else {
            const status = !co_especialidad_locacion.bl_activo

            await dbc.none(
              `UPDATE public.d007t_especialidades_locacion
                SET bl_activo=$2 
                  WHERE co_especialidad_locacion = $1`,
              [codigoEspecialidadLocacion, status]
            )

            return {
              status: 200,
              message: 'Se ha cambiado el estado de la Especialidad ',
              type: 'success'
            }
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    insertarEspecialidad: async (_, { inputCrearEspecialidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const {
          co_locacion,
          nb_especialidad,
          nb_especialidad_test,
          bl_orden,
          bl_activo,
          editarAgregarLocacion,
          co_especialidad_locacion,
          co_especialidad_edit,
          co_locacion_agg,
          bl_activo_agg
        } = inputCrearEspecialidad

        if (!editarAgregarLocacion) {
          if (nb_especialidad) {
            const errorNombreEspe = await dbc.oneOrNone(
              `SELECT co_especialidad
              FROM public.i001t_especialidades WHERE nb_especialidad = $1`,
              [nb_especialidad.toUpperCase()]
            )

            const errorNombreEspeAcentos = await dbc.oneOrNone(
              `SELECT co_especialidad
              FROM public.i001t_especialidades WHERE nb_especialidad = $1`,
              [nb_especialidad_test.toUpperCase()]
            )

            if (errorNombreEspe || errorNombreEspeAcentos) {
              return {
                status: 400,
                message: 'La especialidad ya existe',
                type: 'error'
              }
            } else {
              await dbc.none(
                `INSERT INTO public.i001t_especialidades (nb_especialidad) VALUES($1)`,
                [nb_especialidad.toUpperCase()]
              )

              const co_especialidad = await dbc.oneOrNone(
                `SELECT co_especialidad
              FROM public.i001t_especialidades WHERE nb_especialidad = $1`,
                [nb_especialidad.toUpperCase()]
              )

              if (co_especialidad) {
                await dbc.none(
                  `INSERT INTO public.d007t_especialidades_locacion
                  (co_especialidad, co_locacion, bl_activo, bl_orden)
                  VALUES($1, $2, $3, $4);`,
                  [
                    co_especialidad.co_especialidad,
                    co_locacion,
                    bl_activo,
                    bl_orden
                  ]
                )

                return {
                  status: 200,
                  message: 'La especialidad fue agregada exitosamente',
                  type: 'success'
                }
              }
            }
          }
        } else if (editarAgregarLocacion) {
          if (co_especialidad_edit) {
            const bl_orden_agg = await dbc.oneOrNone(
              `SELECT bl_orden
              FROM public.d007t_especialidades_locacion WHERE co_especialidad_locacion = $1`,
              [co_especialidad_locacion]
            )

            const errorEspeLocacion = await dbc.oneOrNone(
              `SELECT co_especialidad_locacion
            FROM public.d007t_especialidades_locacion WHERE co_especialidad = $1 and co_locacion = $2;`,
              [co_especialidad_edit, co_locacion_agg]
            )

            if (errorEspeLocacion) {
              return {
                status: 400,
                message: 'La especialidad ya posee la ubicacion',
                type: 'error'
              }
            } else {
              await dbc.none(
                `INSERT INTO public.d007t_especialidades_locacion
                (co_especialidad, co_locacion, bl_activo, bl_orden)
                VALUES($1, $2, $3, $4);`,
                [
                  co_especialidad_edit,
                  co_locacion_agg,
                  bl_activo_agg,
                  bl_orden_agg.bl_orden
                ]
              )

              return {
                status: 200,
                message: 'La especialidad fue agregada exitosamente',
                type: 'success'
              }
            }
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
