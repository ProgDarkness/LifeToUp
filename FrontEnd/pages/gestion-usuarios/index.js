import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus'
import { useState, useEffect } from 'react'
import Tabla from './tabla'
import { useSesion } from 'hooks/useSesion'
import GQLLogin from 'graphql/login'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { ProgressSpinner } from 'primereact/progressspinner'

export default function gestionUsuario() {
  const router = useRouter()
  const rutaActive = router?.route
  const { token, co_rol, cerrarSesion } = useSesion()

  const { data: menu } = useSWR(
    token && co_rol
      ? [GQLLogin.GET_MENU, { idRol: parseInt(co_rol) }, token]
      : null
  )

  const { data: Acceso } = useSWR(
    rutaActive && co_rol
      ? [
          GQLLogin.GET_ACCESOS_ROL,
          { ruta: rutaActive, idRol: parseInt(co_rol) },
          token
        ]
      : null
  )

  /* [leer, crear, modificar, eliminar] */
  /* console.log(Acceso?.getRolAcceso.response.tx_permisos) */
  const permisos = Acceso?.getRolAcceso.response

  const [items, setItems] = useState(null)

  useEffect(() => {
    setItems(JSON.stringify(menu?.getMenu))
  }, [menu])

  if (!Acceso) {
    return (
      <AppLayoutMenus items={items}>
        <div className="flex justify-center items-center">
          <div className=" text-[#2c9eaa] text-2xl xl:text-4xl font-extrabold tracking-widest">
            <h1>Cargando...</h1>
            <ProgressSpinner
              className="w-[50px] h-[50px] mt-[10px] ml-[80px]"
              strokeWidth="8"
              fill="var(--surface-ground)"
              animationDuration=".5s"
            />
          </div>
        </div>
      </AppLayoutMenus>
    )
  }
  if (
    Acceso?.getRolAcceso.status !== 200 &&
    typeof Acceso?.getRolAcceso.status !== 'undefined'
  ) {
    cerrarSesion()
  }
  return (
    <AppLayoutMenus title="Gestión de Usuarios" items={items}>
      <Tabla tokenQuery={token} permiso={permisos}/>
    </AppLayoutMenus>
  )
}
