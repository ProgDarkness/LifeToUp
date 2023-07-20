import { gql } from 'graphql-request'

export default {
  GET_LOCACIONES_PARA_ESPECIALIDAD: gql`
    query getLocacion($co_especialidad: Int!) {
      getLocacion(co_especialidad: $co_especialidad) {
        name
        code
      }
    }
  `,
  GET_LOCACIONES_POR_ESPECIALIDAD: gql`
    query getLocacionPorEspecialidad($co_especialidad: Int!) {
      getLocacionPorEspecialidad(co_especialidad: $co_especialidad) {
        name
        code
      }
    }
  `,
  GET_ESPECIALIDADES_HORARIOS: gql`
    query {
      getEspecialidadesHorarios {
        name
        code
      }
    }
  `,
  GET_HORARIO: gql`
    mutation getHorariosDia($coDiaSemana: Int!) {
      getHorariosDia(coDiaSemana: $coDiaSemana) {
        diaConsulta {
          nb_dia_semana
        }
      }
    }
  `,
  GET_TABLA_HORARIOS: gql`
    query getTablaHorarios($coDiaSemana: Int!) {
      getTablaHorarios(coDiaSemana: $coDiaSemana) {
        co_personal
        ced_usuario
        nb_usuario
        ap_usuario
        nb_especialidad
        nb_turno
        hh_inicio
        hh_fin
        nb_locacion
        co_horario_personal
      }
    }
  `,
  GET_TURNOS: gql`
    query {
      getTurnos {
        co_turno
        nb_turno
        hh_inicio
        hh_fin
      }
    }
  `,
  GET_TURNOS_PRO_ESPECIALIDAD: gql`
    query getTurnosPorHorarioEspe($co_especialidad: Int!) {
      getTurnosPorHorarioEspe(co_especialidad: $co_especialidad) {
        co_turno
        nb_turno
        hh_inicio
        hh_fin
      }
    }
  `,
  GET_CREAR_HORARIO_PERSONAL: gql`
    mutation getCrearPersonalHorario($cedula: Int!) {
      getCrearPersonalHorario(cedula: $cedula) {
        personalDatos {
          nombre1
          nombre2
          apellido1
          apellido2
          especialidad
          co_personal
          co_especialidad
        }
      }
    }
  `,
  INSER_HORARIO: gql`
    mutation insertHorario(
      $InputGuardarPersonalHorario: InputGuardarPersonalHorario!
    ) {
      insertHorario(InputGuardarPersonalHorario: $InputGuardarPersonalHorario) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_HORARIO: gql`
    mutation eliminarHorario($codigoHorarioPersonal: Int!) {
      eliminarHorario(codigoHorarioPersonal: $codigoHorarioPersonal) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_HORARIO_ESPECIALIDAD: gql`
    mutation eliminarHorarioEspecialidad($codigoHorarioEspecialidad: Int!) {
      eliminarHorarioEspecialidad(
        codigoHorarioEspecialidad: $codigoHorarioEspecialidad
      ) {
        status
        message
        type
      }
    }
  `,
  GET_TABLA_HORARIOS_ESPECIALIDADES: gql`
    query getTablaHorariosEspecialidades($coDiaSemana: Int!) {
      getTablaHorariosEspecialidades(coDiaSemana: $coDiaSemana) {
        co_especialidad
        nb_especialidad
        co_turno
        nb_turno
        hh_inicio
        hh_fin
        co_locacion
        nb_locacion
        co_horario_especialidad
        nu_cantidad_citas_diarias
      }
    }
  `,
  INSERT_HORARIO_ESPECIALIDAD: gql`
    mutation insertOrUpdateHorarioEspecialidad(
      $inputHorarioEspecialidad: inputHorarioEspecialidad
    ) {
      insertOrUpdateHorarioEspecialidad(
        inputHorarioEspecialidad: $inputHorarioEspecialidad
      ) {
        status
        message
        type
      }
    }
  `
}
