import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useState, useEffect, Fragment, useRef } from 'react'
import { Button } from 'primereact/button'
import CrearPersonal from './crearPersonal'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { useSesion } from 'hooks/useSesion'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus.js'
import GQLLogin from 'graphql/login'
import GQLPersonal from 'graphql/Personal'
import { ProgressSpinner } from 'primereact/progressspinner'
import { ConfirmDialog } from 'primereact/confirmdialog'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'

function TablaSolicitudCitas() {
  const router = useRouter()
  const rutaActive = router?.route
  const [rows, setRows] = useState(6)
  const { token, co_rol, cerrarSesion } = useSesion()
  const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null)
  const [visibleCrearPersonal, setVisibleCrearPersonal] = useState(false)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const [filters1, setFilters1] = useState(null)
  const [items, setItems] = useState(null)
  const [visible, setVisible] = useState(false)
  const [rowDataEliminarPersonal, setRowDataEliminarPersonal] = useState(null)
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

  const mutateEliminarPersonal = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLPersonal.ELIMINAR_PERSONAL,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  useEffect(() => {
    setItems(JSON.stringify(menu?.getMenu))
  }, [menu])

  useEffect(() => {
    screenRows()
  }, [heightWindow])

  useEffect(() => {
    initFilters1()
  }, [])

  const { data, mutate } = useSWR(
    token ? [GQLPersonal.GET_PERSONAL, {}, token] : null
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
      <div className="text-white text-2xl font-extrabold ml-5">
        <p>Personal</p>
      </div>
    </Fragment>
  )

  const rightContents = (
    <Fragment>
      <div className="flex flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange1}
            placeholder="Buscar por Cédula"
            autoComplete="off"
            keyfilter="pint"
            maxLength="8"
            className="redondeo-lg mt-2 sm:mt-0"
          />
        </span>
        {permisos?.tx_permisos[1] && (
          <Button
            icon="pi pi-plus-circle"
            iconPos="right"
            label="Ingresar Personal"
            className="p-button-success redondeo-lg ml-2"
            onClick={() => setVisibleCrearPersonal(true)}
          />
        )}
      </div>
    </Fragment>
  )

  const header = (
    <Toolbar
      left={leftContents}
      right={rightContents}
      className="bg-[#3f51b5] p-2 redondeo-xl"
    />
  )

  setTimeout(() => {
    if (typeof window !== 'undefined') {
      setHeightWindow(screen?.height)
      setWitdhWindow(screen?.width)
    }
  }, 5)

  const screenRows = () => {
    if (heightWindow >= 1080) {
      setRows(12)
    } else if (heightWindow >= 900 && widthWindow > 740) {
      setRows(9)
    } else if (heightWindow <= 900) {
      setRows(5)
    }
  }

  const bodyStatus = (rowData) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.status_register) {
      statusColor = '#cf5252'
      tagStatus = 'INACTIVO'
    } else {
      statusColor = '#5ccf52'
      tagStatus = 'ACTIVO'
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

  const bodyTipoPersonal = (rowData) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.co_tipo_personal === 1) {
      statusColor = '#3d9edf'
      tagStatus = 'MÉDICO'
    } else {
      statusColor = '#dcdf50'
      tagStatus = 'ADMINISTRATIVO'
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

  const accept = () => {
    mutateEliminarPersonal({
      codigoPersonal: parseInt(rowDataEliminarPersonal.co_personal)
    }).then(({ eliminarPersonal: { status, message, type } }) => {
      toast.current.show({
        severity: type,
        summary: 'Atención',
        detail: message,
        life: 3000
      })
      mutate()
    })
  }

  const reject = () => {
    setVisible(false)
  }

  function eliminarPersonal(rowData) {
    setVisible(true)
    setRowDataEliminarPersonal(rowData)
  }

  const accionEliminarPersonal = (rowData) => {
    return (
      <div>
        {permisos?.tx_permisos[3] && (
          <Button
            onClick={() => eliminarPersonal(rowData)}
            icon="pi pi-times"
            className="p-button-rounded p-button-danger"
            tooltip="Eliminar"
          ></Button>
        )}
      </div>
    )
  }

  return (
    <AppLayoutMenus title="PERSONAL" items={items}>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="¿Deseas eliminar a este Personal?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <CrearPersonal
        visibled={visibleCrearPersonal}
        setVisibled={setVisibleCrearPersonal}
        tokenQuery={token}
        refresPac={mutate}
      />
      <DataTable
        value={data?.getPersonal}
        paginator
        autoLayout={true}
        stripedRows={true}
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        alwaysShowPaginator={false}
        rows={rows}
        style={{ margin: '-2% -1.3% -2% -1%' }}
        className="w-[101.6%]"
        filterDisplay="row"
        filters={filters1}
        header={header}
        globalFilterFields={['ced_usuario']}
        emptyMessage="No se ha encontrado personal"
      >
        <Column
          field="ced_usuario"
          header="Cédula de Identidad"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="nb_usuario"
          header="Nombre"
          headerStyle={{ width: '16rem' }}
        />
        <Column
          field="ap_usuario"
          header="Apellido"
          headerStyle={{ width: '16rem' }}
        />
        <Column
          field="nb_especialidad"
          header="Especialidad"
          headerStyle={{ width: '16rem' }}
        />
        <Column
          field="co_empleado"
          header="Código de Empleado"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="co_colegio_medicos"
          header="Código del Colegio de Médicos"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="co_ministerio_sanidad"
          header="Código del Ministerio de Sanidad"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="co_tipo_personal"
          header="Tipo de Personal"
          body={bodyTipoPersonal}
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="visible"
          body={bodyStatus}
          header="Estatus de actividad"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
        />
        <Column
          field="visible"
          body={accionEliminarPersonal}
          header="Acción"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '10rem', textAlign: 'center' }}
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
