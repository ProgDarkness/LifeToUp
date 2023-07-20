import { gql } from 'graphql-request'

export default {
  DATOS_PACIENTE_CITA: gql`
    mutation getDatosFuncionario($cedula: Int!, $nacionalidad: String!) {
      getDatosFuncionario(cedula: $cedula, nacionalidad: $nacionalidad) {
        nombre1
        nombre2
        apellido1
        apellido2
        sexo
        idpaciente
      }
    }
  `,
  PARENTESCO_PARA_CITA: gql`
    query {
      getparentescos {
        code
        name
      }
    }
  `,
  ESPECIALIDADES_PARA_CITA: gql`
    query {
      getespecialidades {
        code
        name
        orden
      }
    }
  `,
  TIPO_CONSULTA_CITA: gql`
    query {
      getTipoConsulta {
        code
        name
      }
    }
  `,
  TIPO_PACIENTE_PARA_CITA: gql`
    mutation gettipopaciente($userNomina: Boolean!) {
      gettipopaciente(userNomina: $userNomina) {
        code
        name
      }
    }
  `,
  UBICACION_POR_ESPECIALIDAD: gql`
    query getLocalizacionPorEspecialidad($cod_especialidad: Int!) {
      getLocalizacionPorEspecialidad(cod_especialidad: $cod_especialidad) {
        code
        name
      }
    }
  `,
  SOLICITAR_CITA_MEDICA: gql`
    mutation solicitarCitaMedica($InputSolicitudCita: InputSolicitudCita!) {
      solicitarCitaMedica(InputSolicitudCita: $InputSolicitudCita) {
        status
        message
        type
      }
    }
  `,
  TURNOS_DIASSEMANALES_ESPECIALIDAD: gql`
    query getDiasSemanalesTurnos($cod_especialidad: Int!, $co_locacion: Int!) {
      getDiasSemanalesTurnos(
        cod_especialidad: $cod_especialidad
        co_locacion: $co_locacion
      ) {
        turnos {
          code
          name
          co_dia_semana
        }
      }
    }
  `,
  DIAS_DISABLED_ESPECIALIDAD: gql`
    query getDiasDisablePorEspecialidad(
      $cod_especialidad: Int!
      $co_locacion: Int!
      $co_turno: Int!
    ) {
      getDiasDisablePorEspecialidad(
        cod_especialidad: $cod_especialidad
        co_locacion: $co_locacion
        co_turno: $co_turno
      )
    }
  `,
  STATUS_DE_CITA_MEDICA: gql`
    query statusSolicitudCita($cedulaSolicitante: Int!) {
      statusSolicitudCita(cedulaSolicitante: $cedulaSolicitante) {
        fe_cita
        nb_especialidad
        tx_nombre1
        tx_apellido1
        nu_cedula
      }
    }
  `,
  CARGA_FAMILIAR_CITA_MEDICA: gql`
    mutation getCitasCargasFamiliares(
      $id_personal: Int!
      $id_parentesco: Int!
    ) {
      getCitasCargasFamiliares(
        id_personal: $id_personal
        id_parentesco: $id_parentesco
      ) {
        status
        message
        type
        response {
          id
          id_personal
          id_parentesco
          parentesco
          cedula
          nombres
          apellidos
          fecha_nacimiento
          edad
          discapacidad
          sexo
        }
      }
    }
  `,
  NACIMIENTO_EDAD_FUNCIONARIO: gql`
    mutation getEdadNacimientoFuncionario(
      $cedula: Int!
      $nacionalidadU: String!
    ) {
      getEdadNacimientoFuncionario(
        cedula: $cedula
        nacionalidadU: $nacionalidadU
      ) {
        edad
        fecha_nacimiento
      }
    }
  `
}
