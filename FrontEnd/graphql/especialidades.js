import { gql } from 'graphql-request'

export default {
  GET_ESPECIALIDADES_TABLE: gql`
    query getEspecialidadesTabla {
      getEspecialidadesTabla {
        co_especialidad
        nb_especialidad
        co_locacion
        nb_locacion
        co_especialidad_locacion
        bl_activo
        bl_orden
        bl_personal_disponible
      }
    }
  `,
  GET_CREAR_ESPE_LOCACIONES: gql`
    query {
      getLocacionesCrearEspe {
        name
        code
      }
    }
  `,
  INSERT_ESPECIALIDAD: gql`
    mutation insertarEspecialidad(
      $inputCrearEspecialidad: inputCrearEspecialidad!
    ) {
      insertarEspecialidad(inputCrearEspecialidad: $inputCrearEspecialidad) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_ESPECIALIDAD: gql`
    mutation eliminarEspecialidad($codigoEspecialidadPersonal: Int!) {
      eliminarEspecialidad(
        codigoEspecialidadPersonal: $codigoEspecialidadPersonal
      ) {
        status
        message
        type
      }
    }
  `,
  UPDATE_ESTADO: gql`
    mutation actualizarEspecialidad(
      $codigoEspecialidadLocacion: Int!
      $distinc: Boolean!
    ) {
      actualizarEspecialidad(
        codigoEspecialidadLocacion: $codigoEspecialidadLocacion
        distinc: $distinc
      ) {
        status
        message
        type
      }
    }
  `
}
