import { gql } from 'graphql-request'

export default {
  GET_USUARIOS: gql`
    query {
      getUsuarios {
        co_usuario
        ced_usuario
        nb_usuario
        ap_usuario
        nb_rol
        tx_correo
        status_register
      }
    }
  `,
  GET_ROLES: gql`
    query {
      getRoles {
        code
        name
        permisos
        ruta
      }
    }
  `,
  GET_ROL: gql`
    query getRol($codeRol: Int!) {
      getRol(codeRol: $codeRol) {
        permisos
        ruta
        idpermiso
      }
    }
  `,
  GET_RUTAS: gql`
    query {
      getRutas {
        code
        name
      }
    }
  `,
  GET_CREAR_USUARIO: gql`
    mutation getCrearUsuario($cedula: Int!, $nacionalidad: String!) {
      getCrearUsuario(cedula: $cedula, nacionalidad: $nacionalidad) {
        nombre1
        nombre2
        apellido1
        apellido2
        codigo_empleado
      }
    }
  `,
  CREAR_USUARIO: gql`
    mutation crearUsuario($InputGuardarUsuario: InputGuardarUsuario!) {
      crearUsuario(InputGuardarUsuario: $InputGuardarUsuario) {
        status
        message
        type
      }
    }
  `,
  CREAR_ROL: gql`
    mutation crearRolPermiso(
      $InputRolPermisos: InputRolPermisos!
      $plusPermisos: Boolean!
    ) {
      crearRolPermiso(
        InputRolPermisos: $InputRolPermisos
        plusPermisos: $plusPermisos
      ) {
        status
        message
        type
        response
      }
    }
  `,
  ELIMINAR_USUARIO: gql`
    mutation eliminarUsuario($cedulaUsuario: Int!) {
      eliminarUsuario(cedulaUsuario: $cedulaUsuario) {
        status
        message
        type
      }
    }
  `,
  REINICIAR_USUARIO: gql`
    mutation resetUser($co_usuario: Int!) {
      resetUser(co_usuario: $co_usuario) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_ROL: gql`
    mutation eliminarRol($codRol: Int!) {
      eliminarRol(codRol: $codRol) {
        status
        message
        type
      }
    }
  `,
  ACTUALIZAR_PERMISOS: gql`
    mutation actualizarPermisosRol(
      $codPermiso: Int!
      $arrayPermisos: [Boolean]!
    ) {
      actualizarPermisosRol(
        codPermiso: $codPermiso
        arrayPermisos: $arrayPermisos
      ) {
        status
        message
        type
      }
    }
  `,
  ELIMINAR_PERMISOS: gql`
    mutation eliminarPermisosRol($codPermiso: Int!, $co_rol: Int!) {
      eliminarPermisosRol(codPermiso: $codPermiso, co_rol: $co_rol) {
        status
        message
        type
      }
    }
  `
}
