import React, { useState, useEffect, Fragment, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import useSWR from 'swr'
import { Toolbar } from 'primereact/toolbar'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import GQLHorarios from 'graphql/Horarios'
import CrearHorario from './crearhorario'
import { ConfirmDialog } from 'primereact/confirmdialog'

function TablaHorarios({ tokenQuery, idDiaSemana, permiso }) {
  const [rows, setRows] = useState(6)
  const [heightWindow, setHeightWindow] = useState(null)
  const [widthWindow, setWitdhWindow] = useState(null)
  const [filters1, setFilters1] = useState(null)
  const [globalFilterValue1, setGlobalFilterValue1] = useState('')
  const toast = useRef(null)
  const [diaSemanaName, setDiaSemanaName] = useState('')
  const [visibleCrearHorario, setVisibleCrearHorario] = useState(false)
  const [visible, setVisible] = useState(false)
  const [rowDataEliminarHorario, setRowDataEliminarHorario] = useState(null)

  const { data: horarios, mutate } = useSWR(
    tokenQuery
      ? [
          GQLHorarios.GET_TABLA_HORARIOS,
          { coDiaSemana: idDiaSemana },
          tokenQuery
        ]
      : null
  )

  const mutateHorario = () => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLHorarios.GET_HORARIO,
      { coDiaSemana: idDiaSemana },
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  const mutateEliminarHorario = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLHorarios.ELIMINAR_HORARIO,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    mutateHorario().then(
      ({
        getHorariosDia: {
          diaConsulta: { nb_dia_semana }
        }
      }) => {
        setDiaSemanaName(nb_dia_semana)
      }
    )
  }, [idDiaSemana])

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
        {permiso?.tx_permisos[1] && (
          <Button
            icon="pi pi-plus-circle"
            iconPos="right"
            label="Crear Horarios"
            className="p-button-success redondeo-lg ml-2"
            onClick={() => setVisibleCrearHorario(true)}
          />
        )}
      </div>
    </Fragment>
  )

  const leftContents = (
    <Fragment>
      <div className="text-white text-2xl font-extrabold ml-5">
        <p>{diaSemanaName}</p>
      </div>
    </Fragment>
  )

  const header = (
    <Toolbar
      left={leftContents}
      right={rightContents}
      className="bg-[#3f51b5] p-1 redondeo-xl"
    />
  )

  const initFilters1 = () => {
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    setGlobalFilterValue1('')
  }

  const accept = () => {
    mutateEliminarHorario({
      codigoHorarioPersonal: parseInt(
        rowDataEliminarHorario.co_horario_personal
      )
    }).then(({ eliminarHorario: { status, message, type } }) => {
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

  function eliminarHorario(rowData) {
    setVisible(true)
    setRowDataEliminarHorario(rowData)
  }

  const accionEliminarEditar = (rowData) => {
    return (
      <center>
        {permiso?.tx_permisos[3] && (
          <Button
            onClick={() => eliminarHorario(rowData)}
            icon="pi pi-times"
            className="p-button-rounded p-button-danger"
            tooltip="Eliminar"
          ></Button>
        )}
      </center>
    )
  }

  return (
    <>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="¿Deseas eliminar este horario?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <Toast ref={toast} />
      <CrearHorario
        visibled={visibleCrearHorario}
        setVisibled={setVisibleCrearHorario}
        tokenQuery={tokenQuery}
        refresPac={mutate}
      />
      <DataTable
        value={horarios?.getTablaHorarios}
        paginator
        autoLayout={true}
        stripedRows={true}
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
        alwaysShowPaginator={false}
        rows={rows}
        style={{ margin: '-0.5% -1.3% -2% -1%' }}
        className="w-[101.6%]"
        filterDisplay="row"
        filters={filters1}
        header={header}
        globalFilterFields={['ced_usuario']}
        emptyMessage="No se ha Encontrado Personal en este Horario."
      >
        <Column header="Cédula" field="ced_usuario" />
        <Column header="Nombre" field="nb_usuario" />
        <Column header="Apellido" field="ap_usuario" />
        <Column header="Especialidad" field="nb_especialidad" />
        <Column header="Turno" field="nb_turno" />
        <Column header="Hora de Entrada" field="hh_inicio" />
        <Column header="Hora de Salida" field="hh_fin" />
        <Column header="Ubicación" field="nb_locacion" />
        <Column
          header="Acción"
          body={accionEliminarEditar}
          field="nb_locacion"
        />
      </DataTable>
    </>
  )
}

export default TablaHorarios
