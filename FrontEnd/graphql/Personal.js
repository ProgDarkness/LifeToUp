import { gql } from 'graphql-request'

export default {
  GET_TIPO_PERSONAL: gql`
    query getTipoPersonal {
      getTipoPersonal {
        code
        name
      }
    }
  `,
  GET_ESPECIALIDADES_PARA_PERSONAL: gql`
    query getEspecialidadesParaPersonal {
      getEspecialidadesParaPersonal {
        code
        name
      }
    }
  `,
  GET_PERSONAL: gql`
    query getPersonal {
      getPersonal {
        co_personal
        co_usuario
        ced_usuario
        nb_usuario
        ap_usuario
        nb_especialidad
        co_empleado
        co_colegio_medicos
        co_ministerio_sanidad
        co_tipo_personal
        visible
      }
    }
  `,
  GET_CREAR_PERSONAL: gql`
    mutation getCrearPersonal($cedula: Int!, $nacionalidad: String!) {
      getCrearPersonal(cedula: $cedula, nacionalidad: $nacionalidad) {
        nombre1
        nombre2
        apellido1
        apellido2
        codigo_empleado
        co_usuario
      }
    }
  `,
  INSERT_PERSONAL: gql`
    mutation insertarPersonal($InputGuardarPersonal: InputGuardarPersonal!) {
      insertarPersonal(InputGuardarPersonal: $InputGuardarPersonal) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_PERSONAL: gql`
    mutation eliminarPersonal($codigoPersonal: Int!) {
      eliminarPersonal(codigoPersonal: $codigoPersonal) {
        status
        message
        type
      }
    }
  `
}
