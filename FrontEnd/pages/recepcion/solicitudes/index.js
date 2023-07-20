import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useState, useEffect, Fragment, useRef } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import GQLSolicitudes from 'graphql/recepcion'
import request from 'graphql-request'
import { FilterMatchMode } from 'primereact/api'
import VerMas from './verMasAccionTable'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Dropdown } from 'primereact/dropdown'
import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus.js'
import { useSesion } from 'hooks/useSesion'
import GQLLogin from 'graphql/login'
import GestionDeCitas from './GestionDeCitas'

function TablaSolicitudCitas() {
  const [rows, setRows] = useState(6)
  const router = useRouter()
  const rutaActive = router?.route
  const { token, co_rol, cerrarSesion } = useSesion()
  const toast = useRef(null)
  const [visibledGestionCitas, setVisibledGestionCitas] = useState(false)
  const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null)
  const [dialog, setDialog] = useState(false)
  const [DataRow, setDataRow] = useState(null)
  const [confirmCita, setConfirmCita] = useState(false)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const [filters1, setFilters1] = useState(null)
  const [ubicacionCitaChange, setUbicacionCitasChange] = useState({
    code: 1,
    name: 'CAMI PLAZA CARACAS'
  })
  const [items, setItems] = useState(null)

  /* const [itemsMenu, setItemsMenu] = useState() */

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

  useEffect(() => {
    setItems(JSON.stringify(menu?.getMenu))
  }, [menu])

  const fechaHoy =
    new Date().getDate() +
    '/' +
    (new Date().getMonth() + 1) +
    '/' +
    new Date().getFullYear()

  useEffect(() => {
    screenRows()
  }, [heightWindow])

  useEffect(() => {
    initFilters1()
  }, [])

  const { data, mutate } = useSWR(
    token
      ? [
          GQLSolicitudes.GET_SOLICITUDES,
          {
            co_estatus: 1,
            co_locacion: ubicacionCitaChange.code,
            fe_cita: fechaHoy
          },
          token
        ]
      : null
  )

  const { data: Ubicacion } = useSWR(
    token ? [GQLSolicitudes.UBICACION_RECEPCION, {}, token] : null
  )

  const BodyFeCita = (rowData) => {
    const feCita = new Date(parseInt(rowData?.fe_cita))
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
        <div style={{ color: '#4faf32' }}>{formatFeCita}</div>
      </Fragment>
    )
  }

  const actualizarStatus = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLSolicitudes.GET_ACTUALIZAR_STATUS_CITA,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  function cambiadorDeStatus(rowData) {
    setConfirmCita(true)
    setDataRow(rowData)
  }

  function accept() {
    const inputCita = {}
    inputCita.co_cita_medica = DataRow?.co_cita_medica
    inputCita.co_status = 2

    actualizarStatus({ inputCita }).then(
      ({ getActualizarEstatusCita: { status, type, message } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message
        })
        mutate()
      }
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

  function reject() {
    setConfirmCita(false)
    setDataRow(null)
  }

  const BodyNombres = (rowData) => {
    const Nombres = rowData.tx_nombre1 + ' ' + rowData.tx_nombre2
    return <Fragment>{Nombres}</Fragment>
  }

  const BodyApellidos = (rowData) => {
    const Apellidos = rowData.tx_apellido1 + ' ' + rowData.tx_apellido2
    return <Fragment>{Apellidos}</Fragment>
  }

  const leftContents = (
    <Fragment>
      <div className="text-white text-2xl font-extrabold ml-5">
        <p>Solicitudes Por Atender</p>
      </div>
    </Fragment>
  )

  const rightContents = (
    <Fragment>
      <div className="flex flex-wrap">
        <Button
          icon="pi pi-plus-circle"
          iconPos="right"
          label="Gestión de Citas"
          className="p-button-success redondeo-lg mr-3"
          onClick={() => setVisibledGestionCitas(true)}
        />
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
        <Dropdown
          emptyMessage="No existen opciones disponibles"
          className="p-button-success mt-2 sm:mt-0 sm:ml-3 redondeo-lg w-full sm:w-[256px] sm:h-[50px]"
          value={ubicacionCitaChange}
          options={Ubicacion?.getLocalizacion}
          onChange={(e) => {
            setUbicacionCitasChange(e.value)
            mutate()
          }}
          optionLabel="name"
          placeholder="Ubicaciones"
        />
      </div>
    </Fragment>
  )

  const headerglobal = (
    <Toolbar
      left={leftContents}
      right={rightContents}
      className="bg-[#3f51b5] p-2 redondeo-xl"
    />
  )

  const VerMasBody = (rowData) => {
    return (
      <Fragment>
        <div className="text-center">
          <Button
            icon="pi pi-search"
            className="p-button-rounded p-button-info mr-2"
            onClick={() => {
              setDataRow(rowData)
              setDialog(true)
            }}
            tooltip="Detalles"
          />
          {permisos?.tx_permisos[2] && (
            <Button
              icon="pi pi-check"
              className="p-button-rounded p-button-success"
              onClick={() => cambiadorDeStatus(rowData)}
              tooltip="Confirmar"
            />
          )}
        </div>
      </Fragment>
    )
  }

  setTimeout(() => {
    if (typeof window !== 'undefined') {
      setHeightWindow(screen?.height)
      setWitdhWindow(screen?.width)
    }
  }, 5)

  const screenRows = () => {
    if (heightWindow >= 1080) {
      setRows(9)
    } else if (heightWindow >= 900 && widthWindow > 740) {
      setRows(7)
    } else if (heightWindow <= 900) {
      setRows(4)
    }
  }

  /* [leer, crear, modificar, eliminar] */
  /* console.log(Acceso?.getRolAcceso.response.tx_permisos) */
  const permisos = Acceso?.getRolAcceso.response

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
  if (!data?.getSolicitudes) {
    return (
      <AppLayoutMenus title="RECEPCIÓN" items={items}>
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
  } else {
    return (
      <AppLayoutMenus title="RECEPCIÓN" items={items} setItems={setItems}>
        <VerMas activeDialog={dialog} data={DataRow} setDialog={setDialog} />
        <Toast ref={toast} />
        <GestionDeCitas
          visibled={visibledGestionCitas}
          setVisibled={setVisibledGestionCitas}
          tokenQuery={token}
          refresSoli={mutate}
          permiso={permisos}
        />
        <ConfirmDialog
          visible={confirmCita}
          onHide={() => setConfirmCita(false)}
          message="¿Seguro desea atender al paciente?"
          header="Confirmación"
          icon="pi pi-exclamation-triangle"
          accept={() => accept()}
          reject={() => reject()}
          rejectLabel="No"
          acceptLabel="Si"
        />
        <DataTable
          value={data?.getSolicitudes}
          paginator
          autoLayout={true}
          stripedRows={true}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
          alwaysShowPaginator={false}
          rows={rows}
          header={headerglobal}
          filters={filters1}
          style={{ margin: '-2% -1.5% -2% -0.7%' }}
          className="w-[101.4%]"
          globalFilterFields={['nu_cedula']}
          emptyMessage="No existen solicitudes disponibles"
        >
          <Column field="fe_cita" body={BodyFeCita} header="Fecha de la Cita" />
          <Column field="nu_cedula" header="Cédula" />
          <Column body={BodyNombres} header="Nombre" />
          <Column body={BodyApellidos} header="Apellido" />
          <Column field="nu_edad" header="Edad" />
          <Column field="nb_especialidad" header="Especialidad" />
          <Column field="nb_tipo_consulta" header="Motivo de la Solicitud" />
          <Column field="nb_locacion" header="Ubicación de la Cita" />
          <Column field="nb_turno" header="Turno de la Cita" />
          <Column body={VerMasBody} header="Acciones" />
        </DataTable>
      </AppLayoutMenus>
    )
  }
}
export default TablaSolicitudCitas
