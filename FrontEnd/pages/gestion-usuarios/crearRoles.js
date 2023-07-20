import React, { useState, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
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
import VerRol from './verRol'

function CrearRoles({ visibled, setVisibled, tokenQuery, permisos }) {
  const toast = useRef(null)
  const [nameRol, setNameRol] = useState('')
  const [selectedRuta, setSelectedRuta] = useState(null)
  const [selectedPermisos, setSelectedPermisos] = useState(null)
  const [rutaPermisoSave, setRutaPermisoSave] = useState(null)
  const [idRol, setIdRol] = useState(null)
  const [permisosPlus, setPermisosPlus] = useState(false)
  const [confirmRol, setConfirmRol] = useState(false)
  const [incompleto, setIncompleto] = useState(false)
  const [visibleR, setVisibleR] = useState(false)
  const [rowDataEliminar, setRowDataEliminar] = useState(null)
  const [rowDataVerMas, setRowDataVerMas] = useState(null)
  const [visiblebVerRol, setVisiblebVerRol] = useState(false)

  function cerrarCrearRol() {
    setVisibled(false)
    setNameRol('')
    setSelectedRuta(null)
    setSelectedPermisos(null)
    setRutaPermisoSave(null)
    setConfirmRol(false)
    setIncompleto(false)
    setPermisosPlus(false)
    setIdRol(false)
  }

  function terminarCrearRol() {
    setNameRol('')
    setSelectedRuta(null)
    setSelectedPermisos(null)
    setRutaPermisoSave(null)
    setConfirmRol(false)
    setIncompleto(false)
    setPermisosPlus(false)
  }

  function accept() {
    setConfirmRol(false)
    savePermises()
  }

  function reject() {
    setConfirmRol(false)
    terminarCrearRol()
  }

  const { data: roles, mutate: mutateRoles } = useSWR(
    tokenQuery ? [vistaGestionUsuarios.GET_ROLES, {}, tokenQuery] : null
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

  const mutateEliminarRol = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.ELIMINAR_ROL,
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
    if (
      nameRol !== null &&
      selectedRuta !== null &&
      selectedPermisos !== null
    ) {
      const arrayPermisos = [false, false, false, false]

      // eslint-disable-next-line array-callback-return
      selectedPermisos?.map((i) => {
        arrayPermisos[i] = true
      })

      setRutaPermisoSave({
        nombre: nameRol.toUpperCase(),
        ruta: selectedRuta.code,
        permisos: arrayPermisos,
        id_rol: idRol
      })
    } else {
      setIncompleto(true)
    }
  }

  function savePermises() {
    if (
      nameRol !== null &&
      selectedRuta !== null &&
      selectedPermisos !== null
    ) {
      crearRolPermisos({
        InputRolPermisos: rutaPermisoSave,
        plusPermisos: permisosPlus
      }).then(({ crearRolPermiso: { status, message, type } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message
        })

        terminarCrearRol()
        mutateRoles()
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
      <h1>CREAR ROLES</h1>
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

  function deleteRol(rowData) {
    setVisibleR(true)
    setRowDataEliminar(rowData)
  }

  function editRol(rowData) {
    setRowDataVerMas(rowData)
    setVisiblebVerRol(true)
  }

  const acceptR = () => {
    mutateEliminarRol({
      codRol: parseInt(rowDataEliminar.code)
    }).then(({ eliminarRol: { status, message, type } }) => {
      toast.current.show({
        severity: type,
        summary: 'Atención',
        detail: message,
        life: 3000
      })
      mutateRoles()
    })
  }

  const rejectR = () => {
    setVisibleR(false)
  }

  const accionEliminarRol = (rowData) => {
    return (
      <div>
        {permisos?.tx_permisos[3] && (
          <Button
            onClick={() => deleteRol(rowData)}
            icon="pi pi-times"
            className="p-button-rounded p-button-danger"
            tooltip="Eliminar"
          />
        )}
        {permisos?.tx_permisos[2] && (
          <Button
            onClick={() => editRol(rowData)}
            icon="pi pi-pencil"
            className="p-button-rounded p-button-warning ml-1"
            tooltip="Editar"
          />
        )}
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog
        visible={visibleR}
        onHide={() => setVisibleR(false)}
        message="¿Deseas eliminar el Rol?"
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
        message={`¿Seguro desea crear el rol ${nameRol}?`}
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
          cerrarCrearRol()
        }}
        resizable={false}
        draggable={false}
        contentClassName="redondeo-dialog-content"
        headerClassName="redondeo-dialog-header"
        position="top-right"
      >
        <div className="grid grid-cols-3 gap-4">
          {permisos?.tx_permisos[1] && (
            <>
              <motion.center
                variants={animation(2)}
                initial="hidden"
                animate="visible"
                className="col-span-4"
              >
                <div
                  style={{ fontSize: '20px', fontWeight: '600' }}
                  className="bg-[#2a7e87] text-white w-60 redondeo-xl"
                >
                  <h1>DATOS DEL ROL</h1>
                </div>
              </motion.center>
              <div className="field">
                <span className="p-float-label">
                  <InputText
                    value={nameRol}
                    onChange={(e) => setNameRol(e.target.value)}
                    className="redondeo-lg w-[105%]"
                  />
                  <label htmlFor="username">Nombre</label>
                </span>
                {incompleto && nameRol === null && (
                  <small className="block text-red-600 text-center">
                    Necesita registrar el Nombre.
                  </small>
                )}
              </div>
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
                label="Crear"
                className="p-button-raised p-button-success redondeo-lg w-10 h-12"
                disabled={
                  nameRol?.length < 1 ||
                  nameRol === null ||
                  selectedRuta === null ||
                  selectedPermisos === null
                }
                onClick={() => {
                  setConfirmRol(true)
                  prepararObjetoPermisosRol()
                }}
              />
            </>
          )}

          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4 mb-3 -mt-1"
          >
            <div
              style={{ fontSize: '20px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-60 redondeo-xl"
            >
              <h1>ROLES</h1>
            </div>
          </motion.center>
        </div>
        <motion.center
          variants={animation(2)}
          initial="hidden"
          animate="visible"
          className="-mt-1"
        >
          <DataTable
            value={roles?.getRoles}
            paginator
            autoLayout={true}
            stripedRows={true}
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
            alwaysShowPaginator={false}
            rows={4}
            filterDisplay="row"
            className="w-[62%] border"
            emptyMessage="No se han encontrado roles"
          >
            <Column field="name" header="Rol" />
            <Column
              field="permisos"
              header="Acciones"
              body={accionEliminarRol}
            />
          </DataTable>
        </motion.center>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .redondeo-dialog-header {
            border-top-left-radius: 0.75rem !important;
            border-top-right-radius: 0px !important;
          }
          .redondeo-dialog-content {
            border-bottom-left-radius: 0.75rem !important;
            border-bottom-right-radius: 0.75rem !important;
          }
        `}</style>
      </Dialog>
      <VerRol
        setVisibled={setVisiblebVerRol}
        visibled={visiblebVerRol}
        tokenQuery={tokenQuery}
        rowDataCodeRol={rowDataVerMas}
      />
    </>
  )
}

export default CrearRoles
