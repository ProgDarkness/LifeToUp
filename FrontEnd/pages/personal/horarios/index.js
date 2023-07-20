import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus'
import { useState, useEffect } from 'react'
import { useSesion } from 'hooks/useSesion'
import useSWR from 'swr'
import GQLLogin from 'graphql/login'
import { useRouter } from 'next/router'
import { TabView, TabPanel } from 'primereact/tabview'
import TablaHorarios from './tablaHorarios'
import { ProgressSpinner } from 'primereact/progressspinner'

function Horarios() {
  const router = useRouter()
  const rutaActive = router?.route
  const { token, co_rol, cerrarSesion } = useSesion()
  const [items, setItems] = useState(null)

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
    <AppLayoutMenus title="PERSONAL" items={items} setItems={setItems}>
      <TabView className="-mt-4">
        <TabPanel header="Lunes">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={1}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Martes">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={2}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Miércoles">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={3}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Jueves">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={4}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Viernes">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={5}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Sábado">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={6}
            permiso={permisos}
          />
        </TabPanel>
        <TabPanel header="Domingo">
          <TablaHorarios
            tokenQuery={token}
            idDiaSemana={7}
            permiso={permisos}
          />
        </TabPanel>
      </TabView>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
          background: #3f51b5;
          color: #ffffff;
          border-top-right-radius: 0px !important;
          border-bottom-right-radius: 0.5rem !important;
          border-bottom-left-radius: 0.5rem !important;
          border-top-left-radius: 0.5rem !important;
        }
        .p-tabview .p-tabview-nav .p-tabview-ink-bar {
          display: none;
        }
      `}</style>
    </AppLayoutMenus>
  )
}

export default Horarios
