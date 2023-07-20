import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import vistaGestionUsuarios from '../../graphql/gestionUsuarios'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import useSWR from 'swr'
import { SelectButton } from 'primereact/selectbutton'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'

function CrearUsuario({ visibled, setVisibled, tokenQuery, refresUser }) {
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
  const [errorCedula, setErrorCedula] = useState(false)
  const [InputGuardarUsuario, setInputGuardarUsuario] = useState({})
  const [incompleto, setIncompleto] = useState(false)
  const [rol, setrol] = useState(null)

  const { data: roles } = useSWR(
    tokenQuery ? [vistaGestionUsuarios.GET_ROLES, {}, tokenQuery] : null
  )

  const consultarUsuariosParaCrear = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.GET_CREAR_USUARIO,
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

  const insertarUsuario = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaGestionUsuarios.CREAR_USUARIO,
      { InputGuardarUsuario: variables },
      { authorization: `Bearer ${tokenQuery}` }
    )
  }

  useEffect(() => {
    if (cedula?.length > 5 && nacionalidad) {
      consultarUsuariosParaCrear({
        cedula: parseInt(cedula),
        nacionalidad: nacionalidad.code
      }).then(({ getCrearUsuario }) => {
        if (getCrearUsuario?.nombre1) {
          setErrorCedula(false)
          const nombre_1 = getCrearUsuario?.nombre1
          const nombre_2 = getCrearUsuario?.nombre2
          const apellido_1 = getCrearUsuario?.apellido1
          const apellido_2 = getCrearUsuario?.apellido2

          setPrimerNombre(nombre_1)
          setPrimerApellido(apellido_1)
          setSegundoNombre(nombre_2)
          setSegundoApellido(apellido_2)
        } else {
          setErrorCedula(true)
          setPrimerNombre('')
          setPrimerApellido('')
          setSegundoApellido('')
          setSegundoNombre('')
        }
      })
    } else {
      setPrimerNombre('')
      setPrimerApellido('')
      setSegundoApellido('')
      setSegundoNombre('')
      setErrorCedula(false)
    }
  }, [cedula, nacionalidad])

  function cerrarCrearPaciente() {
    setVisibled(false)
    setIncompleto(false)
    setErrorCedula(false)
    setCedula(null)
    setPrimerNombre(null)
    setPrimerApellido(null)
    setInputGuardarUsuario({})
    setrol(null)
  }

  function guardarUsuario(e) {
    e.preventDefault()
    if (
      nacionalidad !== null &&
      cedula !== null &&
      primerNombre !== null &&
      primerApellido !== null &&
      rol !== null
    ) {
      InputGuardarUsuario.ced_usuario = parseInt(cedula)
      InputGuardarUsuario.nb_usuario = primerNombre.toUpperCase()
      InputGuardarUsuario.nb2_usuario = segundoNombre?.toUpperCase()
      InputGuardarUsuario.ap_usuario = primerApellido.toUpperCase()
      InputGuardarUsuario.ap2_usuario = segundoApellido?.toUpperCase()
      InputGuardarUsuario.co_rol = rol.code

      insertarUsuario(InputGuardarUsuario).then(
        ({ crearUsuario: { status, message, type } }) => {
          toast.current.show({
            severity: type,
            summary: 'Atención',
            detail: message,
            life: 3000
          })
          setTimeout(() => {
            cerrarCrearPaciente()
            refresUser()
          }, 3000)
        }
      )
    } else {
      setIncompleto(true)
      setInputGuardarUsuario({})
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
      <h1>CREAR USUARIO</h1>
    </motion.div>
  )

  const nacionalidades = [
    { name: 'Venezolano', code: 'V' },
    { name: 'Extranjero', code: 'E' }
  ]

  return (
    <Dialog
      header={header}
      visible={visibled}
      className="w-full xl:w-[55vw]"
      onHide={() => {
        cerrarCrearPaciente()
      }}
      resizable={false}
      draggable={false}
      contentClassName="redondeo-dialog-content"
      headerClassName="redondeo-dialog-header"
      position="top-right"
    >
      <Toast ref={toast} />
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-4">
        <motion.center
          variants={animation(2)}
          initial="hidden"
          animate="visible"
          className="col-span-2 2xl:col-span-4"
        >
          <div
            style={{ fontSize: '20px', fontWeight: '600' }}
            className="bg-[#2a7e87] text-white w-60 redondeo-xl"
          >
            <h1>DATOS DEL USUARIO</h1>
          </div>
        </motion.center>
        <motion.div
          variants={animation(3)}
          initial="hidden"
          animate="visible"
          className="flex flex-row col-span-2"
        >
          <SelectButton
            optionLabel="code"
            value={nacionalidad}
            options={nacionalidades}
            onChange={(e) => setNacionalidad(e.value)}
            className="nacionalidad p-[2.4px]"
          />
          <div className="field  w-[80%]">
            <div className="p-inputgroup ">
              <span className="p-float-label ">
                <InputText
                  className={`redondeo-input-buttom-left${
                    incompleto && cedula === null ? 'border-red-600' : ''
                  } ${errorCedula ? 'border-red-600' : ''}`}
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  keyfilter="pint"
                  maxLength="8"
                />
                <label htmlFor="username">Cédula del Solicitante</label>
              </span>
              <Button
                icon="pi pi-search"
                className="redondeo-input-buttom-right"
                disabled
              />
            </div>
            {errorCedula && (
              <small className="block text-red-600 text-center">
                El Funcionario no existe en Nomina. <br /> Por favor dirigirse
                con Talento Humano.
              </small>
            )}
            {incompleto && cedula === null && (
              <small className="block text-red-600 text-center">
                Necesita registrar la Cédula.
              </small>
            )}
          </div>
        </motion.div>
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
                incompleto && rol === null ? 'border-red-600' : ''
              }`}
              value={rol}
              options={roles?.getRoles}
              onChange={(e) => setrol(e.target.value)}
              optionLabel="name"
            />
            <label htmlFor="username">Rol</label>
          </motion.span>
          {incompleto && rol === null && (
            <small className="block text-red-600 text-center">
              Necesita registrar el rol del Usuario.
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
        <motion.center
          variants={animation(2)}
          initial="hidden"
          animate="visible"
          className="col-span-2 2xl:col-span-4"
        >
          <Button label="Crear" onClick={guardarUsuario} disabled={false} />
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
  )
}

export default CrearUsuario
