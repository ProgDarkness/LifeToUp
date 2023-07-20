import { dbi, dbc } from '../../postgresdb'
import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { ApolloError } from 'apollo-server-core'

dotenv.config()

export default {
  Query: {
    login: async (_, { input }) => {
      const { SECRET_KEY } = process.env
      const { usuario: numCedula, clave } = input
      try {
        const claveDesencriptada = CryptoJS.AES.decrypt(
          clave,
          SECRET_KEY
        ).toString(CryptoJS.enc.Utf8)
        const hashClave = CryptoJS.SHA256(claveDesencriptada).toString()

        const consultaNomina = await dbi.oneOrNone(
          `SELECT tp_situacion situacion, co_codigo_empleado codigo_empleado, tx_tipo_emp tipo_emp, tx_sexo sexo
                                                        FROM inet.h001t_nomina WHERE nu_cedula = $1`,
          [numCedula]
        )
        if (consultaNomina) {
          const { situacion } = consultaNomina
          if (situacion !== 'A')
            return {
              status: 500,
              message: 'Usted se encuentra inactivo en el Sistema!',
              type: 'error'
            }
        }
        const login = await dbc.oneOrNone(
          `SELECT co_usuario, ced_usuario, nb_usuario, ap_usuario, co_rol, tx_correo, created_at, updated_at
          FROM public.d008t_usuarios WHERE ced_usuario = $1 AND nu_clave = $2;`,
          [numCedula, hashClave]
        )

        if (login) {
          const {
            co_usuario,
            co_rol,
            ced_usuario,
            nb_usuario,
            ap_usuario,
            tx_correo
          } = login

          const rutaPrincipal = await dbc.manyOrNone(
            `SELECT id_permiso, co_rol, id_ruta, tx_permisos
            FROM public.d013t_permisos WHERE co_rol = $1 ORDER BY id_permiso ASC`,
            [co_rol]
          )

          const ConsultaNameRuta = await dbc.oneOrNone(
            `SELECT nb_ruta
            FROM public.i009t_rutas WHERE id_ruta = $1`,
            [rutaPrincipal[0].id_ruta]
          )

          const nameRuta = ConsultaNameRuta.nb_ruta
          const { codigo_empleado, tipo_emp, sexo } = consultaNomina
          login.token = jwt.sign(
            {
              co_usuario,
              codigo_empleado,
              co_rol,
              ced_usuario,
              nb_usuario,
              ap_usuario,
              tx_correo,
              tipo_emp,
              sexo
            },
            SECRET_KEY,
            { expiresIn: 60 * 40 }
          )
          login.nameRuta = nameRuta
          return CryptoJS.AES.encrypt(
            JSON.stringify({
              status: 200,
              message: 'Acceso permitido. Cargando Datos...',
              type: 'success',
              response: login
            }),
            SECRET_KEY
          ).toString()
        } else {
          return CryptoJS.AES.encrypt(
            JSON.stringify({
              status: 202,
              message: 'Usuario y/o Contraseña Incorrectos.',
              type: 'error'
            }),
            SECRET_KEY
          ).toString()
        }
      } catch (e) {
        return CryptoJS.AES.encrypt(
          JSON.stringify({ status: 500, message: e.message, type: 'error' }),
          SECRET_KEY
        ).toString()
      }
    },
    user: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')
      const { SECRET_KEY } = process.env
      const {
        ced_usuario,
        nb_usuario,
        ap_usuario,
        codigo_empleado,
        co_usuario,
        co_rol,
        tx_correo,
        tipo_emp,
        sexo
      } = auth
      auth.token = jwt.sign(
        {
          ced_usuario,
          nb_usuario,
          ap_usuario,
          codigo_empleado,
          co_usuario,
          co_rol,
          tx_correo,
          tipo_emp,
          sexo
        },
        SECRET_KEY,
        { expiresIn: 60 * 100000 }
      )
      return CryptoJS.AES.encrypt(JSON.stringify(auth), SECRET_KEY).toString()
    },
    getMenu: async (_, { idRol }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const menu = await dbc.oneOrNone(
          `SELECT tx_menu
          FROM public.i010t_menus WHERE co_rol = $1`,
          [idRol]
        )

        return menu.tx_menu
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getRolAcceso: async (_, { ruta, idRol }, { auth }) => {
      // if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const idRuta = await dbc.oneOrNone(
          `SELECT id_ruta
            FROM public.i009t_rutas WHERE nb_ruta = $1`,
          [ruta]
        )

        if (idRuta.id_ruta) {
          const permisosRol = await dbc.oneOrNone(
            `SELECT id_permiso, tx_permisos
                                    FROM public.d013t_permisos WHERE co_rol = $1 AND id_ruta = $2`,
            [idRol, idRuta.id_ruta]
          )

          if (permisosRol) {
            return {
              status: 200,
              message: 'Acceso permitido',
              type: 'success',
              response: permisosRol
            }
          } else {
            return {
              status: 404,
              message: 'Acceso denegado',
              type: 'Error'
            }
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    newUser: async (_, { cedula }) => {
      try {
        const statusRegister = await dbc.oneOrNone(
          `SELECT status_register
          FROM public.d008t_usuarios WHERE ced_usuario = $1`,
          [cedula]
        )

        if (statusRegister?.status_register) {
          return {
            status: 200,
            message: 'Usted debe culminar su registro en el Sistema',
            type: 'success',
            response: statusRegister.status_register
          }
        } else {
          return {
            status: 201,
            message: 'Acceso permitido. Cargando Datos...',
            type: 'success'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    inserNewUser: async (_, { cedula, correo, clave }) => {
      try {
        const { SECRET_KEY } = process.env
        const claveDesencriptada = CryptoJS.AES.decrypt(
          clave,
          SECRET_KEY
        ).toString(CryptoJS.enc.Utf8)
        const hashClave = CryptoJS.SHA256(claveDesencriptada).toString()

        if (hashClave !== null) {
          await dbc.oneOrNone(
            `UPDATE public.d008t_usuarios
                SET nu_clave=$3,  tx_correo=$2, status_register=false
                  WHERE ced_usuario=$1;`,
            [cedula, correo, hashClave]
          )

          return {
            status: 200,
            message: 'El usuario se ha registrado correctamente',
            type: 'success'
          }
        }

        return {
          status: 404,
          message: 'Error al registrar usuario',
          type: 'error'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
