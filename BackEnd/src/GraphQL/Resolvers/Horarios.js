import { dbc } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    getTurnos: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const turnos = await dbc.manyOrNone(
          `SELECT co_turno, nb_turno, hh_inicio, hh_fin
          FROM public.i006t_turnos;`
        )

        return turnos
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getTurnosPorHorarioEspe: async (_, { co_especialidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const turnos = await dbc.manyOrNone(
          `SELECT DISTINCT he.co_turno, t.nb_turno, t.hh_inicio, t.hh_fin
            FROM public.d014t_horarios_especialidades he, public.i006t_turnos t 
              WHERE he.co_turno = t.co_turno AND he.co_especialidad = $1 ORDER BY he.co_turno;`,
          [co_especialidad]
        )

        return turnos
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getTablaHorarios: async (_, { coDiaSemana }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const TablaHorarioDiaSemana = await dbc.manyOrNone(
          `SELECT co_personal, ced_usuario, nb_usuario, ap_usuario, nb_especialidad, nb_turno, hh_inicio, hh_fin, nb_locacion, co_horario_personal
          FROM public.horarios_personal WHERE co_dia_semana = $1`,
          [coDiaSemana]
        )

        return TablaHorarioDiaSemana
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getTablaHorariosEspecialidades: async (_, { coDiaSemana }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const TablaHorarioDiaSemanaEspecialidades = await dbc.manyOrNone(
          `SELECT he.co_horario_especialidad, t.co_turno, t.nb_turno, t.hh_inicio, t.hh_fin, e.co_especialidad, e.nb_especialidad, l.co_locacion, l.nb_locacion, he.nu_cantidad_citas_diarias
          FROM public.d014t_horarios_especialidades he, public.i006t_turnos t, public.i012t_dias_semanales ds, public.i001t_especialidades e, public.i003t_locaciones l
          where t.co_turno = he.co_turno and t.co_dia_semana = ds.co_dia_semana and he.co_especialidad = e.co_especialidad and he.co_locacion = l.co_locacion and t.co_dia_semana = $1;`,
          [coDiaSemana]
        )

        return TablaHorarioDiaSemanaEspecialidades
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getLocacion: async (_, { co_especialidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const locaciones = await dbc.manyOrNone(
          `SELECT el.co_locacion as code, l.nb_locacion as name
          FROM public.i003t_locaciones l, public.d007t_especialidades_locacion el
          where el.co_locacion = l.co_locacion and el.co_especialidad = $1;`,
          [co_especialidad]
        )

        return locaciones
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getLocacionPorEspecialidad: async (_, { co_especialidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const locaciones = await dbc.manyOrNone(
          `select el.co_locacion as code, l.nb_locacion as name 
          from public.d007t_especialidades_locacion el, public.i003t_locaciones l 
          where el.co_locacion = l.co_locacion and el.co_especialidad  = $1;`,
          [co_especialidad]
        )

        return locaciones
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getEspecialidadesHorarios: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const especialidades = await dbc.manyOrNone(
          `select distinct e.co_especialidad as code, e.nb_especialidad as name
          FROM public.i001t_especialidades e, public.d007t_especialidades_locacion el 
          where e.co_especialidad = el.co_especialidad order by e.co_especialidad asc;`
        )
        return especialidades
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    insertHorario: async (_, { InputGuardarPersonalHorario }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const { co_turno, co_personal, co_locacion, co_especialidad } =
          InputGuardarPersonalHorario

        const errorHorario = await dbc.oneOrNone(
          `SELECT co_horario_personal
            FROM public.d011t_horarios_personal WHERE co_turno = $1 AND co_personal = $2;`,
          [co_turno, co_personal]
        )

        if (errorHorario) {
          return {
            status: 400,
            message: 'El horario del personal ya existe',
            type: 'error'
          }
        } else {
          await dbc.none(
            `INSERT INTO public.d011t_horarios_personal
          (co_turno, co_personal, co_locacion, co_especialidad)
          VALUES($1, $2, $3, $4);`,
            [co_turno, co_personal, co_locacion, co_especialidad]
          )

          await dbc.none(
            `UPDATE public.d007t_especialidades_locacion
            SET bl_personal_disponible = true
            WHERE co_locacion = $1 and co_especialidad = $2;`,
            [co_locacion, co_especialidad]
          )

          return {
            status: 200,
            message: 'Se ha Creado el Horario Exitosamente',
            type: 'success'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getHorariosDia: async (_, { coDiaSemana }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const DiaSemana = await dbc.oneOrNone(
          `SELECT nb_dia_semana
          FROM public.i012t_dias_semanales WHERE co_dia_semana = $1`,
          [coDiaSemana]
        )

        return { diaConsulta: DiaSemana }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    eliminarHorario: async (_, { codigoHorarioPersonal }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const horarios = await dbc.oneOrNone(
          `SELECT co_horario_personal FROM public.d011t_horarios_personal WHERE co_horario_personal=$1;`,
          [codigoHorarioPersonal]
        )

        if (horarios !== null) {
          const especialidadDeleteHorario = await dbc.oneOrNone(
            `SELECT co_especialidad, co_locacion
            FROM public.d011t_horarios_personal WHERE co_horario_personal = $1;`,
            [codigoHorarioPersonal]
          )

          await dbc.none(
            `DELETE FROM public.d011t_horarios_personal
                WHERE co_horario_personal=$1;
                `,
            [codigoHorarioPersonal]
          )

          const estatusPersonalActivo = await dbc.manyOrNone(
            `SELECT co_horario_personal
            FROM public.d011t_horarios_personal WHERE co_especialidad = $1;`,
            [especialidadDeleteHorario.co_especialidad]
          )

          if (!estatusPersonalActivo.length >= 1) {
            await dbc.none(
              `UPDATE public.d007t_especialidades_locacion
              SET bl_personal_disponible = false, bl_activo = false
              WHERE co_locacion = $1 and co_especialidad = $2;`,
              [
                especialidadDeleteHorario.co_locacion,
                especialidadDeleteHorario.co_especialidad
              ]
            )
          }
        }

        return {
          status: 200,
          message: 'El Horario fue eliminado exitosamente',
          type: 'error'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getCrearPersonalHorario: async (_, { cedula }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const DatosPersonal = await dbc.oneOrNone(
          `SELECT co_usuario, nb_usuario, ap_usuario,  ap2_usuario, nb2_usuario
          FROM public.d008t_usuarios WHERE ced_usuario = $1;`,
          [cedula]
        )

        if (DatosPersonal?.co_usuario) {
          const coPersonal = await dbc.oneOrNone(
            `SELECT co_personal
            FROM public.d009t_personal WHERE co_usuario = $1`,
            [DatosPersonal.co_usuario]
          )

          if (coPersonal?.co_personal) {
            const coEspecialidad = await dbc.oneOrNone(
              `SELECT co_especialidad FROM public.d010t_especialidad_personal WHERE co_personal = $1`,
              [coPersonal.co_personal]
            )

            const nameEspecialidad = await dbc.oneOrNone(
              `SELECT nb_especialidad FROM public.i001t_especialidades WHERE co_especialidad = $1`,
              [coEspecialidad.co_especialidad]
            )

            const personal = {}
            personal.co_personal = coPersonal?.co_personal
            personal.nombre1 = DatosPersonal?.nb_usuario
            personal.nombre2 = DatosPersonal?.nb2_usuario
            personal.apellido1 = DatosPersonal?.ap_usuario
            personal.apellido2 = DatosPersonal?.ap2_usuario
            personal.especialidad = nameEspecialidad?.nb_especialidad
            personal.co_especialidad = coEspecialidad?.co_especialidad

            return {
              personalDatos: personal
            }
          } else {
            return null
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    eliminarHorarioEspecialidad: async (
      _,
      { codigoHorarioEspecialidad },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const horarios = await dbc.oneOrNone(
          `SELECT co_horario_especialidad FROM public.d014t_horarios_especialidades WHERE co_horario_especialidad = $1;`,
          [codigoHorarioEspecialidad]
        )

        if (horarios !== null)
          await dbc.none(
            `DELETE FROM public.d014t_horarios_especialidades
            WHERE co_horario_especialidad=$1;
                `,
            [codigoHorarioEspecialidad]
          )

        return {
          status: 200,
          message: 'El Horario fue eliminado exitosamente',
          type: 'error'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    insertOrUpdateHorarioEspecialidad: async (
      _,
      { inputHorarioEspecialidad },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const {
          co_turno,
          co_especialidad,
          co_locacion,
          nu_cantidad_citas_diarias,
          permiso_editar,
          co_horario_especialidad
        } = inputHorarioEspecialidad

        if (!permiso_editar) {
          const errorHorario = await dbc.oneOrNone(
            `SELECT co_horario_especialidad 
              FROM public.d014t_horarios_especialidades WHERE co_turno = $1 AND co_especialidad = $2 AND co_locacion = $3`,
            [co_turno, co_especialidad, co_locacion]
          )

          if (errorHorario?.co_horario_especialidad) {
            return {
              status: 400,
              message: 'El Horario ya exite para esta Especialidad',
              type: 'error'
            }
          } else {
            await dbc.none(
              `INSERT INTO public.d014t_horarios_especialidades
                (co_turno, co_especialidad, co_locacion, nu_cantidad_citas_diarias)
                  VALUES($1, $2, $3, $4);`,
              [
                co_turno,
                co_especialidad,
                co_locacion,
                nu_cantidad_citas_diarias
              ]
            )

            return {
              status: 200,
              message: 'El Horario fue agregado exitosamente',
              type: 'success'
            }
          }
        } else {
          const errorHorario = await dbc.oneOrNone(
            `SELECT co_horario_especialidad 
              FROM public.d014t_horarios_especialidades WHERE co_horario_especialidad=$1`,
            [co_horario_especialidad]
          )

          if (errorHorario?.co_horario_especialidad) {
            await dbc.none(
              `UPDATE public.d014t_horarios_especialidades
                SET co_turno=$1, co_especialidad=$2, co_locacion=$3, nu_cantidad_citas_diarias=$4
                  WHERE co_horario_especialidad=$5`,
              [
                co_turno,
                co_especialidad,
                co_locacion,
                nu_cantidad_citas_diarias,
                co_horario_especialidad
              ]
            )

            return {
              status: 200,
              message: 'El Horario fue editado exitosamente',
              type: 'success'
            }
          } else {
            return {
              status: 400,
              message: 'El Horario no exite para esta Especialidad',
              type: 'error'
            }
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
