import { gql } from 'graphql-request'

export default {
  GET_SOLICITUDES: gql`
    query getSolicitudes(
      $co_estatus: Int!
      $co_locacion: Int!
      $fe_cita: String!
    ) {
      getSolicitudes(
        co_estatus: $co_estatus
        co_locacion: $co_locacion
        fe_cita: $fe_cita
      ) {
        co_cita_medica
        fe_solicitud
        ced_solicitante
        nb_especialidad
        tp_paciente
        nb_parentesco
        nu_cedula
        tx_nombre1
        tx_nombre2
        tx_apellido1
        tx_apellido2
        nb_locacion
        fe_cita
        co_estatus
        nu_edad
        nb_tipo_consulta
        nb_turno
        bl_orden
        bl_discapacidad
      }
    }
  `,
  GET_LISTA_SOLICITUDES_PACIENTE: gql`
    mutation getListaSolicitudesPorPaciente($cedulaPaciente: Int!) {
      getListaSolicitudesPorPaciente(cedulaPaciente: $cedulaPaciente) {
        citas {
          co_cita_medica
          fe_cita
          nb_especialidad
          nb_tipo_consulta
          nb_locacion
          nb_turno
        }
        paciente {
          tx_nombre1
          tx_nombre2
          tx_apellido1
          tx_apellido2
        }
      }
    }
  `,
  CANCELAR_CITA_PACIENTE: gql`
    mutation cancelarCitaPaciente($codCita: Int!) {
      cancelarCitaPaciente(codCita: $codCita) {
        status
        message
        type
      }
    }
  `,
  GET_PACIENTES: gql`
    query getPacientes {
      getPacientes {
        co_paciente
        co_nacionalidad
        nu_cedula
        tx_nombre1
        tx_nombre2
        tx_apellido1
        tx_apellido2
        fe_nacimiento
        co_sexo
        di_habitacion
        nu_telefono
      }
    }
  `,
  GET_ACTUALIZAR_STATUS_CITA: gql`
    mutation getActualizarEstatusCita($inputCita: inputCita) {
      getActualizarEstatusCita(inputCita: $inputCita) {
        status
        message
        type
      }
    }
  `,
  UBICACION_RECEPCION: gql`
    query getLocalizacion {
      getLocalizacion {
        code
        name
      }
    }
  `,
  INSERT_PACIENTE: gql`
    mutation insertPaciente($inputInsertPaciente: inputInsertPaciente!) {
      insertPaciente(inputInsertPaciente: $inputInsertPaciente) {
        status
        message
        type
      }
    }
  `
}
