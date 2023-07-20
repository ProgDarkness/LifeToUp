import React, { useState, useRef, useEffect } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'
import { Dialog } from 'primereact/dialog'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import vistaGestionUsuarios from 'graphql/gestionUsuarios'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ConfirmDialog } from 'primereact/confirmdialog'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'

function VerRol({ visibled, setVisibled, tokenQuery, rowDataCodeRol }) {
  const toast = useRef(null)
  const [selectedRuta, setSelectedRuta] = useState(null)
  const [selectedPermisos, setSelectedPermisos] = useState(null)
  const [rutaPermisoSave, setRutaPermisoSave] = useState(null)
  const permisosPlus = true
  const [confirmRol, setConfirmRol] = useState(false)
  const [incompleto, setIncompleto] = useState(false)
  const [tabalaVisible, setTablaVisible] = useState(true)
  const [visibleR, setVisibleR] = useState(false)
  const [rowDataEliminar, setRowDataEliminar] = useState(null)

  useEffect(() => {
    mutateRol()
  }, [rowDataCodeRol])

  function terminarAgregarPermisosRol() {
    setSelectedRuta(null)
    setSelectedPermisos(null)
    setRutaPermisoSave(null)
    setConfirmRol(false)
    setIncompleto(false)
  }

  function cerrarVerMasRol() {
    setVisibled(false)
    setSelectedRuta(null)
    setSelectedPermisos(null)
    setRutaPermisoSave(null)
    setConfirmRol(false)
    setIncompleto(false)
  }

  function accept() {
    setConfirmRol(false)
    savePermisesMas()
  }

  function reject() {
    setConfirmRol(false)
    terminarAgregarPermisosRol()
  }

  function cambioPermiso(rowData, index, boolPermiso) {
    const dataRolTable = rol?.getRol
    dataRolTable.map((posicion) => {
      if (posicion.idpermiso === rowData.idpermiso) {
        posicion.permisos[index] = !boolPermiso
        mutActualizarPermisosRol({
          codPermiso: posicion.idpermiso,
          arrayPermisos: posicion.permisos
        }).then(({ actualizarPermisosRol: { status, message, type } }) => {
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message
          })
        })
      }
      return false
    })
    setTablaVisible(false)
    setTimeout(() => {
      setTablaVisible(true)
    }, 0.11)
  }

  const permisosBody = (rowData, index) => {
    let statusColor = ''
    if (rowData.permisos[index]) {
      statusColor = '#5ccf52'
    } else {
      statusColor = '#cf5252'
    }
    if (statusColor !== '') {
      return (
        <center>
          {tabalaVisible && (
            <Button
              onClick={() =>
                cambioPermiso(rowData, index, statusColor === '#5ccf52')
              }
              icon="pi pi-times"
              style={{ backgroundColor: statusColor, padding: 3 }}
            />
          )}
        </center>
      )
    }
  }

  const { data: rol, mutate: mutateRol } = useSWR(
    tokenQuery && rowDataCodeRol
      ? [
          vistaGestionUsuarios.GET_ROL,
          { codeRol: rowDataCodeRol.code },
          tokenQuery
        ]
      : null
  )

  const { data: rutas } = useSWR(
    tokenQuery ? [vistaGestionUsuarios.GET_RUTAS, {}, tokenQuery] : null
  )

  const crearRolPermisos = (varibles) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.CREAR_ROL,
      varibles,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  const mutActualizarPermisosRol = (varibles) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.ACTUALIZAR_PERMISOS,
      varibles,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  const mutateEliminarPermisoRol = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.ELIMINAR_PERMISOS,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  const OptionPermisos = [
    { label: 'Leer', value: 0 },
    { label: 'Crear', value: 1 },
    { label: 'Modificar', value: 2 },
    { label: 'Eliminar', value: 3 }
  ]

  function prepararObjetoPermisosRol() {
    if (selectedRuta !== null && selectedPermisos !== null) {
      const arrayPermisos = [false, false, false, false]

      // eslint-disable-next-line array-callback-return
      selectedPermisos?.map((i) => {
        arrayPermisos[i] = true
      })

      setRutaPermisoSave({
        ruta: selectedRuta.code,
        permisos: arrayPermisos,
        id_rol: rowDataCodeRol.code
      })
    } else {
      setIncompleto(true)
    }
  }

  function savePermisesMas() {
    if (selectedRuta !== null && selectedPermisos !== null) {
      crearRolPermisos({
        InputRolPermisos: rutaPermisoSave,
        plusPermisos: permisosPlus
      }).then(({ crearRolPermiso: { status, message, type } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message
        })

        terminarAgregarPermisosRol()
        mutateRol()
      })
    } else {
      setIncompleto(true)
    }
  }

  const header = (
    <motion.div
      variants={animation(1)}
      initial="hidden"
      animate="visible"
      style={{ fontSize: '27px', fontWeight: '600', textAlign: 'center' }}
      className="bg-[#2a7e87] text-white w-80 redondeo-xl"
    >
      <h1>MODIFICAR ROL</h1>
    </motion.div>
  )

  function animation(input) {
    // eslint-disable-next-line prefer-const
    let container = {
      hidden: { opacity: 1, scale: 0 },
      visible: {
        opacity: 1,
        scale: [0, 1],
        transition: { delay: 0.02 }
      }
    }

    for (let i = 0; i < input; i++) {
      container.visible.transition.delay += 0.3
    }

    return container
  }

  function deletePermisoRol(rowData) {
    setVisibleR(true)
    setRowDataEliminar(rowData)
  }

  const acceptR = () => {
    mutateEliminarPermisoRol({
      codPermiso: rowDataEliminar.idpermiso,
      co_rol: rowDataCodeRol.code
    }).then(({ eliminarPermisosRol: { status, message, type } }) => {
      toast.current.show({
        severity: type,
        summary: 'Atención',
        detail: message,
        life: 3000
      })
      mutateRol()
    })
  }

  const rejectR = () => {
    setVisibleR(false)
  }

  const accionEliminarPermisoRol = (rowData) => {
    return (
      <center>
        <Button
          onClick={() => deletePermisoRol(rowData)}
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-outlined"
          tooltip="Eliminar"
        />
      </center>
    )
  }

  return (
    <>
      <ConfirmDialog
        visible={visibleR}
        onHide={() => setVisibleR(false)}
        message="¿Deseas eliminar el permiso?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={acceptR}
        reject={rejectR}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <Toast ref={toast} />
      <ConfirmDialog
        visible={confirmRol}
        onHide={() => {}}
        message={`¿Seguro desea agregar el permiso al rol ${rowDataCodeRol?.name}?`}
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={() => accept()}
        reject={() => reject()}
        rejectLabel="No"
        acceptLabel="Si"
      />

      <Dialog
        header={header}
        visible={visibled}
        style={{ width: '46vw', height: '33vw' }}
        onHide={() => {
          cerrarVerMasRol()
        }}
        resizable={false}
        draggable={false}
        contentClassName="redondeo-dialog-content"
        headerClassName="redondeo-dialog-header"
        position="top-left"
        modal={false}
      >
        <div className="grid grid-cols-3 gap-4">
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4"
          >
            <div
              style={{ fontSize: '20px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-[60%] redondeo-xl"
            >
              <h1>
                Agregar permisos al rol:{' '}
                <span className="text-yellow-300">{rowDataCodeRol?.name}</span>
              </h1>
            </div>
          </motion.center>
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                value={selectedRuta}
                options={rutas?.getRutas}
                className="redondeo-lg w-[105%]"
                onChange={(e) => setSelectedRuta(e.value)}
                optionLabel="name"
              />
              <label htmlFor="username">Módulos</label>
            </span>
            {incompleto && selectedRuta === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el Modulo.
              </small>
            )}
          </div>
          <div className="field">
            <span className="p-float-label">
              <MultiSelect
                value={selectedPermisos}
                options={OptionPermisos}
                className="redondeo-lg w-[105%]"
                onChange={(e) => setSelectedPermisos(e.value)}
              />
              <label htmlFor="username">Permisos</label>
            </span>
            {incompleto && selectedPermisos === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar los Permisos.
              </small>
            )}
          </div>

          <Button
            label="Agregar"
            className="p-button-raised p-button-success redondeo-lg w-[55%] h-12"
            disabled={selectedRuta === null || selectedPermisos === null}
            onClick={() => {
              setConfirmRol(true)
              prepararObjetoPermisosRol()
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-3">
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4 mb-3"
          >
            <div
              style={{ fontSize: '20px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-[60%] redondeo-xl"
            >
              <h1>
                Permisos del Rol:{' '}
                <span className="text-yellow-300">{rowDataCodeRol?.name}</span>
              </h1>
            </div>
          </motion.center>

          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4 mb-3"
          >
            <DataTable
              value={rol?.getRol}
              paginator
              autoLayout={true}
              stripedRows={true}
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
              alwaysShowPaginator={false}
              rows={4}
              style={{ margin: '-2% -1.3% -3% -1.3%' }}
              className="w-full col-span-4"
              filterDisplay="row"
              emptyMessage="No se han encontrado permisos del rol"
            >
              <Column field="ruta" header="Módulos" />

              <Column
                field="permisos"
                header="Leer"
                body={(rowData) => permisosBody(rowData, 0)}
              />

              <Column
                field="permisos"
                header="Escribir"
                body={(rowData) => permisosBody(rowData, 1)}
              />

              <Column
                field="permisos"
                header="Modificar"
                body={(rowData) => permisosBody(rowData, 2)}
              />

              <Column
                field="permisos"
                header="Eliminar"
                body={(rowData) => permisosBody(rowData, 3)}
              />

              <Column
                field="permisos"
                header="Acciones"
                body={accionEliminarPermisoRol}
              />
            </DataTable>
          </motion.center>
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .redondeo-dialog-header {
            border-top-left-radius: 0px !important;
            border-top-right-radius: 0.75rem !important;
          }
          .redondeo-dialog-content {
            border-bottom-left-radius: 0.75rem !important;
            border-bottom-right-radius: 0.75rem !important;
          }
        `}</style>
      </Dialog>
    </>
  )
}

export default VerRol
