/* eslint-disable react/no-unknown-property */
import { useRef, useState } from 'react'
import AppLayout from 'components/AppLayout'
import { useRouter } from 'next/router'
import { request } from 'graphql-request'
import GQLLogin from 'graphql/login'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Card } from 'primereact/card'
import CryptoJS from 'crypto-js'
import Image from 'next/image'
import emblema from 'public/images/ELEMENTOS CAMI SISTEMA-06.png'
import { motion } from 'framer-motion'
import { Password } from 'primereact/password'
import { Dialog } from 'primereact/dialog'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import the icons you need
import {
  faUser,
  faKey,
  faCheck,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons'

export default function Index() {
  const router = useRouter()
  const toast = useRef(null)
  const [state, setState] = useState({
    usuario: '',
    clave_: '',
    captcha: JSON.parse(process.env.NEXT_PUBLIC_PRODUCTION) ? '' : 'abc'
  })
  const [correoUser, setCorreoUser] = useState(null)
  const [claveUser, setClaveUser] = useState(null)
  const [confirClave, setConfirClave] = useState(null)
  const [visiblebDialogNewUser, setVisiblebDialogNewUser] = useState(false)
  const hoy = new Date()
  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]

  const login = (variables) => {
    return (
      request(process.env.NEXT_PUBLIC_URL_BACKEND, GQLLogin.LOGIN, variables) ||
      null
    )
  }

  const newUser = (variables) => {
    return (
      request(
        process.env.NEXT_PUBLIC_URL_BACKEND,
        GQLLogin.NEW_USER,
        variables
      ) || null
    )
  }

  const insertNewUser = (variables) => {
    return (
      request(
        process.env.NEXT_PUBLIC_URL_BACKEND,
        GQLLogin.INSERT_NEW_USER,
        variables
      ) || null
    )
  }

  const icon = {
    hidden: {
      opacity: 0,
      pathLength: 0,
      fill: 'rgba(255, 255, 255, 0)'
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      fill: 'rgba(255, 255, 255, 1)'
    }
  }

  const comprobarNewUser = () => {
    newUser({ cedula: parseInt(state.usuario) }).then(
      ({ newUser: { status, message, type, response } }) => {
        if (status === 201) {
          iniciarSesion()
        } else if (status === 200 && state.usuario === state.clave_) {
          setVisiblebDialogNewUser(true)
          toast.current.show({
            severity: type,
            summary: 'Info',
            detail: message,
            life: 8000
          })
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Compruebe los datos de ingreso',
            life: 8000
          })
        }
      }
    )
  }
  /* 14965070 */
  const validarContraseña = () => {
    if (correoUser.includes('@cne.gob.ve')) {
      if (confirClave === claveUser) {
        insertNewUser({
          cedula: parseInt(state.usuario),
          correo: correoUser,
          clave: CryptoJS.AES.encrypt(
            claveUser,
            process.env.NEXT_PUBLIC_SECRET_KEY
          ).toString()
        }).then(({ inserNewUser: { status, message, type } }) => {
          setVisiblebDialogNewUser(false)
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message,
            life: 4000
          })
          setCorreoUser('')
          setClaveUser('')
          setConfirClave('')
          setState({
            usuario: '',
            clave_: '',
            captcha: JSON.parse(process.env.NEXT_PUBLIC_PRODUCTION) ? '' : 'abc'
          })
        })
      } else {
        toast.current.show({
          severity: 'warn',
          summary: 'Info',
          detail: 'La confirmacion no coincide con la contraseña',
          life: 4000
        })
      }
    } else {
      toast.current.show({
        severity: 'warn',
        summary: 'Info',
        detail: 'El correo registrado debe ser un correo valido @cne.gob.ve',
        life: 8000
      })
    }
  }

  const iniciarSesion = () => {
    const input = {
      usuario: state.usuario,
      clave: CryptoJS.AES.encrypt(
        state.clave_,
        process.env.NEXT_PUBLIC_SECRET_KEY
      ).toString(),
      captcha: state.captcha
    }

    login({ input }).then(({ login }) => {
      const loginJson = JSON.parse(
        CryptoJS.AES.decrypt(
          login,
          process.env.NEXT_PUBLIC_SECRET_KEY
        ).toString(CryptoJS.enc.Utf8)
      )
      const { status, message, response } = loginJson
      if (status === 200) {
        const { token, nameRuta } = response
        toast.current.show({
          severity: 'success',
          summary: 'Info',
          detail: message,
          life: 8000
        })

        sessionStorage.clear()
        sessionStorage.setItem('token', token)
        router.push(nameRuta)
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 1000
        })
        sessionStorage.clear()
      }
    })
  }

  const onEnter = (e) => {
    if (e.keyCode === 13 || e.charCode === 13) {
      document.querySelector('#btn-loguear').click()
    }
  }

  const onEnterR = (e) => {
    if (e.keyCode === 13 || e.charCode === 13) {
      document.querySelector('#btn-registrar').click()
    }
  }

  return (
    <AppLayout marca={false}>
      <Toast ref={toast} />
      <div className="w-full text-right pb-[7%] -mt-[9%]">
        <span className="text-white mr-3 font-bold text-xs md:text-base">{`${
          dias[hoy.getDay()]
        } ${hoy.getDate()} de ${
          meses[hoy.getMonth()]
        } de ${hoy.getFullYear()}`}</span>
      </div>
      <div className="w-full grid grid-cols-2">
        <div className="grid items-center">
          <motion.div
            animate={{
              rotateY: [0, 360],
              x: [250, 0],
              opacity: [0, 1],
              scale: [0, 1]
            }}
            transition={{
              duration: 2,
              type: 'Inertia',
              stiffness: 100,
              ease: 'linear'
            }}
          >
            <Card className="w-[55%] h-[60vh] py-14 mx-auto text-center bg-[#62a0a7d7] text-white redondeo-xl">
              <motion.div
                variants={icon}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.5,
                  default: { duration: 4, ease: 'easeInOut' },
                  fill: { duration: 4, ease: [1, 0, 0.8, 1] }
                }}
                className="grid grid-cols-1 gap-6 w-4/5 mx-auto"
              >
                <h6
                  style={{
                    fontWeight: 'bold',
                    fontSize: 30,
                    fontFamily: 'Arial'
                  }}
                >
                  Crea una cuenta
                </h6>
                <div className="p-inputgroup h-8">
                  <span className="p-inputgroup-addon span-sesion">
                    <FontAwesomeIcon icon={faUser} />
                  </span>

                  <InputText
                    id="user"
                    value={state.usuario}
                    autoComplete="off"
                    placeholder="Nombre de usuario"
                    className="redondeo-input-addon"
                    onChange={({ target: { value } }) =>
                      setState((ps) => ({ ...ps, usuario: value }))
                    }
                  />
                </div>
                <div className="p-inputgroup h-8">
                  <span className="p-inputgroup-addon span-sesion">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <Password
                    id="password"
                    placeholder="Correo electronico"
                    className="redondeo-input-addon"
                    value={state.clave_}
                    feedback={false}
                    onKeyPress={onEnter}
                    onChange={({ target }) =>
                      setState((ps) => ({ ...ps, clave_: target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 justify-items-center">
                  <Button
                    id="btn-loguear"
                    icon="pi pi-sign-in"
                    className="redondeo-lg w-40 h-6 bg-[#40b4bf] text-black"
                    label="Registrarse"
                    disabled={state.usuario === '' || state.clave_ === ''}
                    onClick={comprobarNewUser}
                  />
                </div>
                {/* <div className="grid grid-cols-1 text-left">
                  <Link href="/ejemplos">
                    <a className="flex flex-row items-center">
                      <FontAwesomeIcon icon={faUnlockKeyhole} />
                      <label className="ml-2 cursor-pointer">
                        Recuperar clave
                      </label>
                    </a>
                  </Link>

                  {<Button
                    className="rounded-full w-40 h-6 bg-[#40b4bf] text-black"
                    label="Recuperar clave"
                  />}
                </div> */}
              </motion.div>
            </Card>
          </motion.div>
        </div>

        <div className="grid items-center">
          <motion.div
            animate={{
              rotateY: [0, 360],
              x: [250, 0],
              opacity: [0, 1],
              scale: [0, 1]
            }}
            transition={{
              duration: 2,
              type: 'Inertia',
              stiffness: 100,
              ease: 'linear'
            }}
          >
            <Card className="w-[55%] h-[60vh] py-14 mx-auto text-center bg-[#62a0a7d7] text-white redondeo-xl">
              <motion.div
                variants={icon}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.5,
                  default: { duration: 4, ease: 'easeInOut' },
                  fill: { duration: 4, ease: [1, 0, 0.8, 1] }
                }}
                className="grid grid-cols-1 gap-6 w-4/5 mx-auto"
              >
                <h6
                  style={{
                    fontWeight: 'bold',
                    fontSize: 30,
                    fontFamily: 'Arial'
                  }}
                >
                  Inicio de Sesión
                </h6>
                <div className="p-inputgroup h-8">
                  <span className="p-inputgroup-addon span-sesion">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <InputText
                    keyfilter="pint"
                    id="user"
                    value={state.usuario}
                    maxLength={8}
                    autoComplete="off"
                    placeholder="Usuario"
                    className="redondeo-input-addon"
                    onChange={({ target: { value } }) =>
                      setState((ps) => ({ ...ps, usuario: value }))
                    }
                  />
                </div>
                <div className="p-inputgroup h-8">
                  <span className="p-inputgroup-addon span-sesion">
                    <FontAwesomeIcon icon={faKey} />
                  </span>
                  <Password
                    id="password"
                    placeholder="Contraseña"
                    className="redondeo-input-addon"
                    toggleMask
                    value={state.clave_}
                    feedback={false}
                    onKeyPress={onEnter}
                    onChange={({ target }) =>
                      setState((ps) => ({ ...ps, clave_: target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 justify-items-center">
                  <Button
                    id="btn-loguear"
                    icon="pi pi-sign-in"
                    className="redondeo-lg w-40 h-6 bg-[#40b4bf] text-black"
                    label="Entrar"
                    disabled={state.usuario === '' || state.clave_ === ''}
                    onClick={comprobarNewUser}
                  />
                </div>
                {/* <div className="grid grid-cols-1 text-left">
                  <Link href="/ejemplos">
                    <a className="flex flex-row items-center">
                      <FontAwesomeIcon icon={faUnlockKeyhole} />
                      <label className="ml-2 cursor-pointer">
                        Recuperar clave
                      </label>
                    </a>
                  </Link>

                  {<Button
                    className="rounded-full w-40 h-6 bg-[#40b4bf] text-black"
                    label="Recuperar clave"
                  />}
                </div> */}
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* <Button label="Ver Ejemplos" onClick={() => router.push('/ejemplos')} /> */}
      <style jsx global>{`
        .item {
          width: 56%;
          overflow: visible;
          stroke: #fff;
          stroke-width: 2;
          stroke-linejoin: round;
          stroke-linecap: round;
        }

        circle,
        rect,
        line {
          stroke-width: 10px;
          stroke-linecap: round;
          fill: transparent;
        }
        #user,
        #password {
          /* border-top-right-radius: 0;
          border-bottom-right-radius: 0.5rem;
        border-top-right-radius: 9999px;*/
          /* border-bottom-right-radius: 9999px;*/
        }
        .span-sesion {
          border-top-left-radius: 0.5rem !important;
          border-bottom-left-radius: 0.5rem !important;
        }
      `}</style>
    </AppLayout>
  )
}
