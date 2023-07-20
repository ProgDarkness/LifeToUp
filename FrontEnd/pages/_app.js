import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { request } from 'graphql-request'
import { SWRConfig, useSWRConfig } from 'swr'
import { Dialog } from 'primereact/dialog'
import { Knob } from 'primereact/knob'
import { Button } from 'primereact/button'
import { useIdleTimer } from 'react-idle-timer'
import { useRouter } from 'next/router'
import { addLocale } from 'primereact/api'
import 'primereact/resources/themes/mdc-light-indigo/theme.css' // theme
import 'primereact/resources/primereact.min.css' // core css
import 'primeicons/primeicons.css' // icons
import 'styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import PropTypes from 'prop-types'
config.autoAddCss = false

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired
}

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado'
  ],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ],
  monthNamesShort: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic'
  ],
  today: 'Hoy',
  clear: 'Claro'
})

function MyApp({ Component, pageProps }) {
  const contador = useRef()
  const router = useRouter()
  const { cache } = useSWRConfig()
  const [verModal, setVerModal] = useState(false)
  const TIMEOUT = 1000 * 60 * 5
  const MAX_CONTADOR = 30
  const [tiempoRestante, setTiempoRestante] = useState(MAX_CONTADOR)

  const fetcher = async (query, variables, token) => {
    if (!query) return null
    if (!variables)
      return await request(process.env.NEXT_PUBLIC_URL_BACKEND, query)
    if (!token)
      return await request(
        process.env.NEXT_PUBLIC_URL_BACKEND,
        query,
        variables
      )
    return await request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      query,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  useEffect(() => {
    return () => clearInterval(contador.current)
  }, [])

  useEffect(() => {
    if (tiempoRestante === 0) {
      cerrarSesion()
    }
  }, [tiempoRestante])

  const decreaseNum = () => setTiempoRestante((tr) => tr - 1)
  const handleOnIdle = () => {
    const ruta = router.route
    const rutasSinLimite = ['/']
    if (!rutasSinLimite.includes(ruta)) {
      setTiempoRestante(MAX_CONTADOR)
      setVerModal(true)
      contador.current = setInterval(decreaseNum, 1000)
    }
  }

  const { reset } = useIdleTimer({
    timeout: TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500
  })

  const footerModal = () => {
    return (
      <div className="text-center">
        <Button
          label="No"
          icon="pi pi-times"
          onClick={cerrarSesion}
          className="p-button-text"
        />
        <Button
          label="Sí"
          icon="pi pi-check"
          onClick={extenderSesion}
          autoFocus
        />
      </div>
    )
  }

  const extenderSesion = (e) => {
    e.preventDefault()
    setVerModal(false)
    reset()
    clearInterval(contador.current)
  }

  const cerrarSesion = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
      router.push('/')
    }
    cache.clear()
    setVerModal(false)
    reset()
    clearInterval(contador.current)
    router.reload()
  }

  return (
    <>
      <Head>
        <title>CAMI</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Centro de Atencion Médica Integral para el personal de salud del CNE"
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: process.env.NEXT_PUBLIC_PRODUCTION === 'true'
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
      <Dialog
        visible={verModal}
        className="dialog-sesiontimeout w-[300px]"
        footer={footerModal()}
        onHide={() => setVerModal(false)}
      >
        <div className="text-center">
          <h3 className="mb-2">Su sesión expirará</h3>
          <Knob value={tiempoRestante} min={0} max={MAX_CONTADOR} readOnly className="flex justify-center"/>
          <h3 className="mt-2">¿Desea mantener su sesión activa?</h3>
        </div>
      </Dialog>
    </>
  )
}

export default MyApp
