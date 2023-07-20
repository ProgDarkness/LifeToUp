import { dbc, dbs, dba } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    statusSolicitudCita: async (_, { cedulaSolicitante }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const solicitudes = await dbc.manyOrNone(
          `SELECT cm.fe_cita, e.nb_especialidad, p.tx_nombre1, p.tx_apellido1, p.nu_cedula FROM d006t_citas_medicas cm, d001t_paciente p, i001t_especialidades e 
            WHERE cm.ced_solicitante = $1 AND cm.co_estatus = 1 AND cm.co_paciente = p.co_paciente AND e.co_especialidad = cm.co_especialidad`,
          [cedulaSolicitante]
        )
        return solicitudes
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getparentescos: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const parentescos = await dbs.manyOrNone(
          `SELECT parentesco as name, id as code FROM maestras.parentescos WHERE id > 0`
        )
        return parentescos
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getTipoConsulta: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const TipoConsulta = await dbc.manyOrNone(
          `SELECT co_tipo_consulta as code, nb_tipo_consulta as name FROM public.i007t_tipo_consulta WHERE co_tipo_consulta != 15;`
        )
        return TipoConsulta
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getespecialidades: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const especialidades = await dbc.manyOrNone(
          `select distinct e.co_especialidad as code, e.nb_especialidad as name, el.bl_orden as orden
          FROM public.i001t_especialidades e, public.d007t_especialidades_locacion el 
          where e.co_especialidad = el.co_especialidad and el.bl_activo is true order by e.co_especialidad asc;`
        )
        return especialidades
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getLocalizacionPorEspecialidad: async (
      _,
      { cod_especialidad },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const localizacion = await dbc.manyOrNone(
          `SELECT DISTINCT e.co_locacion as code, l.nb_locacion as name
          FROM public.d014t_horarios_especialidades e, public.i003t_locaciones l
          where e.co_locacion = l.co_locacion and e.co_especialidad = $1;`,
          [cod_especialidad]
        )

        return localizacion
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getDiasDisablePorEspecialidad: async (
      _,
      { cod_especialidad, co_locacion, co_turno },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const cantCitas = await dbc.oneOrNone(
          `SELECT nu_cantidad_citas_diarias as cantcupos FROM public.d014t_horarios_especialidades 
          WHERE co_especialidad = $1 AND co_locacion = $2 AND co_turno = $3;`,
          [cod_especialidad, co_locacion, co_turno]
        )

        const ArrayFechas = []
        const fecha = new Date()

        /* condicion de fechas no habilitadas */
        if (fecha.getDate() <= 23) {
          /* fechas no habilitadas de el mes actual */
          fecha.setDate(
            new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()
          )

          for (let x = 1; x <= fecha.getDate(); x++) {
            const fechaConsult =
              fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + x

            const fechasDisable = await dbc.oneOrNone(
              `SELECT COUNT(fe_cita) as cupos FROM public.d006t_citas_medicas 
                                                        WHERE fe_cita = $1 AND co_especialidad = $2 AND co_turno = $3;`,
              [fechaConsult, cod_especialidad, co_turno]
            )

            if (fechasDisable.cupos >= cantCitas.cantcupos) {
              ArrayFechas.push(fechaConsult)
            }
          }
        } else {
          /* fechas no habiles para lo que falte del mes actual y el mes siguiente */
          const diaActual = fecha.getDate()
          fecha.setDate(
            new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()
          )

          for (let x = diaActual; x <= fecha.getDate(); x++) {
            const fechaConsult =
              fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + x

            const fechasDisable = await dbc.oneOrNone(
              `SELECT COUNT(fe_cita) as cupos FROM public.d006t_citas_medicas 
                                                        WHERE fe_cita = $1 AND co_especialidad = $2 AND co_turno = $3;`,
              [fechaConsult, cod_especialidad, co_turno]
            )

            if (fechasDisable.cupos >= cantCitas.cantcupos) {
              ArrayFechas.push(fechaConsult)
            }
          }

          fecha.setMonth(fecha.getMonth() + 1)
          fecha.setDate(
            new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()
          )

          for (let x = 1; x <= fecha.getDate(); x++) {
            const fechaConsult =
              fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + x

            const fechasDisable = await dbc.oneOrNone(
              `SELECT COUNT(fe_cita) as cupos FROM public.d006t_citas_medicas 
                                                        WHERE fe_cita = $1 AND co_especialidad = $2 AND co_turno = $3;`,
              [fechaConsult, cod_especialidad, co_turno]
            )

            if (fechasDisable.cupos >= cantCitas.cantcupos) {
              ArrayFechas.push(fechaConsult)
            }
          }
        }

        return ArrayFechas
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getDiasSemanalesTurnos: async (
      _,
      { cod_especialidad, co_locacion },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      try {
        const turnos_consult = await dbc.manyOrNone(
          `select he.co_turno as code, t.nb_turno as name, t.co_dia_semana from public.i006t_turnos t, public.d014t_horarios_especialidades he 
          where t.co_turno = he.co_turno and he.co_especialidad = $1 AND he.co_locacion = $2 order by he.co_turno asc;`,
          [cod_especialidad, co_locacion]
        )

        return { turnos: turnos_consult }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    gettipopaciente: async (_, { userNomina }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        let tppaciente = null

        if (userNomina) {
          tppaciente = await dbc.manyOrNone(
            `SELECT co_tipo_paciente as code, tp_paciente as name 
            FROM public.i004t_tipo_paciente WHERE co_tipo_paciente in (1, 2);`
          )
        } else {
          tppaciente = await dbc.manyOrNone(
            `SELECT co_tipo_paciente as code, tp_paciente as name 
            FROM public.i004t_tipo_paciente WHERE co_tipo_paciente in (3, 4, 5);`
          )
        }
        return tppaciente
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    solicitarCitaMedica: async (_, { InputSolicitudCita }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const co_estatus = 1

        const {
          fe_solicitud,
          ced_solicitante,
          co_especialidad,
          co_tipo_paciente,
          id_parentesco,
          nu_edad,
          co_locacion,
          discapacidad,
          fe_cita,
          co_tipo_consulta,
          co_turno,
          bl_orden
        } = InputSolicitudCita

        const { nacionalidad_paciente, cedula_paciente, fecha_nacimiento, sexo } =
          InputSolicitudCita

        if (co_especialidad === 2 && sexo !== 'F') {
          return {
            status: 400,
            message:
              'Su genero no corresponde a la especialidad seleccionada.',
            type: 'error'
          }
        }

        if (nu_edad > 18 && co_especialidad === 4) {
          return {
            status: 400,
            message:
              'La edad del paciente no corresponde a la especialidad seleccionada.',
            type: 'error'
          }
        }

        if (nu_edad < 18 && co_especialidad === 2) {
          return {
            status: 400,
            message:
              'La edad del paciente no corresponde a la especialidad seleccionada.',
            type: 'error'
          }
        }
        
        const consult_co_paciente = await dbc.oneOrNone(
          `SELECT co_paciente FROM public.d001t_paciente WHERE nu_cedula = $1;`,
          [cedula_paciente]
        )

        const cant_citas_no_atendidas = await dbc.oneOrNone(
          `SELECT COUNT(co_cita_medica) as citas FROM public.d006t_citas_medicas WHERE ced_solicitante = $1 AND co_estatus = 1;`,
          [ced_solicitante]
        )

        const noRepiteCita = await dbc.oneOrNone(
          `SELECT co_paciente FROM d006t_citas_medicas WHERE 
            co_paciente = (SELECT co_paciente FROM d001t_paciente WHERE nu_cedula = $1) AND 
              co_especialidad = $2 AND fe_cita = $3 AND co_locacion = $4 AND co_turno = $5 AND co_estatus = $5`,
          [
            cedula_paciente,
            co_especialidad,
            fe_cita,
            co_locacion,
            co_turno,
            co_estatus
          ]
        )

        if (noRepiteCita !== null) {
          return {
            status: 400,
            message:
              'El paciente ya tiene una cita solicitada para la fecha: ' +
              fe_cita,
            type: 'error'
          }
        }

        if (cant_citas_no_atendidas.citas >= 3) {
          return {
            status: 400,
            message:
              'Alcanzo el limite de citas. Debe esperar a que sus citas sean atendidas.',
            type: 'error'
          }
        }

        if (consult_co_paciente === null) {
          const nombresApellidos = await dba.oneOrNone(
            `SELECT cod_nacionalidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido
              FROM public.ac WHERE cedula = $1 AND cod_nacionalidad = $2;`,
            [cedula_paciente, nacionalidad_paciente]
          )

          if (nombresApellidos !== null) {
            await dbc.none(
              `INSERT INTO public.d001t_paciente
            (co_nacionalidad, nu_cedula, tx_nombre1, tx_nombre2, tx_apellido1, tx_apellido2, fe_nacimiento, co_sexo)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8);`,
              [
                nacionalidad_paciente,
                cedula_paciente,
                nombresApellidos.primer_nombre,
                nombresApellidos.segundo_nombre,
                nombresApellidos.primer_apellido,
                nombresApellidos.segundo_apellido,
                fecha_nacimiento,
                sexo
              ]
            )

            const consult_co_paciente = await dbc.oneOrNone(
              `SELECT co_paciente FROM public.d001t_paciente WHERE nu_cedula = $1;`,
              [cedula_paciente]
            )

            await dbc.none(
              `INSERT INTO public.d006t_citas_medicas
              ( fe_solicitud, 
                ced_solicitante, 
                co_especialidad, 
                co_tipo_paciente, 
                id_parentesco, 
                co_paciente, 
                co_locacion, 
                fe_cita, 
                co_estatus, 
                nu_edad,
                co_tipo_consulta, 
                co_turno, 
                bl_orden, 
                bl_discapacidad )
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
              [
                fe_solicitud,
                ced_solicitante,
                co_especialidad,
                co_tipo_paciente,
                id_parentesco,
                consult_co_paciente.co_paciente,
                co_locacion,
                fe_cita,
                co_estatus,
                nu_edad,
                co_tipo_consulta,
                co_turno,
                bl_orden,
                discapacidad
              ]
            )

            return {
              status: 200,
              message: 'Solicitud realizada exitosamente.',
              type: 'success'
            }
          } else {
            return {
              status: 400,
              message: 'El paciente no se encuentra registrado',
              type: 'error'
            }
          }
        } else {
          await dbc.none(
            `INSERT INTO public.d006t_citas_medicas
            ( fe_solicitud, 
              ced_solicitante, 
              co_especialidad, 
              co_tipo_paciente, 
              id_parentesco, 
              co_paciente, 
              co_locacion, 
              fe_cita, 
              co_estatus, 
              nu_edad,
              co_tipo_consulta, 
              co_turno, 
              bl_orden, 
              bl_discapacidad )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
            [
              fe_solicitud,
              ced_solicitante,
              co_especialidad,
              co_tipo_paciente,
              id_parentesco,
              consult_co_paciente.co_paciente,
              co_locacion,
              fe_cita,
              co_estatus,
              nu_edad,
              co_tipo_consulta,
              co_turno,
              bl_orden,
              discapacidad
            ]
          )

          return {
            status: 200,
            message: 'Solicitud realizada exitosamente.',
            type: 'success'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getCitasCargasFamiliares: async (
      _,
      { id_personal, id_parentesco },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const cargas = await dbs.manyOrNone(
          `SELECT cf.id, id_personal, id_parentesco, UPPER(p.parentesco) parentesco, 
                                                CASE WHEN cedula IS NULL THEN 'NO CEDULADO' 
                                                ELSE CONCAT(nacionalidad, '-',cedula)
                                                END cedula, 
                                                CONCAT(primer_nombre, ' ', segundo_nombre) nombres, CONCAT(primer_apellido, ' ', segundo_apellido) apellidos, 
                                                to_char(fecha_nacimiento, 'DD/MM/YYYY')::varchar(10) fecha_nacimiento, 
                                                date_part('year',age(fecha_nacimiento))::smallint edad, 
                                                CASE WHEN discapacidad = true THEN 'SI'
                                                      WHEN discapacidad = false AND id_parentesco = 1 THEN 'NO'
                                                ELSE 'NO'
                                                END discapacidad,
                                                sexo
                                                FROM cargas_familiares cf, maestras.parentescos p WHERE p.id = id_parentesco AND id_personal = $1 AND cf.id_parentesco = $2
                                                ORDER BY cf.id DESC`,
          [id_personal, id_parentesco]
        )

        return {
          status: 200,
          message: 'Cargas Familiares encontradas: ' + cargas.length,
          type: 'success',
          response: cargas
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getEdadNacimientoFuncionario: async (
      _,
      { cedula, nacionalidadU },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const FechaNacimientoEdad = await dba.oneOrNone(
          "SELECT fecha_nacimiento, DATE_PART('YEAR', AGE(fecha_nacimiento)) edad FROM public.ac WHERE cedula = $1 AND cod_nacionalidad = $2",
          [cedula, nacionalidadU]
        )

        return FechaNacimientoEdad
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getDatosFuncionario: async (_, { cedula, nacionalidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      let DatosFuncionario
      try {
        const id_paciente_cf = await dbs.oneOrNone(
          `SELECT id FROM auth.usuarios WHERE cedula = $1`,
          [cedula]
        )

        DatosFuncionario = await dba.oneOrNone(
          `SELECT primer_apellido apellido1, segundo_apellido apellido2, primer_nombre nombre1, segundo_nombre nombre2, cod_sexo sexo
          FROM public.ac WHERE cedula = $1 AND cod_nacionalidad = $2`,
          [cedula, nacionalidad]
        )


        if (!DatosFuncionario) {
          DatosFuncionario = await dbc.oneOrNone(
            `SELECT tx_nombre1 nombre1, tx_nombre2 nombre2, tx_apellido1 apellido1, tx_apellido2 apellido2, co_sexo sexo
            FROM public.d001t_paciente WHERE co_nacionalidad = $1 AND nu_cedula = $2;`,
            [nacionalidad, cedula]
          )
        }

        if (id_paciente_cf?.id) {
          DatosFuncionario.idpaciente = id_paciente_cf.id
        }

        return DatosFuncionario
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
