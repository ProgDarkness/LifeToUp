import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useState, useEffect, Fragment, useRef } from 'react'
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { useSesion } from 'hooks/useSesion'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus.js'
import GQLLogin from 'graphql/login'
import GQLEspecialidades from 'graphql/especialidades'
import { ProgressSpinner } from 'primereact/progressspinner'
import { ConfirmDialog } from 'primereact/confirmdialog'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import CrearEspecialidad from './crearEspecialidad'

function TablaSolicitudCitas() {
  const router = useRouter()
  const rutaActive = router?.route
  /* const [rows, setRows] = useState(null) */
  const { token, co_rol, cerrarSesion } = useSesion()
  /* const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null) */
  const [visibleCrearPersonal, setVisibleCrearPersonal] = useState(false)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const [filters1, setFilters1] = useState(null)
  const [items, setItems] = useState(null)
  const [visibleOrden, setVisibleOrden] = useState(false)
  const [visibleStatus, setVisibleStatus] = useState(false)
  const [rowDataCambiarStatus, setRowDataCambiarStatus] = useState(null)
  const [
    rowDataEditarAgregarLocacionEspe,
    setRowDataEditarAgregarLocacionEspe
  ] = useState(null)

  const toast = useRef(null)

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

  const mutateActualizarEstado = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLEspecialidades.UPDATE_ESTADO,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  useEffect(() => {
    setItems(JSON.stringify(menu?.getMenu))
  }, [menu])

  /* useEffect(() => {
    screenRows()
  }, [heightWindow]) */

  useEffect(() => {
    initFilters1()
  }, [])

  const { data, mutate } = useSWR(
    token ? [GQLEspecialidades.GET_ESPECIALIDADES_TABLE, {}, token] : null
  )

  const onGlobalFilterChange1 = (e) => {
    const value = e.target.value
    // eslint-disable-next-line prefer-const
    let _filters1 = { ...filters1 }

    // eslint-disable-next-line dot-notation
    _filters1['global'].value = value

    setFilters1(_filters1)
    setGlobalFilterValue1(value)
  }

  const initFilters1 = () => {
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    setGlobalFilterValue1('')
  }

  const leftContents = (
    <Fragment>
      <div className="text-white text-2xl font-extrabold ml-5 ">
        <p>Especialidades</p>
      </div>
    </Fragment>
  )

  function editAgregarLocalizacionEspe(rowData) {
    setVisibleCrearPersonal(true)
    setRowDataEditarAgregarLocacionEspe(rowData)
  }

  const rightContents = (
    <Fragment>
      <div className="flex flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange1}
            placeholder="Buscar por Nombre"
            autoComplete="off"
            className="redondeo-lg mt-2 sm:mt-0"
          />
        </span>
        {permisos?.tx_permisos[1] && (
          <Button
            icon="pi pi-plus-circle"
            iconPos="right"
            label="Crear Especialidad"
            className="p-button-success redondeo-lg ml-2"
            onClick={() => {
              setVisibleCrearPersonal(true)
              setRowDataEditarAgregarLocacionEspe(null)
            }}
          />
        )}
      </div>
    </Fragment>
  )

  const header = (
    <Toolbar
      left={leftContents}
      right={rightContents}
      className="bg-[#3f51b5] p-2 mb-5 redondeo-xl"
    />
  )

  /* setTimeout(() => {
    if (typeof window !== 'undefined') {
      setHeightWindow(screen?.height)
      setWitdhWindow(screen?.width)
    }
  }, 5) */

  /* const screenRows = () => {
    if (heightWindow >= 1080) {
      setRows('630px')
    } else if (heightWindow >= 900 && widthWindow > 740) {
      setRows('450px')
    } else if (heightWindow <= 900) {
      setRows('250px')
    }
  } */

  const cambiarStatusBoton = (rowData, index) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.bl_activo) {
      statusColor = '#5ccf52'
      tagStatus = 'ACTIVO'
    } else {
      statusColor = '#cf5252'
      tagStatus = 'INACTIVO'
    }

    return (
      <span
        className={`text-white p-1 font-extrabold redondeo-lg`}
        style={{ backgroundColor: statusColor }}
      >
        {tagStatus}
      </span>
    )
  }

  const bodyOrden = (rowData) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.bl_orden) {
      statusColor = '#5ccf52'
      tagStatus = 'REQUERIDA'
    } else {
      statusColor = '#cf5252'
      tagStatus = 'NO REQUERIDA'
    }

    return (
      <span
        className={`text-white p-1 font-extrabold redondeo-lg`}
        style={{ backgroundColor: statusColor }}
      >
        {tagStatus}
      </span>
    )
  }

  const bodyPersonalActivo = (rowData) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.bl_personal_disponible) {
      statusColor = '#5ccf52'
      tagStatus = 'ACTIVO'
    } else {
      statusColor = '#fbc02d'
      tagStatus = 'NO DISPONIBLE'
    }

    return (
      <span
        className={`text-white p-1 font-extrabold redondeo-lg`}
        style={{ backgroundColor: statusColor }}
      >
        {tagStatus}
      </span>
    )
  }

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

  const accept = (distincB) => {
    if (rowDataCambiarStatus.bl_personal_disponible) {
      mutateActualizarEstado({
        codigoEspecialidadLocacion: parseInt(
          rowDataCambiarStatus.co_especialidad_locacion
        ),
        distinc: distincB
      }).then(({ actualizarEspecialidad: { status, message, type } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message,
          life: 3000
        })
        mutate()
      })
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Atención',
        detail:
          'No se puede activar la especialidad, si no existe personal asignado',
        life: 3000
      })
    }
  }

  const reject = () => {
    setVisibleStatus(false)
    setVisibleOrden(false)
  }

  function cambiarStatus(rowData) {
    setVisibleStatus(true)
    setRowDataCambiarStatus(rowData)
  }

  function cambiarOrdenRequerida(rowData) {
    setVisibleOrden(true)
    setRowDataCambiarStatus(rowData)
  }

  const accionActualizarCampos = (rowData) => {
    return (
      <div>
        {permisos?.tx_permisos[2] && (
          <Button
            onClick={() => cambiarStatus(rowData)}
            icon="pi pi-cog"
            className="p-button-rounded p-button-warning"
            tooltip="Cambiar Estatus"
          ></Button>
        )}
        {permisos?.tx_permisos[2] && (
          <Button
            onClick={() => cambiarOrdenRequerida(rowData)}
            icon="pi pi-copy"
            className="p-button-rounded p-button-info ml-2"
            tooltip="Cambiar Orden Requerida"
          ></Button>
        )}
        {permisos?.tx_permisos[1] && (
          <Button
            onClick={() => editAgregarLocalizacionEspe(rowData)}
            icon="pi pi-plus-circle"
            className="p-button-rounded p-button-help ml-2"
            tooltip="Agregar Locación"
          ></Button>
        )}
      </div>
    )
  }

  return (
    <AppLayoutMenus title="ESPECIALIDADES" items={items}>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visibleStatus}
        onHide={() => setVisibleStatus(false)}
        message="¿Desea cambiar el estado de la Especialidad?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={() => accept(false)}
        reject={reject}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <ConfirmDialog
        visible={visibleOrden}
        onHide={() => setVisibleOrden(false)}
        message="¿Desea cambiar la petición de Orden Requerida?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={() => accept(true)}
        reject={reject}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <CrearEspecialidad
        visibled={visibleCrearPersonal}
        setVisibled={setVisibleCrearPersonal}
        tokenQuery={token}
        refresPac={mutate}
        rowDataEditar={rowDataEditarAgregarLocacionEspe}
        setRowDataEditar={setRowDataEditarAgregarLocacionEspe}
      />

      <DataTable
        value={data?.getEspecialidadesTabla}
        autoLayout={true}
        stripedRows={true}
        className="w-[101.46%] -mt-6 -ml-3"
        filterDisplay="row"
        filters={filters1}
        rowGroupMode="rowspan"
        showGridlines
        groupRowsBy={['nb_especialidad']}
        header={header}
        globalFilterFields={['nb_especialidad']}
        emptyMessage="No se han encontrado especialidades"
      >
        <Column
          field="nb_especialidad"
          header="Nombre"
          headerStyle={{ width: '8rem' }}
        />
        <Column
          field="nb_locacion"
          header="Locación"
          headerStyle={{ width: '10rem' }}
        />
        <Column
          field="bl_activo"
          body={(rowData) => cambiarStatusBoton(rowData)}
          header="Estatus"
          headerStyle={{ width: '6rem' }}
          style={{ textAlign: 'center' }}
        />
        <Column
          field="bl_orden"
          body={bodyOrden}
          header="Orden Requerida"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="bl_personal_disponible"
          body={(rowData) => bodyPersonalActivo(rowData)}
          header="Personal Activo"
          headerStyle={{ width: '6rem' }}
          style={{ textAlign: 'center' }}
        />
        <Column
          field="nb_locacion"
          header="Acción"
          body={accionActualizarCampos}
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '4rem' }}
        />
      </DataTable>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .p-column-filter-menu-button,
        .p-column-filter-clear-button {
          justify-content: center;
          align-items: center;
          cursor: pointer;
          text-decoration: none;
          overflow: hidden;
          position: relative;
          display: none;
        }
      `}</style>
    </AppLayoutMenus>
  )
}

export default TablaSolicitudCitas
