import { InputText } from 'primereact/inputtext'
/* import { Dropdown } from 'primereact/dropdown' */
import { useState, useRef, useEffect, Fragment } from 'react'
import { Button } from 'primereact/button'
/* import useSWR from 'swr' */
import { SelectButton } from 'primereact/selectbutton'
import GQLrecepcion from 'graphql/recepcion'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog'
import { motion } from 'framer-motion'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

function GestionDeCitas({
  visibled,
  setVisibled,
  tokenQuery,
  refresSoli,
  permiso
}) {
  const toast = useRef(null)
  const [nacionalidad, setNacionalidad] = useState({
    name: 'Venezolano',
    code: 'V'
  })
  const [cedula, setCedula] = useState(null)
  const [primerNombre, setPrimerNombre] = useState(null)
  const [segundoNombre, setSegundoNombre] = useState(null)
  const [primerApellido, setPrimerApellido] = useState(null)
  const [segundoApellido, setSegundoApellido] = useState(null)
  const [listaCitas, setListaCitas] = useState(null)
  const [errorCedula, setErrorCedula] = useState(false)
  const [incompleto, setIncompleto] = useState(false)

  const consultarPersonalParaCrear = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLrecepcion.GET_LISTA_SOLICITUDES_PACIENTE,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

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

  const cancelarCita = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLrecepcion.CANCELAR_CITA_PACIENTE,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    if (cedula?.length > 5) {
      consultarPersonalParaCrear({
        cedulaPaciente: parseInt(cedula)
      }).then(({ getListaSolicitudesPorPaciente: { citas, paciente } }) => {
        if (paciente) {
          setErrorCedula(false)
          setPrimerNombre(paciente.tx_nombre1)
          setPrimerApellido(paciente.tx_apellido1)
          setSegundoNombre(paciente.tx_nombre2)
          setSegundoApellido(paciente.tx_apellido2)
          setListaCitas(citas)
        } else {
          setErrorCedula(true)
          setPrimerNombre('')
          setPrimerApellido('')
          setSegundoApellido('')
          setSegundoNombre('')
          setListaCitas(null)
        }
      })
    } else {
      setPrimerNombre('')
      setPrimerApellido('')
      setSegundoApellido('')
      setSegundoNombre('')
      setListaCitas(null)
      setErrorCedula(false)
    }
  }, [cedula, nacionalidad])

  function cerrarCrearPersonal() {
    setVisibled(false)
    setIncompleto(false)
    setErrorCedula(false)
    setCedula(null)
    setPrimerNombre(null)
    setPrimerApellido(null)
    setListaCitas(null)
  }

  function cancelacionCitaPaciente(rowData) {
    cancelarCita({ codCita: rowData.co_cita_medica }).then(
      ({ cancelarCitaPaciente: { status, message, type } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message,
          life: 3000
        })
        cerrarCrearPersonal()
        refresSoli()
      }
    )
  }

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

  const accionBody = (rowData) => {
    return (
      <Fragment>
        <div className="text-center">
          {permiso?.tx_permisos[3] && (
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-danger"
              tooltip="Cancelar"
              tooltipOptions={{ position: 'top' }}
              onClick={() => cancelacionCitaPaciente(rowData)}
            />
          )}
        </div>
      </Fragment>
    )
  }

  const header = (
    <motion.div
      variants={animation(1)}
      initial="hidden"
      animate="visible"
      style={{ fontSize: '27px', fontWeight: '600', textAlign: 'center' }}
      className="bg-[#2a7e87] text-white w-[45%] redondeo-xl"
    >
      <h1>GESTIÓN DE SOLICITUDES</h1>
    </motion.div>
  )

  const nacionalidades = [
    { name: 'Venezolano', code: 'V' },
    { name: 'Extranjero', code: 'E' }
  ]

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={header}
        visible={visibled}
        className="w-[50vw] md:w-[52vw] min-h-[25rem]"
        onHide={() => {
          cerrarCrearPersonal()
        }}
        resizable={false}
        draggable={false}
        contentClassName="redondeo-dialog-content"
        headerClassName="redondeo-dialog-header"
        position="top-right"
      >
        <div className="grid grid-cols-4 gap-4">
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
              <h1>DATOS DEL HORARIO</h1>
            </div>
          </motion.center>
          <motion.div
            variants={animation(3)}
            initial="hidden"
            animate="visible"
            className="flex flex-row col-span-4"
          >
            <SelectButton
              optionLabel="code"
              value={nacionalidad}
              options={nacionalidades}
              onChange={(e) => setNacionalidad(e.value)}
              className="nacionalidad p-[2.4px]"
            />
            <div className="field">
              <div className="p-inputgroup">
                <span className="p-float-label">
                  <InputText
                    className={`redondeo-input-buttom-left ${
                      errorCedula ? 'border-red-600' : ''
                    }`}
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    keyfilter="pint"
                    maxLength="8"
                  />
                  <label htmlFor="username">Cédula del Paciente</label>
                </span>
                <Button
                  icon="pi pi-search"
                  className="redondeo-input-buttom-right"
                  disabled
                />
              </div>
              {errorCedula && (
                <small className="block text-red-600 text-center">
                  El paciente no se encuentra registrado.
                </small>
              )}
            </div>
          </motion.div>
          <div className="field">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <InputText
                id="username"
                autoComplete="off"
                value={primerNombre}
                onChange={(e) => setPrimerNombre(e.target.value)}
                className={`${
                  incompleto && primerNombre === null ? 'border-red-600' : ''
                }`}
                disabled
              />
              <label htmlFor="username">Primer Nombre</label>
            </motion.span>
          </div>
          <div className="field">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <InputText
                id="username"
                autoComplete="off"
                value={segundoNombre}
                onChange={(e) => setSegundoNombre(e.target.value)}
                disabled
              />
              <label htmlFor="username">Segundo Nombre</label>
            </motion.span>
          </div>
          <div className="field">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <InputText
                id="username"
                autoComplete="off"
                value={primerApellido}
                disabled
              />
              <label htmlFor="username">Primer Apellido</label>
            </motion.span>
          </div>
          <div className="field">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <InputText
                id="username"
                autoComplete="off"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                disabled
              />
              <label htmlFor="username">Segundo Apellido</label>
            </motion.span>
          </div>

          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4 mb-6 mt-3"
          >
            <DataTable
              value={listaCitas}
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
              emptyMessage="No se han encontrado Citas"
            >
              <Column
                field="fe_cita"
                body={BodyFeCita}
                header="Fecha de la Cita"
              />
              <Column field="nb_especialidad" header="Especialidad" />
              <Column field="nb_tipo_consulta" header="Motivo" />
              <Column field="nb_locacion" header="Ubicación" />
              <Column field="nb_turno" header="Turno" />
              <Column header="Acciones" body={accionBody} />
            </DataTable>
          </motion.center>
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .nacionalidad .p-button {
            min-width: 1rem !important;
          }
          .p-button:disabled {
            background: #3f51b5 !important;
            color: #ffffff !important;
            opacity: 1;
          }
          .nacionalidad .p-button.p-highlight {
            background: #3f51b5 !important;
            border-color: #3f51b5 !important;
            color: white !important;
          }
          .p-disabled .p-component:disabled {
            opacity: 0.5;
          }
          #DropDown .p-disabled,
          .p-component:disabled {
            opacity: 1;
          }
          .p-selectbutton .p-button.p-highlight {
            background: #2a7e87;
            border-color: #2a7e87;
            color: white;
          }
          button:not(button):not(a):not(.p-disabled):active {
            background: #2a7e87;
            border-color: #2a7e87;
            color: white;
          }
          .p-selectbutton .p-button:focus.p-highlight {
            background: #2a7e87;
            border-color: #2a7e87;
            color: white;
          }
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
    </>
  )
}

export default GestionDeCitas
