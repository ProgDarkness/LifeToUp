import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { addLocale } from 'primereact/api'
import GQLSolicitudes from 'graphql/recepcion'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'
import { SelectButton } from 'primereact/selectbutton'

function CrearPaciente({ visibled, setVisibled, tokenQuery, refresPac }) {
  const toast = useRef(null)
  const [sexo, setSexo] = useState(null)
  const [nacionalidad, setNacionalidad] = useState({
    name: 'Venezolano',
    code: 'V'
  })
  const [cedula, setCedula] = useState(null)
  const [primerNombre, setPrimerNombre] = useState(null)
  const [segundoNombre, setSegundoNombre] = useState(null)
  const [primerApellido, setPrimerApellido] = useState(null)
  const [segundoApellido, setSegundoApellido] = useState(null)
  const [fechaNacimiento, setFechaNacimiento] = useState(null)
  const [inputGuardarPaciente, setInputGuardarPaciente] = useState({})
  const [incompleto, setIncompleto] = useState(false)
  const maxDate = new Date()
  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado'
    ],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'MA', 'MI', 'J', 'V', 'S'],
    monthNames: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre'
    ],
    monthNamesShort: [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic'
    ],
    today: 'Hoy',
    clear: 'Limpiar'
  })

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

  const insertarPaciente = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLSolicitudes.INSERT_PACIENTE,
      { inputInsertPaciente: variables },
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  function cerrarCrearPaciente() {
    setVisibled(false)
    setIncompleto(false)
    setNacionalidad(null)
    setCedula(null)
    setPrimerNombre(null)
    setSegundoNombre(null)
    setPrimerApellido(null)
    setSegundoApellido(null)
    setInputGuardarPaciente({})
    setFechaNacimiento(null)
    setSexo(null)
  }

  function guardarPaciente(e) {
    e.preventDefault()
    if (
      nacionalidad !== null &&
      cedula !== null &&
      primerNombre !== null &&
      primerApellido !== null &&
      sexo !== null &&
      fechaNacimiento !== null
    ) {
      inputGuardarPaciente.nu_cedula = parseInt(cedula)
      inputGuardarPaciente.tx_nombre1 = primerNombre.toUpperCase()
      inputGuardarPaciente.tx_nombre2 = segundoNombre?.toUpperCase()
      inputGuardarPaciente.tx_apellido1 = primerApellido.toUpperCase()
      inputGuardarPaciente.tx_apellido2 = segundoApellido?.toUpperCase()
      inputGuardarPaciente.fe_nacimiento = fechaNacimiento
      inputGuardarPaciente.co_sexo = sexo.code
      inputGuardarPaciente.co_nacionalidad = nacionalidad.code

      insertarPaciente(inputGuardarPaciente).then(
        ({ insertPaciente: { status, message, type } }) => {
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message,
            life: 3000
          })
          setTimeout(() => {
            cerrarCrearPaciente()
            refresPac()
          }, 3000)
        }
      )
    } else {
      setIncompleto(true)
      setInputGuardarPaciente({})
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
      <h1>REGISTRAR PACIENTE</h1>
    </motion.div>
  )

  const nacionalidades = [
    { name: 'Venezolano', code: 'V' },
    { name: 'Extranjero', code: 'E' }
  ]

  const sexos = [
    { name: 'Hombre', code: 'H' },
    { name: 'Mujer', code: 'M' }
  ]

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={header}
        visible={visibled}
        onHide={() => cerrarCrearPaciente()}
        resizable={false}
        draggable={false}
        contentClassName="redondeo-dialog-content"
        headerClassName="redondeo-dialog-header"
        position="top-right"
        className="w-[50vw] md:w-[60vw]"
      >
        <div className="grid grid-cols-4 gap-3">
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
              <h1>DATOS DEL PACIENTE</h1>
            </div>
          </motion.center>
          <div className="flex flex-row">
            <div className="w-[3.5em] mt-[0.5vh]">
              <SelectButton
                optionLabel="code"
                value={nacionalidad}
                options={nacionalidades}
                onChange={(e) => setNacionalidad(e.value)}
                className="nacionalidad"
              />
            </div>
            <div className="field">
              <div className="p-inputgroup">
                <span className="p-float-label">
                  <InputText
                    className="redondeo-input-buttom-left"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    keyfilter="pint"
                    maxLength="8"
                  />
                  <label htmlFor="username">Cédula del Solicitante</label>
                </span>
              </div>
              {incompleto && !cedula && (
                <small className="block text-red-600 text-center">
                  Verifique la Cédula o Dirijase a Registrar Paciente.
                </small>
              )}
            </div>
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
                keyfilter="alpha"
                className={`w-full ${
                  incompleto && primerNombre === null ? 'border-red-600' : ''
                }`}
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
                keyfilter="alpha"
                value={segundoNombre}
                onChange={(e) => setSegundoNombre(e.target.value)}
                className="w-full"
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
                keyfilter="alpha"
                onChange={(e) => setPrimerApellido(e.target.value)}
                className={`w-full ${
                  incompleto && primerApellido === null ? 'border-red-600' : ''
                }`}
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
                keyfilter="alpha"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                className="w-full"
              />
              <label htmlFor="username">Segundo Apellido</label>
            </motion.span>
          </div>
          <div className="field">
            <motion.span
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="p-float-label"
            >
              <Calendar
                id="username"
                autoComplete="off"
                dateFormat="dd/mm/yy"
                locale="es"
                maxDate={maxDate}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.value)}
                className={`w-full ${
                  incompleto && fechaNacimiento === null ? 'border-red-600' : ''
                }`}
              />
              <label htmlFor="username">Fecha de Nacimiento</label>
            </motion.span>
            {incompleto && fechaNacimiento === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la fecha de nacimiento.
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
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                optionLabel="name"
                value={sexo}
                options={sexos}
                onChange={(e) => setSexo(e.value)}
                className={`w-[104.4%] ${
                  incompleto && sexo === null ? 'border-red-600' : ''
                }`}
              />
              <label htmlFor="username">Sexo</label>
            </motion.span>
            {incompleto && sexo === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el sexo.
              </small>
            )}
          </div>
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-4"
          >
            <Button label="Registrar" onClick={guardarPaciente} />
          </motion.center>
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .nacionalidad .p-button {
            min-width: 1.5rem !important;
            padding: 5px;
            margin-top: 2px;
            margin-right: -1px;
          }
          .nacionalidad .p-button.p-highlight {
            background: #3f51b5 !important;
            border-color: #3f51b5 !important;
            color: white !important;
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

export default CrearPaciente
