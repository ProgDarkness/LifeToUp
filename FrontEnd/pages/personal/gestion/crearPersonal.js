import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import useSWR from 'swr'
import { SelectButton } from 'primereact/selectbutton'
import GQLPersonal from 'graphql/Personal'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'

function CrearPersonal({ visibled, setVisibled, tokenQuery, refresPac }) {
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
  const [codigoEmpleado, setCodigoEmpleado] = useState(null)
  const [codigoUsuario, setCodigoUsuario] = useState(null)
  const [codigoColMedicos, setCodigoColMedicos] = useState(null)
  const [codigoMinisSanidad, setCodigoMinisSanidad] = useState(null)
  const [errorCedula, setErrorCedula] = useState(false)
  const [InputGuardarPersonal, setInputGuardarPersonal] = useState({})
  const [incompleto, setIncompleto] = useState(false)
  const [selectedEspe, setSelectedEspe] = useState(null)
  const [selectedTipoPersonal, setSelectedTipoPersonal] = useState(null)

  const { data: especialidades } = useSWR(
    tokenQuery
      ? [GQLPersonal.GET_ESPECIALIDADES_PARA_PERSONAL, {}, tokenQuery]
      : null
  )

  const { data: tipoPersonal } = useSWR(
    tokenQuery ? [GQLPersonal.GET_TIPO_PERSONAL, {}, tokenQuery] : null
  )

  const consultarPersonalParaCrear = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLPersonal.GET_CREAR_PERSONAL,
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

  const insertarPersonal = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      GQLPersonal.INSERT_PERSONAL,
      { InputGuardarPersonal: variables },
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    if (cedula?.length > 5 && nacionalidad) {
      consultarPersonalParaCrear({
        cedula: parseInt(cedula),
        nacionalidad: nacionalidad?.code
      }).then(({ getCrearPersonal }) => {
        if (getCrearPersonal?.nombre1) {
          setErrorCedula(false)
          const nombre_1 = getCrearPersonal?.nombre1
          const nombre_2 = getCrearPersonal?.nombre2
          const apellido_1 = getCrearPersonal?.apellido1
          const apellido_2 = getCrearPersonal?.apellido2
          const codigo_empleado = getCrearPersonal?.codigo_empleado
          const co_usuario = getCrearPersonal?.co_usuario

          setPrimerNombre(nombre_1)
          setPrimerApellido(apellido_1)
          setSegundoNombre(nombre_2)
          setSegundoApellido(apellido_2)
          setCodigoEmpleado(codigo_empleado)
          setCodigoUsuario(co_usuario)
        } else {
          setErrorCedula(true)
          setPrimerNombre('')
          setPrimerApellido('')
          setSegundoApellido('')
          setSegundoNombre('')
          setCodigoMinisSanidad('')
          setCodigoEmpleado('')
          setCodigoColMedicos('')
          setCodigoUsuario('')
          setSelectedEspe(null)
          setSelectedTipoPersonal(null)
        }
      })
    } else {
      setPrimerNombre('')
      setPrimerApellido('')
      setSegundoApellido('')
      setSegundoNombre('')
      setCodigoEmpleado('')
      setCodigoUsuario('')
      setCodigoMinisSanidad('')
      setCodigoColMedicos('')
      setSelectedEspe(null)
      setSelectedTipoPersonal(null)
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
    setInputGuardarPersonal({})
    setCodigoEmpleado(null)
    setSelectedEspe(null)
    setCodigoMinisSanidad(null)
    setCodigoColMedicos(null)
    setSelectedTipoPersonal(null)
    setCodigoUsuario(null)
  }

  function guardarPersonal(e) {
    e.preventDefault()
    if (
      nacionalidad !== null &&
      cedula !== null &&
      selectedEspe !== null &&
      codigoEmpleado !== null
    ) {
      if (
        selectedTipoPersonal.code === 1 &&
        codigoColMedicos &&
        codigoMinisSanidad
      ) {
        InputGuardarPersonal.ced_usuario = parseInt(cedula)
        InputGuardarPersonal.co_tipo_personal = parseInt(
          selectedTipoPersonal.code
        )
        InputGuardarPersonal.co_empleado = parseInt(codigoEmpleado)
        InputGuardarPersonal.co_especialidad = parseInt(selectedEspe?.code)
        InputGuardarPersonal.co_usuario = parseInt(codigoUsuario)
        InputGuardarPersonal.co_colegio_medicos = parseInt(codigoColMedicos)
        InputGuardarPersonal.co_ministerio_sanidad =
          parseInt(codigoMinisSanidad)

        insertarPersonal(InputGuardarPersonal).then(
          ({ insertarPersonal: { status, message, type } }) => {
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
      } else if (selectedTipoPersonal.code === 2) {
        InputGuardarPersonal.ced_usuario = parseInt(cedula)
        InputGuardarPersonal.co_empleado = parseInt(codigoEmpleado)
        InputGuardarPersonal.co_especialidad = parseInt(selectedEspe?.code)
        InputGuardarPersonal.co_usuario = parseInt(codigoUsuario)
        InputGuardarPersonal.co_tipo_personal = parseInt(
          selectedTipoPersonal.code
        )

        insertarPersonal(InputGuardarPersonal).then(
          ({ insertarPersonal: { status, message, type } }) => {
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
        setInputGuardarPersonal({})
      }
    } else {
      setIncompleto(true)
      setInputGuardarPersonal({})
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
      <h1>INGRESAR PERSONAL</h1>
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
        className="w-full xl:w-[50vw]"
        onHide={() => {
          cerrarCrearPersonal()
        }}
        resizable={false}
        draggable={false}
        contentClassName="redondeo-dialog-content"
        headerClassName="redondeo-dialog-header"
        position="top-right"
      >
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-3 xl:col-span-4"
          >
            <div
              style={{ fontSize: '20px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-60 redondeo-xl"
            >
              <h1>DATOS DEL PERSONAL</h1>
            </div>
          </motion.center>
          <div className="col-span-2">
            <motion.div
              variants={animation(3)}
              initial="hidden"
              animate="visible"
              className="flex flex-row"
            >
              <SelectButton
                optionLabel="code"
                value={nacionalidad}
                options={nacionalidades}
                onChange={(e) => setNacionalidad(e.value)}
                className="nacionalidad p-[2.4px]"
              />
              <div className="field  w-[70%]">
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
                className={`redondeo-lg w-full ${
                  incompleto && selectedTipoPersonal === null
                    ? 'border-red-600'
                    : ''
                }`}
                value={selectedTipoPersonal}
                options={tipoPersonal?.getTipoPersonal}
                onChange={(e) => setSelectedTipoPersonal(e.value)}
                optionLabel="name"
              />
              <label htmlFor="username">Tipo de Personal</label>
            </motion.span>
            {incompleto && selectedTipoPersonal === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar el tipo de personal.
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
                className={`redondeo-lg w-full ${
                  incompleto && selectedEspe === null ? 'border-red-600' : ''
                }`}
                value={selectedEspe}
                options={especialidades?.getEspecialidadesParaPersonal}
                onChange={(e) => setSelectedEspe(e.value)}
                optionLabel="name"
              />
              <label htmlFor="username">Especialidad</label>
            </motion.span>
            {incompleto && selectedEspe === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la especialidad del personal.
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
                className={`w-full ${
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
                onChange={(e) => setPrimerApellido(e.target.value)}
                className={`w-full ${
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
              <InputText
                id="username"
                autoComplete="off"
                value={codigoEmpleado}
                onChange={(e) => setCodigoEmpleado(e.target.value)}
                disabled
                className={`w-full ${
                  incompleto && codigoEmpleado === null ? 'border-red-600' : ''
                }`}
              />
              <label htmlFor="username">Código Empleado</label>
            </motion.span>
            {incompleto && codigoEmpleado === null && (
              <small className="block text-red-600 text-center">
                Necesita el código empleado.
              </small>
            )}
          </div>
          {selectedTipoPersonal?.code === 1 && (
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
                  value={codigoColMedicos}
                  onChange={(e) => setCodigoColMedicos(e.target.value)}
                  maxLength={6}
                  keyfilter="pint"
                  className={`w-full ${
                    incompleto && codigoEmpleado === null
                      ? 'border-red-600'
                      : ''
                  }`}
                />
                <label htmlFor="username">Código Colegio de Médicos</label>
              </motion.span>
              {incompleto && codigoEmpleado === null && (
                <small className="block text-red-600 text-center">
                  Necesita el Código Colegio de Médicos.
                </small>
              )}
            </div>
          )}
          {selectedTipoPersonal?.code === 1 && (
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
                  value={codigoMinisSanidad}
                  onChange={(e) => setCodigoMinisSanidad(e.target.value)}
                  maxLength={6}
                  keyfilter="pint"
                  className={`${
                    incompleto && codigoMinisSanidad === null
                      ? 'border-red-600'
                      : ''
                  } w-full`}
                />
                <label htmlFor="username">
                  Código del Ministerio de Sanidad
                </label>
              </motion.span>
              {incompleto && codigoMinisSanidad === null && (
                <small className="block text-red-600 text-center">
                  Necesita el Código del Ministerio de Sanidad.
                </small>
              )}
            </div>
          )}
          <motion.center
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="col-span-3 xl:col-span-4"
          >
            <Button label="Crear" onClick={guardarPersonal} disabled={false} />
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

export default CrearPersonal
