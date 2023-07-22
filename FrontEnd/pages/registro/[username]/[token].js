import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import GQLRegistro from '../../../graphql/login'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { Toast } from 'primereact/toast'
import CryptoJS from 'crypto-js'
import request from 'graphql-request'
import AppLayout from '../../../components/AppLayout'
import { Card } from 'primereact/card'

const CrearClave = () => {
  const router = useRouter()
  const toast = useRef(null)
  const { username, token } = router.query
  const [clave, setClave] = useState('')
  const [confirmacionClave, setConfirmacionClave] = useState('')
  const [habilitarBoton, setHabilitarBoton] = useState(false)

  const crearClave = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLRegistro.CREAR_CLAVE,
      variables
    )
  }

  useEffect(() => {
    if (clave !== '' && clave.length < 6) {
      setHabilitarBoton(false)
    } else {
      setHabilitarBoton(true)
    }
    if (
      clave !== '' &&
      confirmacionClave !== '' &&
      clave !== confirmacionClave
    ) {
      setHabilitarBoton(false)
    } else {
      setHabilitarBoton(true)
    }
    if (clave === '' || confirmacionClave === '') setHabilitarBoton(false)
  }, [clave, confirmacionClave])

  const crear = () => {
    setHabilitarBoton(false)
    const input = { token, usuario: username }
    input.clave = CryptoJS.AES.encrypt(
      clave,
      process.env.NEXT_PUBLIC_SECRET_KEY
    ).toString()

    console.log(input)
    crearClave({ input }).then(({ crearClave: { status, message, type } }) => {
      toast.current.show({
        severity: type,
        summary: status === 200 ? 'Información' : 'Error',
        detail: message,
        life: 8000
      })
      setClave('')
      setConfirmacionClave('')
      setHabilitarBoton(true)
      if (status === 500) {
        setTimeout(() => router.push('/registro'), 8000)
      } else if (status === 200) {
        setTimeout(() => router.push('/'), 5000)
      }
    })
  }

  return (
    <AppLayout verMenu={false}>
      <Toast ref={toast} />
      <div className="w-full grid grid-cols-2">
        <div className="border-r-4 py-16 pr-5">
          <div className="my-auto mx-auto text-white font-extrabold text-6xl text-end">
            <h3 className="text-3xl">Nuestra Meta</h3>
            <h2 className="text-4xl">es Brindarles</h2>
            <h1 className="text-7xl">Atención</h1>
            <h1 className="text-7xl">De Calidad</h1>
          </div>
        </div>
        <Card className="w-[50%] h-[60vh] py-10 ml-[5vh] mr-[70vh] text-center bg-[#4a7091c9] text-white redondeo-xl">
          <h4 className="text-2xl text-white font-semibold">
            ¡Clave de Acceso!
          </h4>
          <p className="text-white text-xl"> Asegurese de Recordarla </p>
          <div className="p-inputgroup" style={{ margin: '10px 0 0 0' }}>
            <span className={'p-inputgroup-addon'}>
              <i className="pi pi-lock" style={{ color: '#1A4173' }} />
            </span>
            <Password
              toggleMask="true"
              promptLabel="Ingresa una contraseña segura"
              weakLabel="Débil"
              mediumLabel="Media"
              strongLabel="Segura"
              value={clave}
              placeholder="Contraseña"
              onChange={(e) => setClave(e.target.value)}
            />
          </div>

          <div className="p-inputgroup" style={{ marginTop: '20px' }}>
            <span className={'p-inputgroup-addon'}>
              <i className="pi pi-check" style={{ color: '#1A4173' }} />
            </span>
            <Password
              toggleMask="true"
              feedback={false}
              value={confirmacionClave}
              placeholder="Confirme la Contraseña"
              onChange={(e) => setConfirmacionClave(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              label="Crear Contraseña"
              icon="pi pi-sign-in"
              className="redondeo-lg w-[55%] h-6 bg-[#40b4bf] text-black"
              iconPos="right"
              disabled={!habilitarBoton || clave.length < 6}
              onClick={crear}
            />
          </div>
        </Card>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{``}</style>
    </AppLayout>
  )
}

export default CrearClave
