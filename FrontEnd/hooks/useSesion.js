import { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import GQLLogin from '../graphql/login'
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'

export const useSesion = () => {
  const router = useRouter()
  const { cache } = useSWRConfig()
  const [token, setToken] = useState()
  const [user, setUser] = useState()
  const rutasNoProtegidas = ['/']

  const { data, error } = useSWR(
    token && !rutasNoProtegidas.includes(router.route)
      ? [GQLLogin.USER, {}, token]
      : null
  )

  useEffect(() => {
    !sessionStorage.getItem('token') &&
    !rutasNoProtegidas.includes(router.route)
      ? router?.push('/')
      : setToken(sessionStorage.getItem('token'))
  }, [])

  useEffect(() => {
    if (data?.user) {
      const userJson = JSON.parse(
        CryptoJS.AES.decrypt(
          data.user,
          process.env.NEXT_PUBLIC_SECRET_KEY
        ).toString(CryptoJS.enc.Utf8)
      )
      sessionStorage.setItem('token', userJson.token)
      setUser(userJson)
    }
  }, [data])

  const cerrarSesion = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
      router.push('/')
    }
    cache.clear()
  }

  if (error?.toString()?.includes('Sesión no válida')) cerrarSesion()

  return {
    co_usuario: user?.co_usuario,
    codigo_empleado: user?.codigo_empleado,
    co_rol: user?.co_rol,
    permisos_adicionales: user?.permisos_adicionales,
    nacionalidad: user?.nacionalidad,
    cedula: user?.ced_usuario,
    nombre: user?.nb_usuario,
    apellido: user?.ap_usuario,
    correo: user?.tx_correo,
    tipo_emp: user?.tipo_emp,
    sexo: user?.sexo,
    loading: !data && !error,
    token: user?.token,
    cerrarSesion: () => cerrarSesion(),
    error
  }
}
