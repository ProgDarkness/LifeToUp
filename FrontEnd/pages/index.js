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
import { motion } from 'framer-motion'
import { Password } from 'primereact/password'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import the icons you need
import { faUser, faKey, faEnvelope } from '@fortawesome/free-solid-svg-icons'

export default function Index() {
  const router = useRouter()
  const toast = useRef(null)
  const [state, setState] = useState({
    usuario: '',
    clave_: ''
  })
  const [stateRegis, setStateRegis] = useState({
    correo: '',
    usuario: ''
  })
  const [cardRegis, setCardRegis] = useState(false)
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

  const crearCuenta = (variables) => {
    return (
      request(
        process.env.NEXT_PUBLIC_URL_BACKEND,
        GQLLogin.CREAR_CUENTA,
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

  const registrase = () => {
    const input = {}
    input.origin = window.location.origin
    input.usuario = stateRegis.usuario
    input.correo = stateRegis.correo

    crearCuenta({ input }).then(
      ({ crearCuenta: { status, message, type } }) => {
        toast.current.show({
          severity: 'Atención',
          summary: 'Info',
          detail: message,
          life: 8000
        })
      }
    )
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
        {!cardRegis && (
          <motion.div
            animate={{
              opacity: [0, 0.5, 1]
            }}
            transition={{
              duration: 2,
              type: 'Inertia',
              stiffness: 100,
              ease: 'linear'
            }}
          >
            <div className="border-r-4 py-16 pr-5">
              <div className="my-auto mx-auto text-white font-extrabold text-6xl text-end">
                <h3 className="text-3xl">Nuestra Meta</h3>
                <h2 className="text-4xl">es Brindarles</h2>
                <h1 className="text-7xl">Atención</h1>
                <h1 className="text-7xl">De Calidad</h1>
              </div>
            </div>
          </motion.div>
        )}
        {cardRegis && (
          <div>
            <motion.div
              animate={{
                rotateY: [0, 360],
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
              <Card className="w-[55%] h-[60vh] py-14 ml-[45vh] mr-[5vh] mx-auto text-center bg-[#4a7091c9] text-white redondeo-xl">
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
                    Crear cuenta
                  </h6>
                  <div className="p-inputgroup h-8">
                    <span className="p-inputgroup-addon span-sesion">
                      <FontAwesomeIcon icon={faUser} />
                    </span>

                    <InputText
                      id="user"
                      value={stateRegis.usuario}
                      autoComplete="off"
                      placeholder="Nombre de usuario"
                      className="redondeo-input-addon"
                      onChange={({ target: { value } }) =>
                        setStateRegis((ps) => ({ ...ps, usuario: value }))
                      }
                    />
                  </div>
                  <div className="p-inputgroup h-8">
                    <span className="p-inputgroup-addon span-sesion">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <InputText
                      id="password"
                      placeholder="Correo electronico"
                      className="redondeo-input-addon"
                      value={stateRegis.correo}
                      feedback={false}
                      onKeyPress={onEnterR}
                      onChange={({ target }) =>
                        setStateRegis((ps) => ({ ...ps, correo: target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 justify-items-center">
                    <Button
                      id="btn-registrar"
                      icon="pi pi-sign-in"
                      className="redondeo-lg w-40 h-6 bg-[#40b4bf] text-black"
                      label="Registrarse"
                      disabled={
                        stateRegis.usuario === '' || stateRegis.correo === ''
                      }
                      onClick={registrase}
                    />
                    <Button
                      className="redondeo-lg w-40 h-6 mt-5 bg-[#40b4bf] text-black"
                      label="Volver"
                      onClick={() => {
                        setCardRegis(false)
                      }}
                    />
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        )}
        {cardRegis && (
          <motion.div
            animate={{
              opacity: [0, 0.5, 1]
            }}
            transition={{
              duration: 2,
              type: 'Inertia',
              stiffness: 100,
              ease: 'linear'
            }}
          >
            <div className="border-l-4 py-16 pl-5">
              <div className="my-auto mx-auto text-white font-extrabold text-6xl text-start">
                <h3 className="text-3xl">Nuestra Meta</h3>
                <h2 className="text-4xl">es Brindarles</h2>
                <h1 className="text-7xl">Atención</h1>
                <h1 className="text-7xl">De Calidad</h1>
              </div>
            </div>
          </motion.div>
        )}

        {!cardRegis && (
          <div>
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
              <Card className="w-[55%] h-[60vh] py-14 ml-[5vh] mr-[70vh] mx-auto text-center bg-[#4a7091c9] text-white redondeo-xl">
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
                      id="user"
                      value={state.usuario}
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
                      onClick={iniciarSesion}
                    />
                    <Button
                      className="redondeo-lg w-40 h-6 mt-5 bg-[#40b4bf] text-black"
                      label="Registrate Aquí"
                      onClick={() => setCardRegis(true)}
                    />
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx global>{``}</style>
    </AppLayout>
  )
}
