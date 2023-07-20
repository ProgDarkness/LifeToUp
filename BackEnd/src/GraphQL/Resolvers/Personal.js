import { dbc, dbs } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    getEspecialidadesParaPersonal: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const especialidadesParaPersonal = await dbc.manyOrNone(
          `SELECT co_especialidad as code, nb_especialidad as name
              FROM public.i001t_especialidades;`
        )

        return especialidadesParaPersonal
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getPersonal: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const personal = await dbc.manyOrNone(
          `SELECT p.co_personal, u.co_usuario, u.ced_usuario, u.nb_usuario, u.ap_usuario, e.nb_especialidad, p.co_empleado, p.co_colegio_medicos, p.co_ministerio_sanidad, p.visible, p.co_tipo_personal
            FROM public.d009t_personal p, public.d008t_usuarios u, public.d010t_especialidad_personal ep, public.i001t_especialidades e 
              WHERE p.co_usuario = u.co_usuario AND p.co_personal = ep.co_personal AND ep.co_especialidad = e.co_especialidad;`
        )

        return personal
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getTipoPersonal: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const tipoPersonal = await dbc.manyOrNone(
          `SELECT co_tipo_personal as code, nb_tipo_personal as name FROM public.i0013t_tipo_personal;`
        )

        return tipoPersonal
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    getCrearPersonal: async (_, { cedula, nacionalidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const personal = {}
        const codigoEmp = await dbs.oneOrNone(
          `SELECT codigo_empleado
            FROM actualizables.nomina WHERE cedula = $1 AND nacionalidad = $2`,
          [cedula, nacionalidad]
        )

        const DatosPersonal = await dbc.oneOrNone(
          `SELECT co_usuario, nb_usuario, ap_usuario,  ap2_usuario, nb2_usuario
          FROM public.d008t_usuarios WHERE ced_usuario = $1;`,
          [cedula]
        )

        if (codigoEmp?.codigo_empleado) {
          personal.codigo_empleado = codigoEmp?.codigo_empleado
          personal.co_usuario = DatosPersonal?.co_usuario
          personal.nombre1 = DatosPersonal?.nb_usuario
          personal.nombre2 = DatosPersonal?.nb2_usuario
          personal.apellido1 = DatosPersonal?.ap_usuario
          personal.apellido2 = DatosPersonal?.ap2_usuario
        }

        return personal
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },

    eliminarPersonal: async (_, { codigoPersonal }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const cod_personal = await dbc.oneOrNone(
          `SELECT co_personal FROM public.d009t_personal WHERE co_personal=$1;`,
          [codigoPersonal]
        )

        const especialidad_personal = await dbc.oneOrNone(
          `SELECT co_personal FROM public.d010t_especialidad_personal WHERE co_personal=$1;`,
          [cod_personal.co_personal]
        )

        const horarios_personal = await dbc.manyOrNone(
          `SELECT co_horario_personal FROM public.d011t_horarios_personal WHERE co_personal=$1;`,
          [cod_personal.co_personal]
        )

        if (cod_personal !== null) {
          const coPersonal = cod_personal.co_personal
          if (especialidad_personal.co_personal) {
            await dbc.none(
              `DELETE FROM public.d010t_especialidad_personal
                  WHERE co_personal=$1 ;
                  `,
              [coPersonal]
            )
          }

          if (horarios_personal.length >= 1) {
            await dbc.none(
              `DELETE FROM public.d011t_horarios_personal
              WHERE co_personal=$1 ;
                  `,
              [coPersonal]
            )
          }

          await dbc.none(
            `DELETE FROM public.d009t_personal
                  WHERE co_personal=$1;
                  `,
            [codigoPersonal]
          )

          return {
            status: 200,
            message: 'El Personal fue eliminado exitosamente',
            type: 'error'
          }
        } else {
          return {
            status: 400,
            message: 'El personal no se encuentra registrado',
            type: 'error'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },

    insertarPersonal: async (_, { InputGuardarPersonal }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const {
          ced_usuario,
          co_empleado,
          co_colegio_medicos,
          co_ministerio_sanidad,
          co_especialidad,
          co_usuario,
          co_tipo_personal
        } = InputGuardarPersonal

        const validatePersonal = await dbc.oneOrNone(
          `SELECT co_personal FROM public.d009t_personal WHERE co_usuario = $1;`,
          [co_usuario]
        )

        if (!validatePersonal?.co_personal) {
          const validateUser = await dbc.oneOrNone(
            `SELECT created_at FROM public.d008t_usuarios WHERE co_usuario = $1 AND ced_usuario = $2`,
            [co_usuario, ced_usuario]
          )

          if (validateUser.created_at) {
            if (co_tipo_personal === 1) {
              await dbc.none(
                `INSERT INTO public.d009t_personal
                (co_empleado, co_colegio_medicos, co_ministerio_sanidad, visible, co_usuario, co_tipo_personal)
                VALUES($1, $2, $3, true, $4, $5);`,
                [
                  co_empleado,
                  co_colegio_medicos,
                  co_ministerio_sanidad,
                  co_usuario,
                  co_tipo_personal
                ]
              )
            } else if (co_tipo_personal === 2) {
              await dbc.none(
                `INSERT INTO public.d009t_personal
                (co_empleado, visible, co_usuario, co_tipo_personal)
                VALUES($1, true, $2, $3);`,
                [co_empleado, co_usuario, co_tipo_personal]
              )
            }

            const coPersonal = await dbc.oneOrNone(
              `SELECT co_personal FROM public.d009t_personal WHERE co_usuario = $1;`,
              [co_usuario]
            )

            if (coPersonal?.co_personal) {
              await dbc.none(
                `INSERT INTO public.d010t_especialidad_personal
                (co_especialidad, co_personal)
                VALUES($1, $2);`,
                [co_especialidad, coPersonal.co_personal]
              )

              return {
                status: 200,
                message: 'El Personal fue registrado exitosamente',
                type: 'success'
              }
            } else {
              return {
                status: 400,
                message: 'Error al insertar Personal',
                type: 'error'
              }
            }
          } else {
            return {
              status: 400,
              message: 'El Personal no se encuentra registrado como usuario',
              type: 'error'
            }
          }
        } else {
          return {
            status: 400,
            message: 'El Personal ya se encuentra registrado',
            type: 'error'
          }
        }
      } catch (e) {
        if (e.message.includes('unique_co_colegio_medicos')) {
          return {
            status: 400,
            message:
              'El código del colegio de médicos ya se encuentra registrado',
            type: 'error'
          }
        } else if (e.message.includes('unique_co_ministerio_sanidad')) {
          return {
            status: 400,
            message:
              'El código del ministerio de sanidad ya se encuentra registrado',
            type: 'error'
          }
        } else {
          throw new ApolloError(e.message)
        }
      }
    }
  }
}
