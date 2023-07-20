import { dbc, dbs, dba } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    getSolicitudes: async (
      _,
      { co_estatus, co_locacion, fe_cita },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const solicitudes = await dbc.manyOrNone(
          `SELECT cm.co_cita_medica, cm.fe_solicitud, cm.ced_solicitante, esp.nb_especialidad, tp.tp_paciente, par.nb_parentesco, 
          pac.nu_cedula, pac.tx_nombre1, pac.tx_nombre2, pac.tx_apellido1, pac.tx_apellido2, loc.nb_locacion, 
          cm.fe_cita, cm.co_estatus, cm.nu_edad, tc.nb_tipo_consulta, tur.nb_turno, cm.bl_orden, 
          cm.bl_discapacidad
      FROM public.d006t_citas_medicas cm, public.i001t_especialidades esp, 
              public.i004t_tipo_paciente tp, public.d001t_paciente pac, public.i003t_locaciones loc,
                  public.i007t_tipo_consulta tc, public.i008t_parentescos par, public.i006t_turnos tur
      where cm.co_especialidad = esp.co_especialidad AND 
              cm.co_tipo_paciente = tp.co_tipo_paciente AND
              cm.co_paciente = pac.co_paciente AND 
              cm.co_locacion = loc.co_locacion AND
              cm.co_tipo_consulta = tc.co_tipo_consulta AND 
              cm.id_parentesco = par.co_parentesco AND
              cm.co_turno = tur.co_turno AND cm.co_estatus = $1 AND cm.co_locacion = $2 AND cm.fe_cita = $3;`,
          [co_estatus, co_locacion, fe_cita]
        )

        return solicitudes
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getPacientes: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const pacientes = await dbc.manyOrNone(
          `SELECT co_paciente, co_nacionalidad, nu_cedula, tx_nombre1, tx_nombre2, tx_apellido1, tx_apellido2, fe_nacimiento, co_sexo, di_habitacion, nu_telefono
          FROM public.d001t_paciente;`
        )

        return pacientes
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getLocalizacion: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const localizacion = await dbc.manyOrNone(
          `SELECT co_locacion as code, nb_locacion as name FROM public.i003t_locaciones WHERE co_locacion in 
                                                      (SELECT co_locacion FROM public.d007t_especialidades_locacion)`
        )

        return localizacion
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    getListaSolicitudesPorPaciente: async (_, { cedulaPaciente }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const Paciente = await dbc.oneOrNone(
          `SELECT p.tx_nombre1, p.tx_nombre2, p.tx_apellido1, p.tx_apellido2 from public.d001t_paciente p WHERE p.nu_cedula = $1;`,
          [cedulaPaciente]
        )

        const Citas = await dbc.manyOrNone(
          `SELECT cm.co_cita_medica, cm.fe_cita, e.nb_especialidad, tc.nb_tipo_consulta, l.nb_locacion, t.nb_turno
          FROM public.d006t_citas_medicas cm, public.d001t_paciente p, public.i001t_especialidades e, public.i003t_locaciones l, 
          public.i007t_tipo_consulta tc, public.i006t_turnos t
          WHERE p.co_paciente = cm.co_paciente AND
          cm.co_especialidad = e.co_especialidad AND
          cm.co_locacion = l.co_locacion AND
          cm.co_turno = t.co_turno AND
          cm.co_tipo_consulta = tc.co_tipo_consulta AND
          cm.co_estatus = 1 AND p.nu_cedula = $1;`,
          [cedulaPaciente]
        )

        return { citas: Citas, paciente: Paciente }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    cancelarCitaPaciente: async (_, { codCita }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        await dbc.none(
          `UPDATE public.d006t_citas_medicas SET co_estatus = 7 WHERE co_cita_medica = $1;`,
          [codCita]
        )

        return {
          status: 200,
          type: 'success',
          message: 'La cita fue cancelada exitosamente'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getActualizarEstatusCita: async (_, { inputCita }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      const { co_cita_medica, co_status } = inputCita

      try {
        await dbc.none(
          `UPDATE d006t_citas_medicas SET co_estatus = $1 WHERE co_cita_medica = $2`,
          [co_status, co_cita_medica]
        )

        const validacion = await dbc.oneOrNone(
          `SELECT co_estatus FROM d006t_citas_medicas WHERE co_cita_medica = $1`,
          [co_cita_medica]
        )

        if (validacion.co_estatus === co_status) {
          return {
            status: 200,
            type: 'success',
            message: 'El estatus de la cita fue cambiado exitosamente'
          }
        } else {
          return {
            status: 404,
            type: 'error',
            message: 'Fallo de actualizacion'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    insertPaciente: async (_, { inputInsertPaciente }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      const {
        co_nacionalidad,
        nu_cedula,
        tx_nombre1,
        tx_nombre2,
        tx_apellido1,
        tx_apellido2,
        fe_nacimiento,
        co_sexo
      } = inputInsertPaciente

      try {
        const paciente = await dbc.oneOrNone(
          `SELECT co_paciente
          FROM public.d001t_paciente WHERE nu_cedula = $1 AND co_nacionalidad = $2;`,
          [nu_cedula, co_nacionalidad]
        )
        if (paciente) {
          return {
            status: 215,
            type: 'error',
            message: 'El paciente ya se encuentra registrado'
          }
        }

        const pacienteAC = await dba.oneOrNone(
          `SELECT primer_nombre
          FROM public.ac WHERE cedula = $1 AND cod_nacionalidad = $2`,
          [nu_cedula, co_nacionalidad]
        )
        if (pacienteAC) {
          return {
            status: 215,
            type: 'error',
            message: 'El paciente puede Solcitar Citas'
          }
        }

        if (!paciente && !pacienteAC) {
          await dbc.none(
            `INSERT INTO public.d001t_paciente
            (co_nacionalidad, nu_cedula, tx_nombre1, tx_nombre2, tx_apellido1, tx_apellido2, fe_nacimiento, co_sexo)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8);`,
            [
              co_nacionalidad,
              nu_cedula,
              tx_nombre1,
              tx_nombre2,
              tx_apellido1,
              tx_apellido2,
              fe_nacimiento,
              co_sexo
            ]
          )

          return {
            status: 200,
            type: 'success',
            message: 'El paciente fue registrado exitosamente'
          }
        }

        return {
          status: 404,
          type: 'error',
          message: 'El proceso fallo intente de nuevo'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
