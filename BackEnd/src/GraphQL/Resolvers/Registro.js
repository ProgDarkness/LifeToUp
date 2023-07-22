import { dbi, dbs, dbc } from '../../postgresdb'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import axios from 'axios'

export default {
  Mutation: {
    crearCuenta: async (_, { input }) => {
      const { SECRET_KEY, PATH_RELATIVO } = process.env
      const { origin, usuario, correo } = input

      try {
        const comprobarEnvio = await dbi.oneOrNone(
          'SELECT tx_subject FROM inet.c004t_lista_correos WHERE tx_correo = $1 and tx_subject = $2;',
          [correo, 'Registro']
        )

        if (comprobarEnvio)
          return {
            status: 500,
            message:
              'Ya el correo se encuentra en la lista de envio, espere su llegada en su email:' +
              correo,
            type: 'error'
          }

        const token = jwt.sign({ usuario, correo }, SECRET_KEY, {
          expiresIn: 60 * 60
        })

        const body = `<div style="padding: 0 40px; font-size: 22px; font-family: serif; border: 2px solid #3F51B5; border-radius: 30px;">
                        <h4 style="text-align: center;">Sistema de Atención Medica</h4>
                        <p>
                            Para completar su registro,
                                        ingrese al siguiente link y genere su contraseña:<br/><br/>
                            <a href="${origin}${PATH_RELATIVO}/registro/${usuario}/${token}" target="_blank">Crear Clave de acceso</a><br/><br/>
                            <span style="font-size: 16px; color: blue;"><i>Nota: Este es un correo generado automáticamente, por favor no lo responda.</i></span>
                        </p>
                      </div>`

        await dbc.none(
          `INSERT INTO public.new_user(
            nb_usuario, tx_correo)
            VALUES ($1, $2);`,
          [correo, usuario]
        )

        await dbi.none(
          'INSERT INTO inet.c004t_lista_correos(tx_correo, tx_subject, tx_body) VALUES ($1, $2, $3);',
          [correo, 'Registro', body]
        )

        return {
          status: 200,
          message:
            'Solicitud exitosa, le enviaremos al Correo Electrónico ' +
            correo +
            ' un enlace para que genere su Contraseña.',
          type: 'success'
        }
      } catch (e) {
        if (e.message.includes('unique_correo'))
          return {
            status: 500,
            message:
              'Este correo ya está registrado, por favor coloque un correo diferente.',
            type: 'error'
          }
        return { status: 500, message: e.message, type: 'error' }
      }
    },
    crearClave: async (_, { input }) => {
      const { SECRET_KEY } = process.env
      const { token, usuario, clave } = input
      const claveDesencriptada = CryptoJS.AES.decrypt(
        clave,
        SECRET_KEY
      ).toString(CryptoJS.enc.Utf8)
      const hashClave = CryptoJS.SHA256(claveDesencriptada).toString()

      try {
        const decoded = jwt.verify(token, SECRET_KEY)

        if (usuario !== decoded.usuario)
          return {
            status: 500,
            message: 'El Token no pertenece a este usuario.',
            type: 'error'
          }

        await dbc.none(
          `UPDATE public.new_user
          SET tx_clave=$2
          WHERE nb_usuario=$1;`,
          [hashClave, usuario]
        )

        return {
          status: 200,
          message: 'Contraseña generada exitosamente.',
          type: 'success'
        }
      } catch (e) {
        if (e.message === 'jwt malformed')
          return {
            status: 500,
            message: 'El token no tiene el formato correcto.',
            type: 'error'
          }
        return { status: 500, message: `Error: ${e.message}`, type: 'error' }
      }
    },
    recuperar: async (_, { input }) => {
      try {
        const { SECRET_KEY, PATH_RELATIVO } = process.env
        const { origin, cedula } = input
        const trabajador = await dbs.oneOrNone(
          "SELECT nacionalidad, CONCAT(nombre, ' ', apellido) nombre, correo FROM auth.usuarios WHERE cedula = $1;",
          [cedula]
        )

        if (!trabajador)
          return {
            status: 500,
            message: 'Usted no forma parte de la Nómina del CNE.',
            type: 'error'
          }

        const { nacionalidad } = trabajador
        const { tx_sexo: genero } = await dbi.oneOrNone(
          'SELECT tx_sexo FROM inet.h001t_nomina WHERE na_nacionalidad = $1 AND nu_cedula = $2;',
          [nacionalidad, cedula]
        )
        const correo = trabajador.correo
        const existeCorreo = correo !== null
        if (!existeCorreo)
          return {
            status: 500,
            message:
              'Usted aún no está registrado en el sistema, por favor regístrese.',
            type: 'error'
          }

        const comprobarEnvio = await dbi.oneOrNone(
          'SELECT tx_subject FROM inet.c004t_lista_correos WHERE tx_correo = $1 and tx_subject = $2;',
          [correo, 'Recuperación de Contraseña de INTRANET CNE']
        )

        if (comprobarEnvio)
          return {
            status: 500,
            message:
              'Ya el correo se encuentra en la lista de envio, espere su llegada en su email:' +
              correo,
            type: 'error'
          }

        const token = jwt.sign({ cedula, correo }, SECRET_KEY, {
          expiresIn: 60 * 60
        })

        const trabajadorProperCase = trabajador.nombre
          .trim()
          .toLowerCase()
          .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))

        const body = `<div style="padding: 0 40px; font-size: 22px; font-family: serif; border: 2px solid #3F51B5; border-radius: 30px;">
                        <h4 style="text-align: center;">INTRANET</h4>
                        <p>
                            ${
                              genero === 'M' ? 'Sr.' : 'Sra.'
                            } ${trabajadorProperCase}, para volver a generar su clave de acceso en la INTRANET, ingrese al siguiente link:<br/><br/>
                            <a href="${origin}${PATH_RELATIVO}/registro/${cedula}/${token}" target="_blank">Crear Clave de acceso INTRANET</a></a><br/><br/>
                            <span style="font-size: 16px; color: blue;"><i>Nota: Este es un correo generado automáticamente, por favor no lo responda.</i></span>
                        </p>
                      </div>`

        await dbi.none(
          'INSERT INTO inet.c004t_lista_correos(tx_correo, tx_subject, tx_body) VALUES ($1, $2, $3);',
          [correo, 'Recuperación de Contraseña de INTRANET CNE', body]
        )
        return {
          status: 200,
          message:
            'Solicitud exitosa, le enviaremos al Correo Electrónico ' +
            correo +
            ' un enlace para que genere su Contraseña.',
          type: 'success'
        }
      } catch (e) {
        if (e.message.includes('unique_correo'))
          return {
            status: 500,
            message:
              'Este correo ya está registrado, por favor coloque un correo diferente.',
            type: 'error'
          }
        return { status: 500, message: `Error: ${e.message}`, type: 'error' }
      }
    }
  }
}
