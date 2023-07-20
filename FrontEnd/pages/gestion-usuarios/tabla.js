import React, { useState, useEffect, Fragment, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import useSWR from 'swr'
import GQLUsuarios from 'graphql/gestionUsuarios'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
import CrearUsuario from './crearUsuario'
import CrearRoles from './crearRoles'
import { ConfirmDialog } from 'primereact/confirmdialog'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'

function Tabla({ tokenQuery, permiso }) {
  const [rows, setRows] = useState(6)
  const [visiblebCrearUsuario, setVisiblebCrearUsuario] = useState(false)
  const [visiblebCrearRol, setVisiblebCrearRol] = useState(false)
  const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null)
  const [filters1, setFilters1] = useState(null)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const [visible, setVisible] = useState(false)
  const [rowDataEliminar, setRowDataEliminar] = useState(null)
  const toast = useRef(null)
  const [visibleReset, setVisibleReset] = useState(false)

  const { data: usuarios, mutate } = useSWR(
    tokenQuery ? [GQLUsuarios.GET_USUARIOS, {}, tokenQuery] : null
  )

  const mutateEliminarUsuario = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLUsuarios.ELIMINAR_USUARIO,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }
  const mutateReiniciarUsuario = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLUsuarios.REINICIAR_USUARIO,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  const rolBody = (rowData) => {
    return (
      <span
        className={`text-white bg-[#3f51b5] p-1 font-extrabold redondeo-lg`}
      >
        {rowData.nb_rol}
      </span>
    )
  }

  const statusBody = (rowData) => {
    let statusColor = ''
    let tagStatus = ''
    if (rowData.status_register) {
      statusColor = '#cf5252'
      tagStatus = 'NO CONFIRMADO'
    } else {
      statusColor = '#5ccf52'
      tagStatus = 'CONFIRMADO'
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

  function deleteUser(rowData) {
    setVisible(true)
    setRowDataEliminar(rowData)
  }

  const accept = () => {
    mutateEliminarUsuario({
      cedulaUsuario: parseInt(rowDataEliminar.ced_usuario)
    }).then(({ eliminarUsuario: { status, message, type } }) => {
      toast.current.show({
        severity: type,
        summary: 'Atención',
        detail: message,
        life: 3000
      })
      mutate()
    })
  }

  const acceptReset = () => {
    mutateReiniciarUsuario({
      co_usuario: parseInt(rowDataEliminar.co_usuario)
    }).then(({ resetUser: { status, message, type } }) => {
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

  const rejectReset = () => {
    setVisible(false)
  }
  const accionBodyTemplate = (rowData) => {
    return (
      <div>
        {permiso?.tx_permisos[3] && (
          <Button
            onClick={() => deleteUser(rowData)}
            icon="pi pi-times"
            className="p-button-rounded p-button-danger"
            tooltip="Eliminar"
          ></Button>
        )}
        {permiso?.tx_permisos[3] && (
          <Button
            icon="pi pi-undo"
            className="p-button-rounded p-button-warning ml-1"
            onClick={() => {
              setVisibleReset(true)
              setRowDataEliminar(rowData)
            }}
            tooltip='Actualizar'
          />
        )}
      </div>
    )
  }

  const screenRows = () => {
    if (heightWindow >= 1080) {
      setRows(14)
    } else if (heightWindow >= 900 && widthWindow > 740) {
      setRows(10)
    } else if (heightWindow <= 900) {
      setRows(8)
    }
  }

  useEffect(() => {
    initFilters1()
  }, [])

  useEffect(() => {
    screenRows()
  }, [heightWindow])

  setTimeout(() => {
    if (typeof window !== 'undefined') {
      setHeightWindow(screen?.height)
      setWitdhWindow(screen?.width)
    }
  }, 5)

  const onGlobalFilterChange1 = (e) => {
    const value = e.target.value
    // eslint-disable-next-line prefer-const
    let _filters1 = { ...filters1 }

    // eslint-disable-next-line dot-notation
    _filters1['global'].value = value

    setFilters1(_filters1)
    setGlobalFilterValue1(value)
  }

  const leftContents = (
    <Fragment>
      <div className="text-white text-2xl font-extrabold ml-5">
        <p>Usuarios</p>
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
        <Button
          icon="pi pi-plus-circle"
          iconPos="right"
          label="Ver Roles"
          className="p-button-info redondeo-lg ml-2"
          onClick={() => setVisiblebCrearRol(true)}
        />
        {permiso?.tx_permisos[1] && (
          <Button
            icon="pi pi-plus-circle"
            iconPos="right"
            label="Crear Usuarios"
            className="p-button-success redondeo-lg ml-2"
            onClick={() => setVisiblebCrearUsuario(true)}
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

  const initFilters1 = () => {
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    setGlobalFilterValue1('')
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="¿Deseas eliminar este usuario?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <ConfirmDialog
        visible={visibleReset}
        onHide={() => setVisibleReset(false)}
        message="¿Deseas reiniciar este usuario?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={acceptReset}
        reject={rejectReset}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <CrearUsuario
        setVisibled={setVisiblebCrearUsuario}
        visibled={visiblebCrearUsuario}
        tokenQuery={tokenQuery}
        refresUser={mutate}
      />
      <CrearRoles
        setVisibled={setVisiblebCrearRol}
        visibled={visiblebCrearRol}
        tokenQuery={tokenQuery}
        permisos={permiso}
      />
      <DataTable
        value={usuarios?.getUsuarios}
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
        emptyMessage="No se han encontrado usuarios"
      >
        <Column field="ced_usuario" header="Cédula" />
        <Column field="nb_usuario" header="Nombre" />
        <Column field="ap_usuario" header="Apellido" />
        <Column field="nb_rol" header="Rol" body={rolBody} />
        <Column field="tx_correo" header="Correo" />
        <Column body={statusBody} header="Estatus" />
        <Column body={accionBodyTemplate} header="Acciones" />
      </DataTable>
    </>
  )
}

export default Tabla
