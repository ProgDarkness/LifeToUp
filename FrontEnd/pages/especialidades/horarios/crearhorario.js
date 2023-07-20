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

function CrearHorarioEspecialidades({
  visibled,
  setVisibled,
  tokenQuery,
  refresTable,
  rowDataEditar
}) {
  const toast = useRef(null)
  const [cantidadCitas, setCantidadCitas] = useState(null)
  const [horaInicio, setHoraInicio] = useState(null)
  const [horaCierre, setHoraCierre] = useState(null)
  const [turnoEspecialidad, setTurnoEspecialidad] = useState(null)
  const [incompleto, setIncompleto] = useState(false)
  const [especialidad, setEspecialidad] = useState(null)
  const [localizacionEspecialidad, setLocalizacionEspecialidad] = useState(null)
  const [codigoHorarioEspecialidad, setCodigoHorarioEspecialidad] =
    useState(null)
  const [editarPermis, setEditarPermis] = useState(false)

  const { data: turnos } = useSWR(
    tokenQuery ? [GQLHorarios.GET_TURNOS, {}, tokenQuery] : null
  )

  const { data: locaciones } = useSWR(
    tokenQuery && especialidad
      ? [
          GQLHorarios.GET_LOCACIONES_PARA_ESPECIALIDAD,
          { co_especialidad: parseInt(especialidad?.code) },
          tokenQuery
        ]
      : null
  )

  const { data: especialidades } = useSWR(
    tokenQuery
      ? [GQLHorarios.GET_ESPECIALIDADES_HORARIOS, {}, tokenQuery]
      : null
  )

  useEffect(() => {
    setHoraInicio(turnoEspecialidad?.hh_inicio)
    setHoraCierre(turnoEspecialidad?.hh_fin)
  }, [turnoEspecialidad])

  useEffect(() => {
    if (rowDataEditar) {
      setEspecialidad({
        code: rowDataEditar.co_especialidad,
        name: rowDataEditar.nb_especialidad
      })
      setTurnoEspecialidad({
        nb_turno: rowDataEditar.nb_turno,
        hh_inicio: rowDataEditar.hh_inicio,
        hh_fin: rowDataEditar.hh_fin,
        co_turno: rowDataEditar.co_turno
      })
      setLocalizacionEspecialidad({
        code: rowDataEditar.co_locacion,
        name: rowDataEditar.nb_locacion
      })
      setCantidadCitas(rowDataEditar.nu_cantidad_citas_diarias)
      setCodigoHorarioEspecialidad(rowDataEditar.co_horario_especialidad)
      setEditarPermis(true)
    }
  }, [rowDataEditar])

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

  const insertarHorarioEspecialidad = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLHorarios.INSERT_HORARIO_ESPECIALIDAD,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  function guardarHorarioEspecialidad(e) {
    e.preventDefault()
    const inputHorarioEspecialidad = {}
    inputHorarioEspecialidad.co_turno = parseInt(turnoEspecialidad?.co_turno)
    inputHorarioEspecialidad.co_especialidad = parseInt(especialidad?.code)
    inputHorarioEspecialidad.co_locacion = parseInt(
      localizacionEspecialidad?.code
    )
    inputHorarioEspecialidad.nu_cantidad_citas_diarias = parseInt(cantidadCitas)
    inputHorarioEspecialidad.permiso_editar = editarPermis
    inputHorarioEspecialidad.co_horario_especialidad = parseInt(
      codigoHorarioEspecialidad
    )

    insertarHorarioEspecialidad({ inputHorarioEspecialidad }).then(
      ({ insertOrUpdateHorarioEspecialidad: { status, message, type } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message,
          life: 3000
        })
        cerrarCrearHorario()
        refresTable()
      }
    )
  }

  function cerrarCrearHorario() {
    setVisibled(false)
    setIncompleto(false)
    setCantidadCitas(null)
    setHoraInicio(null)
    setHoraCierre(null)
    setEspecialidad(null)
    setLocalizacionEspecialidad(null)
    setTurnoEspecialidad(null)
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
        className="w-[50vw] md:w-[56vw]"
        onHide={() => {
          cerrarCrearHorario()
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
              className="bg-[#2a7e87] text-white w-[32%] redondeo-xl"
            >
              <h1>DATOS DE LA ESPECIALIDAD</h1>
            </div>
          </motion.center>
          <div className="field col-span-3">
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
              />
              <label htmlFor="username">Especialidad</label>
            </motion.span>
            {incompleto && especialidad === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Especialidad
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
                  incompleto && turnoEspecialidad === null
                    ? 'border-red-600'
                    : ''
                }`}
                value={turnoEspecialidad}
                options={turnos?.getTurnos}
                onChange={(e) => setTurnoEspecialidad(e.value)}
                optionLabel="nb_turno"
              />
              <label htmlFor="username">Turnos</label>
            </motion.span>
            {incompleto && turnoEspecialidad === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el turno de la Especialidad.
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
                  incompleto && localizacionEspecialidad === null
                    ? 'border-red-600'
                    : ''
                }`}
                value={localizacionEspecialidad}
                options={locaciones?.getLocacion}
                onChange={(e) => setLocalizacionEspecialidad(e.value)}
                optionLabel="name"
              />
              <label htmlFor="username">Locación</label>
            </motion.span>
            {incompleto && localizacionEspecialidad === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Locación del personal.
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
              <InputText
                id="username"
                autoComplete="off"
                value={cantidadCitas}
                onChange={(e) => setCantidadCitas(e.target.value)}
                className={`redondeo-lg w-[102%] ${
                  incompleto && cantidadCitas === null ? 'border-red-600' : ''
                }`}
                keyfilter="pint"
                maxLength={4}
              />
              <label htmlFor="username">Cantidad de Citas por Turno</label>
            </motion.span>
            {incompleto && cantidadCitas === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Cantidad de Citas.
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
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={`redondeo-lg w-[102%] ${
                  incompleto && horaInicio === null ? 'border-red-600' : ''
                }`}
                disabled
              />
              <label htmlFor="username">Hora de Inicio</label>
            </motion.span>
            {incompleto && horaInicio === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Hora de Inicio.
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
                value={horaCierre}
                onChange={(e) => setHoraCierre(e.target.value)}
                className={`redondeo-lg w-[102%] ${
                  incompleto && horaCierre === null ? 'border-red-600' : ''
                }`}
                disabled
              />
              <label htmlFor="username">Hora de Cierre</label>
            </motion.span>
            {incompleto && horaCierre === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Hora de Cierre.
              </small>
            )}
          </div>
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4"
          >
            <Button
              label="Guardar"
              onClick={guardarHorarioEspecialidad}
              disabled={
                !especialidad &&
                !turnoEspecialidad &&
                !localizacionEspecialidad &&
                !cantidadCitas
              }
            />
          </motion.center>
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .nacionalidad .p-button {
            min-width: 1rem !important;
          }
          .p-button:disabled {
            background: #6d7ede !important;
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

export default CrearHorarioEspecialidades
