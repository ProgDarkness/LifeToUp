import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import useSWR from 'swr'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'
import GQLEspecialidades from 'graphql/especialidades'
import { InputText } from 'primereact/inputtext'
import { ToggleButton } from 'primereact/togglebutton'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { useRouter } from 'next/router'

function CrearEspecialidad({
  visibled,
  setVisibled,
  tokenQuery,
  refresPac,
  rowDataEditar,
  setRowDataEditar
}) {
  const router = useRouter()
  const toast = useRef(null)
  const [incompleto, setIncompleto] = useState(false)
  const [nombreEspecialidad, setNombreEspecialidad] = useState(null)
  const [localizacionEspecialidad, setLocalizacionEspecialidad] = useState(null)
  const [coEspecialidad, setCoEspecialidad] = useState(null)
  const [coEspeLocacion, setCoEspeLocacion] = useState(null)
  const [editarAgregarLocacion, setEditarAgregarLocacion] = useState(false)
  const [ordenMedica, setOrdenMedica] = useState(false)
  const [redireccionHorario, setRedireccionHorario] = useState(false)

  const { data: locaciones } = useSWR(
    tokenQuery
      ? [GQLEspecialidades.GET_CREAR_ESPE_LOCACIONES, {}, tokenQuery]
      : null
  )

  const insertarEspecialidad = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLEspecialidades.INSERT_ESPECIALIDAD,
      variables,
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    if (rowDataEditar) {
      setCoEspecialidad(rowDataEditar.co_especialidad)
      setNombreEspecialidad(rowDataEditar.nb_especialidad)
      setCoEspeLocacion(rowDataEditar.co_especialidad_locacion)
      setEditarAgregarLocacion(true)
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

  function cerrarCrearEspecialidad() {
    setVisibled(false)
    setIncompleto(false)
    setNombreEspecialidad(null)
    setLocalizacionEspecialidad(null)
    setOrdenMedica(false)
    setEditarAgregarLocacion(false)
    setCoEspecialidad(null)
    setCoEspeLocacion(null)
    setRowDataEditar(null)
  }

  function GuardarEspecialidad(e) {
    e.preventDefault()

    if (localizacionEspecialidad && nombreEspecialidad) {
      const inputCrearEspecialidad = {}

      if (!editarAgregarLocacion) {
        inputCrearEspecialidad.co_locacion = parseInt(
          localizacionEspecialidad?.code
        )
        inputCrearEspecialidad.nb_especialidad =
          nombreEspecialidad.toUpperCase()
        inputCrearEspecialidad.bl_orden = ordenMedica
        inputCrearEspecialidad.bl_activo = false
        inputCrearEspecialidad.nb_especialidad_test =
          nombreEspecialidad.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }

      if (editarAgregarLocacion) {
        inputCrearEspecialidad.editarAgregarLocacion = editarAgregarLocacion
        inputCrearEspecialidad.co_especialidad_locacion = coEspeLocacion
        inputCrearEspecialidad.co_especialidad_edit = coEspecialidad
        inputCrearEspecialidad.co_locacion_agg = parseInt(
          localizacionEspecialidad?.code
        )
        inputCrearEspecialidad.bl_activo_agg = false
      }

      insertarEspecialidad({ inputCrearEspecialidad }).then(
        ({ insertarEspecialidad: { status, message, type } }) => {
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message,
            life: 3000
          })
          cerrarCrearEspecialidad()
          refresPac()
        }
      )
      setRedireccionHorario(true)
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
      <h1>Crear Especialidad</h1>
    </motion.div>
  )

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={redireccionHorario}
        onHide={() => setRedireccionHorario(false)}
        message="Para que la especialidad este activa para el público debe asignarle un horario ¿Desea asignarle uno?"
        header="Crear Especialidad"
        icon="pi pi-exclamation-triangle"
        accept={() => router.push('/especialidades/horarios')}
        reject={() => setRedireccionHorario(false)}
        rejectLabel="No"
        acceptLabel="Si"
      />
      <Dialog
        header={header}
        visible={visibled}
        className="w-[40vw] md:w-[50vw]"
        onHide={() => {
          cerrarCrearEspecialidad()
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
              className="bg-[#2a7e87] text-white w-[45%] redondeo-xl"
            >
              <h1>DATOS DE LA ESPECIALIDAD</h1>
            </div>
          </motion.center>
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
                value={nombreEspecialidad}
                onChange={(e) => setNombreEspecialidad(e.target.value)}
                className={`w-[102%] ${
                  incompleto && nombreEspecialidad === null
                    ? 'border-red-600'
                    : ''
                }`}
              />
              <label htmlFor="username">Nombre de Especialidad</label>
            </motion.span>
            {incompleto && nombreEspecialidad === null && (
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
                  incompleto && localizacionEspecialidad === null
                    ? 'border-red-600'
                    : ''
                }`}
                value={localizacionEspecialidad}
                options={locaciones?.getLocacionesCrearEspe}
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
          {!editarAgregarLocacion && (
            <div className="field col-span-2">
              <motion.span
                variants={animation(3)}
                initial="hidden"
                animate="visible"
                className="p-float-label flex"
              >
                <h1 className="mt-[3%] mr-[3%]">¿Requerir Orden?</h1>
                <ToggleButton
                  checked={ordenMedica}
                  onChange={(e) => setOrdenMedica(e.value)}
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  aria-label="Confirmacion"
                  onLabel="SI"
                  offLabel="NO"
                />
              </motion.span>
            </div>
          )}
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4"
          >
            <Button
              label="Crear"
              onClick={GuardarEspecialidad}
              disabled={false}
            />
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

export default CrearEspecialidad
