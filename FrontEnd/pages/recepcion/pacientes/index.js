import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useState, useEffect, Fragment } from 'react'
import { Button } from 'primereact/button'
import CrearPaciente from './crearPaciente'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { useSesion } from 'hooks/useSesion'
import GQLSolicitudes from 'graphql/recepcion'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus.js'
import GQLLogin from 'graphql/login'
import { ProgressSpinner } from 'primereact/progressspinner'

function TablaSolicitudCitas() {
  const router = useRouter()
  const rutaActive = router?.route
  const [rows, setRows] = useState(6)
  const { token, co_rol, cerrarSesion } = useSesion()
  const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null)
  const [visibleCrearPaciente, setVisibleCrearPaciente] = useState(false)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const [filters1, setFilters1] = useState(null)
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

  useEffect(() => {
    screenRows()
  }, [heightWindow])

  useEffect(() => {
    initFilters1()
  }, [])

  const { data, mutate } = useSWR(
    token ? [GQLSolicitudes.GET_PACIENTES, {}, token] : null
  )

  const BodyFeCita = (rowData) => {
    const feCita = new Date(parseInt(rowData?.fe_nacimiento))
    const formatFeCita =
      feCita.getDate() +
      '/' +
      (feCita.getMonth() + 1 < 10
        ? '0' + (feCita.getMonth() + 1)
        : feCita.getMonth() + 1) +
      '/' +
      feCita.getFullYear()
    return (
      <Fragment>
        <div>{formatFeCita}</div>
      </Fragment>
    )
  }

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
        <p>Pacientes</p>
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
            label="Registrar Paciente"
            className="p-button-success redondeo-lg ml-2"
            onClick={() => setVisibleCrearPaciente(true)}
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

  const BodyNombres = (rowData) => {
    const Nombres =
      rowData.tx_nombre1 + ' ' + (rowData.tx_nombre2 ? rowData.tx_nombre2 : '')
    return <Fragment>{Nombres}</Fragment>
  }

  const BodyCedula = (rowData) => {
    const Nombres = rowData.co_nacionalidad + '-' + rowData.nu_cedula
    return <Fragment>{Nombres}</Fragment>
  }

  const BodyApellidos = (rowData) => {
    const Apellidos =
      rowData.tx_apellido1 +
      ' ' +
      (rowData.tx_apellido2 ? rowData.tx_apellido2 : '')
    return <Fragment>{Apellidos}</Fragment>
  }

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
    <AppLayoutMenus title="RECEPCIÓN" items={items}>
      <CrearPaciente
        visibled={visibleCrearPaciente}
        setVisibled={setVisibleCrearPaciente}
        tokenQuery={token}
        refresPac={mutate}
      />
      <DataTable
        value={data?.getPacientes}
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
        globalFilterFields={['nu_cedula']}
        emptyMessage="No se ha encontrado pacientes"
      >
        <Column field="nu_cedula" body={BodyCedula} header="Cédula" />
        <Column body={BodyNombres} header="Nombre" className="w-[20%]" />
        <Column body={BodyApellidos} header="Apellido" className="w-[20%]" />
        <Column field="co_sexo" header="Sexo" />
        <Column field="nu_telefono" header="Teléfono" />
        <Column
          field="fe_nacimiento"
          body={BodyFeCita}
          header="Fecha de Nacimiento"
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
