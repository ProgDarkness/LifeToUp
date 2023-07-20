import { dbc, dbs } from '../../postgresdb'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    getUsuarios: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const usuarios =
          await dbc.manyOrNone(`SELECT u.co_usuario, u.ced_usuario, u.nb_usuario, u.ap_usuario, r.nb_rol, u.tx_correo, u.status_register
            FROM public.d008t_usuarios u, public.i005t_roles r WHERE u.co_rol =  r.co_rol;`)

        return usuarios
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getRoles: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const roles =
          await dbc.manyOrNone(`SELECT DISTINCT co_rol code, nb_rol as name
          FROM public.i005t_roles ORDER BY co_rol;`)

        return roles
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getRol: async (_, { codeRol }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const rol = await dbc.manyOrNone(
          `SELECT ro.co_rol code, p.tx_permisos permisos, p.id_permiso idpermiso, ru.nb_ruta ruta
          FROM public.i005t_roles ro, public.d013t_permisos p, public.i009t_rutas ru where ro.co_rol = p.co_rol AND p.id_ruta = ru.id_ruta AND ro.co_rol = $1 ORDER BY p.id_permiso;`,
          [codeRol]
        )

        return rol
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    getRutas: async (_, __, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const rutas = await dbc.manyOrNone(`SELECT id_ruta code, nb_ruta as name
          FROM public.i009t_rutas;`)

        return rutas
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  },
  Mutation: {
    getCrearUsuario: async (_, { cedula, nacionalidad }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const usuario = await dbs.oneOrNone(
          `SELECT nombre1, nombre2, apellido1, apellido2, codigo_empleado
        FROM actualizables.nomina WHERE cedula = $1 AND nacionalidad = $2`,
          [cedula, nacionalidad]
        )

        return usuario
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    crearUsuario: async (_, { InputGuardarUsuario }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const {
          ced_usuario,
          nb_usuario,
          nb2_usuario,
          ap_usuario,
          ap2_usuario,
          co_rol
        } = InputGuardarUsuario

        const usuarioError = await dbc.oneOrNone(
          `SELECT co_usuario FROM public.d008t_usuarios WHERE ced_usuario = $1`,
          [ced_usuario]
        )

        if (usuarioError !== null) {
          return {
            status: 400,
            message: 'El usuario ya se encuentra registrado',
            type: 'error'
          }
        } else {
          await dbc.none(
            `INSERT INTO public.d008t_usuarios
            (ced_usuario, nu_clave, nb_usuario, ap_usuario, ap2_usuario, nb2_usuario, co_rol)
            VALUES($1, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', $2, $3, $4, $5, $6)`,
            [
              ced_usuario,
              nb_usuario,
              ap_usuario,
              ap2_usuario,
              nb2_usuario,
              co_rol
            ]
          )

          return {
            status: 200,
            message: 'El usuario fue registrado exitosamente',
            type: 'success'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    crearRolPermiso: async (
      _,
      { InputRolPermisos, plusPermisos },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const { nombre, ruta, permisos, id_rol } = InputRolPermisos

        const rolExistente = await dbc.oneOrNone(
          `SELECT co_rol FROM public.i005t_roles WHERE nb_rol = $1`,
          [nombre]
        )

        if (rolExistente && plusPermisos === false) {
          return {
            status: 210,
            message: 'El rol ya se encuentra registrado',
            type: 'warn'
          }
        } else if (id_rol && plusPermisos === true) {
          const co_rol = await dbc.oneOrNone(
            `SELECT co_rol FROM public.i005t_roles WHERE co_rol = $1`,
            [id_rol]
          )

          const errorPermisoRol = await dbc.oneOrNone(
            `SELECT id_permiso
              FROM public.d013t_permisos WHERE co_rol = $1 and id_ruta = $2;`,
            [co_rol.co_rol, ruta]
          )

          if (errorPermisoRol) {
            return {
              status: 400,
              message: 'El rol ya posee el permiso',
              type: 'error'
            }
          }

          const menu = await dbc.oneOrNone(
            `SELECT tx_menu
            FROM public.i010t_menus WHERE co_rol = $1;`,
            [id_rol]
          )

          const itemsRuta = await dbc.manyOrNone(
            `SELECT json_item
            FROM public.i011t_items_menu WHERE id_ruta = $1`,
            [ruta]
          )

          const arrayItemsRuta = menu.tx_menu

          for (let i = 0; i < itemsRuta.length; i++) {
            arrayItemsRuta.push(itemsRuta[i].json_item)
          }

          const jsonItemsRuta = JSON.stringify(arrayItemsRuta)

          await dbc.none(
            `INSERT INTO public.d013t_permisos
              (co_rol, id_ruta, tx_permisos)
              VALUES($1, $2, $3)`,
            [co_rol.co_rol, ruta, permisos]
          )

          await dbc.none(
            `UPDATE public.i010t_menus
            SET tx_menu=$1
            WHERE co_rol=$2;`,
            [jsonItemsRuta, co_rol.co_rol]
          )

          return {
            status: 200,
            message: 'Al rol se le agregaron permisos exitosamente',
            type: 'success'
          }
        } else {
          const itemsRuta = await dbc.manyOrNone(
            `SELECT json_item
            FROM public.i011t_items_menu WHERE id_ruta = $1`,
            [ruta]
          )
          const arrayItemsRuta = []

          for (let i = 0; i < itemsRuta.length; i++) {
            arrayItemsRuta.push(itemsRuta[i].json_item)
          }

          const jsonItemsRuta = JSON.stringify(arrayItemsRuta)

          await dbc.none(
            `INSERT INTO public.i005t_roles
            (nb_rol)
            VALUES($1)`,
            [nombre]
          )

          const co_rol = await dbc.oneOrNone(
            `SELECT co_rol FROM public.i005t_roles WHERE nb_rol = $1`,
            [nombre]
          )

          await dbc.none(
            `INSERT INTO public.d013t_permisos
            (co_rol, id_ruta, tx_permisos)
            VALUES($1, $2, $3)`,
            [co_rol.co_rol, ruta, permisos]
          )

          await dbc.none(
            `INSERT INTO public.i010t_menus
            (co_rol, tx_menu)
            VALUES($1, $2);`,
            [co_rol.co_rol, jsonItemsRuta]
          )

          return {
            status: 200,
            message: 'El rol se ha registrado exitosamente',
            type: 'success',
            response: co_rol.co_rol
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    eliminarUsuario: async (_, { cedulaUsuario }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const usuarioError = await dbc.oneOrNone(
          `SELECT co_usuario FROM public.d008t_usuarios WHERE ced_usuario = $1`,
          [cedulaUsuario]
        )

        const co_personal = await dbc.oneOrNone(
          `SELECT co_personal FROM public.d009t_personal WHERE co_usuario = $1;`,
          [usuarioError.co_usuario]
        )

        if (usuarioError !== null) {
          if (co_personal?.co_personal) {
            const coPersonal = co_personal.co_personal

            const horario_personal = await dbc.oneOrNone(
              `SELECT co_horario_personal FROM public.d011t_horarios_personal WHERE co_personal = $1;`,
              [coPersonal]
            )

            const especialidad_personal = await dbc.oneOrNone(
              `SELECT co_especialidad_personal FROM public.d010t_especialidad_personal WHERE co_personal = $1;`,
              [coPersonal]
            )

            if (horario_personal) {
              await dbc.none(
                `DELETE FROM public.d011t_horarios_personal
                WHERE co_personal=$1;
                `,
                [coPersonal]
              )
            }

            if (especialidad_personal) {
              await dbc.none(
                `DELETE FROM public.d010t_especialidad_personal
                WHERE co_personal=$1;
                `,
                [coPersonal]
              )
            }

            if (co_personal) {
              await dbc.none(
                `DELETE FROM public.d009t_personal
                WHERE co_personal=$1;
                `,
                [coPersonal]
              )
            }
          }

          await dbc.none(
            `DELETE FROM public.d008t_usuarios
            WHERE ced_usuario=$1
            `,
            [cedulaUsuario]
          )

          return {
            status: 200,
            message: 'El usuario fue eliminado exitosamente',
            type: 'error'
          }
        } else {
          return {
            status: 400,
            message: 'El usuario no se encuentra registrado',
            type: 'error'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    eliminarRol: async (_, { codRol }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const rolUsuarioError = await dbc.manyOrNone(
          `SELECT co_usuario FROM public.d008t_usuarios WHERE co_rol = $1;`,
          [codRol]
        )

        const rolError = await dbc.oneOrNone(
          `SELECT nb_rol, co_rol
          FROM public.i005t_roles WHERE co_rol=$1;
          `,
          [codRol]
        )

        if (rolUsuarioError.length >= 1) {
          return {
            status: 404,
            message: 'El rol no puede ser eliminado porque lo posee un usuario',
            type: 'error'
          }
        }

        if (rolError !== null) {
          await dbc.none(
            `DELETE FROM public.d013t_permisos
              WHERE co_rol=$1;
               `,
            [rolError?.co_rol]
          )

          await dbc.none(
            `DELETE FROM public.i010t_menus
              WHERE co_rol=$1;
             `,
            [rolError?.co_rol]
          )

          await dbc.none(
            `DELETE FROM public.i005t_roles
            WHERE co_rol=$1;
             `,
            [rolError?.co_rol]
          )

          return {
            status: 200,
            message: 'El rol fue eliminado exitosamente',
            type: 'error'
          }
        } else {
          return {
            status: 400,
            message: 'El rol no se encuentra registrado',
            type: 'error'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    resetUser: async (_, { co_usuario }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        await dbc.none(
          `UPDATE public.d008t_usuarios SET status_register = true WHERE co_usuario = $1;`,
          [co_usuario]
        )

        return {
          status: 200,
          message: 'El usuario fue reiniciado exitosamente',
          type: 'success'
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    actualizarPermisosRol: async (
      _,
      { codPermiso, arrayPermisos },
      { auth }
    ) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const permiso = await dbc.oneOrNone(
          `SELECT id_permiso, co_rol, id_ruta, tx_permisos
          FROM public.d013t_permisos WHERE id_permiso = $1;
          
          `,
          [codPermiso]
        )

        if (permiso !== null) {
          await dbc.none(
            `UPDATE public.d013t_permisos
            SET tx_permisos = $2
            WHERE id_permiso = $1;`,
            [codPermiso, arrayPermisos]
          )
          return {
            status: 200,
            message: 'Se actualizo el permiso exitosamente',
            type: 'success'
          }
        } else {
          return {
            status: 400,
            message: 'El permiso no se encuentra registrado',
            type: 'error'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    },
    eliminarPermisosRol: async (_, { codPermiso, co_rol }, { auth }) => {
      if (!auth) throw new ApolloError('Sesión no válida')

      try {
        const permiso = await dbc.oneOrNone(
          `SELECT id_permiso, co_rol, id_ruta, tx_permisos
          FROM public.d013t_permisos WHERE id_permiso = $1;
          
          `,
          [codPermiso]
        )

        const CantPermiso = await dbc.manyOrNone(
          `SELECT id_permiso, co_rol, id_ruta, tx_permisos
          FROM public.d013t_permisos WHERE co_rol = $1;
          
          `,
          [co_rol]
        )

        if (CantPermiso.length > 1) {
          if (permiso !== null) {
            await dbc.none(
              `DELETE FROM public.d013t_permisos
              WHERE id_permiso = $1;`,
              [codPermiso]
            )

            const reConstrucMenu = await dbc.manyOrNone(
              `SELECT id_permiso, co_rol, id_ruta, tx_permisos
              FROM public.d013t_permisos WHERE co_rol = $1;
              
              `,
              [permiso.co_rol]
            )

            const arrayIdRutas = []

            if (reConstrucMenu) {
              reConstrucMenu.map((permiso) => {
                arrayIdRutas.push(permiso.id_ruta)

                return false
              })
            }

            /* const tuplaIdRutas = `(${arrayIdRutas.join(',')})` */

            if (arrayIdRutas.length >= 1) {
              const itemsMenuRutas = []

              for (let i = 0; i < arrayIdRutas.length; i++) {
                const itemsMenu = await dbc.oneOrNone(
                  `SELECT id_ruta, json_item FROM public.i011t_items_menu WHERE id_ruta = $1`,
                  [arrayIdRutas[i]]
                )

                itemsMenuRutas.push(itemsMenu.json_item)
              }

              const jsonItemsRuta = JSON.stringify(itemsMenuRutas)

              await dbc.none(
                `UPDATE public.i010t_menus
                  SET tx_menu = $2
                  WHERE co_rol = $1;`,
                [permiso.co_rol, jsonItemsRuta]
              )
            } else {
              return {
                status: 404,
                message: 'Error al crear el menu',
                type: 'error'
              }
            }
          }

          return {
            status: 200,
            message: 'El permiso fue eliminado exitosamente',
            type: 'error'
          }
        } else {
          return {
            status: 400,
            message: 'Error no se puede eliminar el ultimo permiso del rol',
            type: 'error'
          }
        }
      } catch (e) {
        throw new ApolloError(e.message)
      }
    }
  }
}
