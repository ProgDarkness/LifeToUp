import { gql } from 'graphql-request'

export default {
  GET_MENU: gql`
    query getMenu($idRol: Int!) {
      getMenu(idRol: $idRol) {
        icon
        label
        command
      }
    }
  `,
  GET_ACCESOS_ROL: gql`
    query getRolAcceso($ruta: String!, $idRol: Int!) {
      getRolAcceso(ruta: $ruta, idRol: $idRol) {
        status
        message
        type
        response {
          id_permiso
          tx_permisos
        }
      }
    }
  `,
  NEW_USER: gql`
    mutation newUser($cedula: Int!) {
      newUser(cedula: $cedula) {
        status
        message
        type
        response
      }
    }
  `,
  INSERT_NEW_USER: gql`
    mutation insertNewUser($cedula: Int!, $correo: String!, $clave: String!) {
      inserNewUser(cedula: $cedula, correo: $correo, clave: $clave) {
        status
        message
        type
      }
    }
  `,
  CREAR_CUENTA: gql`
    mutation CrearCuenta($input: InputRegistro!) {
      crearCuenta(input: $input) {
        status
        message
        type
      }
    }
  `,
  CREAR_CLAVE: gql`
    mutation CrearClave($input: InputCrearClave!) {
      crearClave(input: $input) {
        status
        message
        type
      }
    }
  `,
  RECUPERAR: gql`
    mutation Recuperar($input: InputRecuperar!) {
      recuperar(input: $input) {
        status
        message
        type
      }
    }
  `,
  LOGIN: gql`
    query Login($input: InputLogin!) {
      login(input: $input)
    }
  `,
  USER: gql`
    query User {
      user
    }
  `,
  ROLES: gql`
    {
      roles {
        id
        rol
      }
    }
  `
}
