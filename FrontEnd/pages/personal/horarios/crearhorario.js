import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import useSWR from 'swr'
import GQLHorarios from 'graphql/Horarios'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'

function CrearHorario({ visibled, setVisibled, tokenQuery, refresPac }) {
  const toast = useRef(null)
  const [cedula, setCedula] = useState(null)
  const [primerNombre, setPrimerNombre] = useState(null)
  const [segundoNombre, setSegundoNombre] = useState(null)
  const [primerApellido, setPrimerApellido] = useState(null)
  const [segundoApellido, setSegundoApellido] = useState(null)
  const [turnoEmpleado, setTurnoEmpleado] = useState(null)
  const [codigoPersonal, setCodigoPersonal] = useState(null)
  const [errorCedula, setErrorCedula] = useState(false)
  const [InputGuardarPersonalHorario, setInputGuardarPersonalHorario] =
    useState({})
  const [incompleto, setIncompleto] = useState(false)
  const [especialidad, setEspecialidad] = useState(null)
  const [localizacionPersonal, setLocalizacionPersonal] = useState(null)

  const { data: especialidades } = useSWR(
    tokenQuery
      ? [GQLHorarios.GET_ESPECIALIDADES_HORARIOS, {}, tokenQuery]
      : null
  )

  const { data: turnos } = useSWR(
    tokenQuery && especialidad
      ? [
          GQLHorarios.GET_TURNOS_PRO_ESPECIALIDAD,
          { co_especialidad: especialidad.code },
          tokenQuery
        ]
      : null
  )

  const { data: localizaciones } = useSWR(
    tokenQuery && especialidad
      ? [
          GQLHorarios.GET_LOCACIONES_POR_ESPECIALIDAD,
          { co_especialidad: especialidad.code },
          tokenQuery
        ]
      : null
  )

  const consultarPersonalParaCrear = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLHorarios.GET_CREAR_HORARIO_PERSONAL,
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

  const insertarHorario = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLHorarios.INSER_HORARIO,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    if (cedula?.length > 5) {
      consultarPersonalParaCrear({
        cedula: parseInt(cedula)
      }).then(({ getCrearPersonalHorario }) => {
        if (getCrearPersonalHorario?.personalDatos.nombre1) {
          setErrorCedula(false)
          const nombre_1 = getCrearPersonalHorario?.personalDatos.nombre1
          const nombre_2 = getCrearPersonalHorario?.personalDatos.nombre2
          const apellido_1 = getCrearPersonalHorario?.personalDatos.apellido1
          const apellido_2 = getCrearPersonalHorario?.personalDatos.apellido2
          const especialidad =
            getCrearPersonalHorario?.personalDatos.especialidad
          const co_personal = getCrearPersonalHorario?.personalDatos.co_personal
          const co_especialidad =
            getCrearPersonalHorario?.personalDatos.co_especialidad

          setPrimerNombre(nombre_1)
          setPrimerApellido(apellido_1)
          setSegundoNombre(nombre_2)
          setSegundoApellido(apellido_2)
          setEspecialidad({ name: especialidad, code: co_especialidad })
          setCodigoPersonal(co_personal)
        } else {
          setErrorCedula(true)
          setPrimerNombre('')
          setPrimerApellido('')
          setSegundoApellido('')
          setSegundoNombre('')
          setTurnoEmpleado(null)
          setCodigoPersonal('')
          setEspecialidad(null)
          setLocalizacionPersonal(null)
        }
      })
    } else {
      setPrimerNombre('')
      setPrimerApellido('')
      setSegundoApellido('')
      setSegundoNombre('')
      setTurnoEmpleado(null)
      setCodigoPersonal('')
      setErrorCedula(false)
      setEspecialidad(null)
      setLocalizacionPersonal(null)
    }
  }, [cedula])

  function cerrarCrearPersonal() {
    setVisibled(false)
    setIncompleto(false)
    setErrorCedula(false)
    setCedula(null)
    setPrimerNombre(null)
    setPrimerApellido(null)
    setInputGuardarPersonalHorario({})
    setTurnoEmpleado(null)
    setCodigoPersonal(null)
    setEspecialidad(null)
    setLocalizacionPersonal(null)
  }

  function guardarHorario(e) {
    e.preventDefault()
    if (cedula !== null && turnoEmpleado !== null) {
      InputGuardarPersonalHorario.co_turno = parseInt(turnoEmpleado?.co_turno)
      InputGuardarPersonalHorario.co_personal = parseInt(codigoPersonal)
      InputGuardarPersonalHorario.co_locacion = parseInt(
        localizacionPersonal?.code
      )
      InputGuardarPersonalHorario.co_especialidad = parseInt(especialidad.code)

      insertarHorario({ InputGuardarPersonalHorario }).then(
        ({ insertHorario: { status, message, type } }) => {
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message,
            life: 3000
          })
          setTimeout(() => {
            cerrarCrearPersonal()
            refresPac()
          }, 3000)
        }
      )
    } else {
      setIncompleto(true)
      setInputGuardarPersonalHorario({})
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
      <h1>CREAR HORARIO</h1>
    </motion.div>
  )

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={header}
        visible={visibled}
        className="w-[50vw] md:w-[60vw]"
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
            <div className="field">
              <div className="p-inputgroup">
                <span className="p-float-label">
                  <InputText
                    className={`redondeo-input-buttom-left ${
                      incompleto && cedula === null ? 'border-red-600' : ''
                    } ${errorCedula ? 'border-red-600' : ''}`}
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    keyfilter="pint"
                    maxLength="8"
                  />
                  <label htmlFor="username">Cédula del Empleado</label>
                </span>
                <Button
                  icon="pi pi-search"
                  className="redondeo-input-buttom-right"
                  disabled
                />
              </div>
              {errorCedula && (
                <small className="block text-red-600 text-center">
                  El usuario no se encuentra registrado.
                </small>
              )}
              {incompleto && cedula === null && (
                <small className="block text-red-600 text-center">
                  Necesita registrar la Cédula.
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
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className={`redondeo-lg w-[102%] ${
                  incompleto && especialidad === null ? 'border-red-600' : ''
                }`}
                value={especialidad}
                options={especialidades?.getEspecialidadesHorarios}
                onChange={(e) => setEspecialidad(e.value)}
                optionLabel="name"
                disabled={!cedula}
              />
              <label htmlFor="username">Especialidad</label>
            </motion.span>
            {incompleto && especialidad === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la especialidad.
              </small>
            )}
          </div>
          <div className="field col-span-2">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className={`redondeo-lg w-[102%] ${
                  incompleto && turnoEmpleado === null ? 'border-red-600' : ''
                }`}
                value={turnoEmpleado}
                options={turnos?.getTurnosPorHorarioEspe}
                onChange={(e) => setTurnoEmpleado(e.value)}
                optionLabel="nb_turno"
                disabled={!cedula}
              />
              <label htmlFor="username">Turnos</label>
            </motion.span>
            {incompleto && turnoEmpleado === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el turno del personal.
              </small>
            )}
          </div>
          <div className="field col-span-2">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className={`redondeo-lg w-[102%] ${
                  incompleto && turnoEmpleado === null ? 'border-red-600' : ''
                }`}
                value={localizacionPersonal}
                options={localizaciones?.getLocacionPorEspecialidad}
                onChange={(e) => setLocalizacionPersonal(e.value)}
                optionLabel="name"
                disabled={!turnoEmpleado}
              />
              <label htmlFor="username">Locación</label>
            </motion.span>
            {incompleto && turnoEmpleado === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Locación del personal.
              </small>
            )}
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
                value={primerNombre}
                onChange={(e) => setPrimerNombre(e.target.value)}
                className={`${
                  incompleto && primerNombre === null ? 'border-red-600' : ''
                }`}
                disabled
              />
              <label htmlFor="username">Primer Nombre</label>
            </motion.span>
            {incompleto && primerNombre === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el Nombre.
              </small>
            )}
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
                onChange={(e) => setPrimerApellido(e.target.value)}
                className={`${
                  incompleto && primerApellido === null ? 'border-red-600' : ''
                }`}
                disabled
              />
              <label htmlFor="username">Primer Apellido</label>
            </motion.span>
            {incompleto && primerApellido === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el Apellido.
              </small>
            )}
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
            className="col-span-4"
          >
            <Button label="Guardar" onClick={guardarHorario} disabled={false} />
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

export default CrearHorario
