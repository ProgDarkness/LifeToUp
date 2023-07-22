import { dbi } from '../../postgresdb'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const {
  HOST_CORREO,
  USUARIO_CORREO,
  PASS_CORREO
  /* USUARIO_CORREO1, PASS_CORREO1,
  USUARIO_CORREO2, PASS_CORREO2,
  USUARIO_CORREO3, PASS_CORREO3,
  USUARIO_CORREO4, PASS_CORREO4,
  USUARIO_CORREO5, PASS_CORREO5,
  USUARIO_CORREO6, PASS_CORREO6 */
} = process.env

const poolCorreos = [
  { cuenta: USUARIO_CORREO, clave: PASS_CORREO }
  /* { cuenta: USUARIO_CORREO1, clave: PASS_CORREO1 },
  { cuenta: USUARIO_CORREO2, clave: PASS_CORREO2 },
  { cuenta: USUARIO_CORREO3, clave: PASS_CORREO3 },
  { cuenta: USUARIO_CORREO4, clave: PASS_CORREO4 },
  { cuenta: USUARIO_CORREO5, clave: PASS_CORREO5 },
  { cuenta: USUARIO_CORREO6, clave: PASS_CORREO6 } */
]

/* const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
} */

const enviarCorreo = async (TO_CORREO, SUBJECT, BODY) => {
  try {
    const indexPool = 0 /* getRandomInt(0, 7) */
    const USUARIO_CORREO = poolCorreos[indexPool].cuenta
    const PASS_CORREO = poolCorreos[indexPool].clave
    const transporter = nodemailer.createTransport({
      host: HOST_CORREO,
      port: 587, // 465 587 25
      secure: false,
      auth: { user: USUARIO_CORREO, pass: PASS_CORREO }
    })
    await transporter.sendMail({
      from: `"Sistema de Atención" <${USUARIO_CORREO}>`,
      to: TO_CORREO,
      subject: SUBJECT,
      html: BODY
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const enviarListaCorreos = () => {
  setInterval(async () => {
    const correo = await dbi.oneOrNone(
      'SELECT co_id_lista_correos, tx_correo, tx_subject, tx_body FROM inet.c004t_lista_correos ORDER BY co_id_lista_correos LIMIT 1;'
    )
    if (correo) {
      const { co_id_lista_correos, tx_correo, tx_subject, tx_body } = correo
      enviarCorreo(tx_correo, tx_subject, tx_body)
        .then(async () => {
          await dbi.none(
            'DELETE FROM inet.c004t_lista_correos WHERE co_id_lista_correos = $1;',
            [co_id_lista_correos]
          )
        })
        .catch(async (e) => {
          await dbi.none(
            'INSERT INTO inet.c005t_logs_envio_correos(tx_correo, error) VALUES ($1, $2);',
            [tx_correo, e.message]
          )
          await dbi.none(
            'DELETE FROM inet.c004t_lista_correos WHERE co_id_lista_correos = $1;',
            [co_id_lista_correos]
          )
        })
    }
  }, 15000)
}

enviarListaCorreos()
