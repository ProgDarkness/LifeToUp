import React, { useState, useEffect, Fragment, useRef } from 'react'
import { useRouter } from 'next/router'
import vistaSolicitudCitas from 'graphql/citasmedicas'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import request from 'graphql-request'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { addLocale } from 'primereact/api'
import { SelectButton } from 'primereact/selectbutton'
import useSWR from 'swr'
import { useSesion } from 'hooks/useSesion'
import { AppLayoutMenus } from 'components/AppLayoutMenus/AppLayoutMenus.js'
import GQLLogin from 'graphql/login'
import { ProgressSpinner } from 'primereact/progressspinner'

function CrearCitas() {
  const toast = useRef(null)
  const router = useRouter()
  const rutaActive = router?.route
  const { token, co_rol, cerrarSesion } = useSesion()
  const [items, setItems] = useState(null)

  const { data: menu } = useSWR(
    token && co_rol
      ? [GQLLogin.GET_MENU, { idRol: parseInt(co_rol) }, token]
      : null
  )

  const { data: Acceso } = useSWR(
    rutaActive && co_rol
      ? [
          GQLLogin.GET_ACCESOS_ROL,
          { ruta: rutaActive, idRol: parseInt(co_rol) },
          token
        ]
      : null
  )

  useEffect(() => {
    setItems(JSON.stringify(menu?.getMenu))
  }, [menu])

  /* Solicitante */
  const [s_primer_nombre, setSPrimerNombre] = useState('')
  const [s_segundo_nombre, setSSegundoNombre] = useState('')
  const [s_primer_apellido, setSPrimerApellido] = useState('')
  const [s_segundo_apellido, setSSegundoApellido] = useState('')
  const [s_nombreCompleto, setSNombreCompleto] = useState(null)
  const [idPaciente, setIdPaciente] = useState(null)
  const [funcionarioNombres, setFuncionarioNombres] = useState('')
  const [funcionarioApellidos, setFuncionarioApellidos] = useState('')
  const [cedula, setCedula] = useState(null)
  /* Fin Solicitante */

  /* Carga Familiar */
  const [sexo, setSexo] = useState('')
  const [nombreCargaCompleto, setNombreCargaCompleto] = useState('')
  const [fechaNacimientoCarga, setFechaNacimientoCarga] = useState(null)
  const [edadCarga, setEdadCarga] = useState(null)
  const [sexoCarga, setSexoCarga] = useState(null)
  const [discapacidadCarga, setDiscapacidadCarga] = useState(null)
  /* Fin Carga Familiar */

  /* Cita Medica */
  const [cedulaPaciente, setCedulaPaciente] = useState('')
  const [fechaCita, setFechaCita] = useState(null)
  const [orden, setOrden] = useState(null)
  const [tablaCargaFamiliar, setTablaCargaFamiliar] = useState()
  const solicitudFinal = {}
  const [botonSolicitar, setBotonSolicitar] = useState(true)
  const [cargaNombreCompleto, setCargaNombreCompleto] = useState(false)
  const [errorCedula, setErrorCedula] = useState(false)
  const [nacionalidad, setNacionalidad] = useState({
    name: 'Venezolano',
    code: 'V'
  })
  const nacionalidades = [
    { name: 'Venezolano', code: 'V' },
    { name: 'Extranjero', code: 'E' }
  ]
  const BlOrden = [
    { name: 'SI', code: 1 },
    { name: 'NO', code: 2 }
  ]

  useEffect(() => {
    if (orden?.code === 2) {
      toast.current.show({
        severity: 'error',
        summary: 'Orden Requerida',
        detail: 'Si no posee Orden Debe asistir a Medicina General',
        life: 3000
      })
      setTimeout(() => {
        router.reload()
      }, 3000)
    }
  }, [orden])
  /* Cita Medica */

  /* DropDown */
  const [selectedEspe, setSelectedEspe] = useState(null)
  const [selectedTipoConsult, setSelectedTipoConsult] = useState(null)
  const [selectedTipoPac, setSelectedTipoPac] = useState(null)
  const [selectedParentesco, setSelectedParentesco] = useState(null)
  const [selectedTurno, setSelectedTurno] = useState(null)
  const [ubicacionCita, setUbicacionCitas] = useState(null)
  const [ubicacionCitaChange, setUbicacionCitasChange] = useState(null)
  const [TipoPaciente, setTipoPaciente] = useState()

  /* Mutation DropDown */
  const { data: parentesco } = useSWR(
    token ? [vistaSolicitudCitas.PARENTESCO_PARA_CITA, {}, token] : null
  )
  const { data: especialidades } = useSWR(
    token ? [vistaSolicitudCitas.ESPECIALIDADES_PARA_CITA, {}, token] : null
  )
  const { data: TipoConsulta } = useSWR(
    token ? [vistaSolicitudCitas.TIPO_CONSULTA_CITA, {}, token] : null
  )
  const { data: statusCita } = useSWR(
    token && cedula
      ? [
          vistaSolicitudCitas.STATUS_DE_CITA_MEDICA,
          { cedulaSolicitante: parseInt(cedula) },
          token
        ]
      : null
  )
  const { data: Ubicacion } = useSWR(
    selectedEspe?.code && token
      ? [
          vistaSolicitudCitas.UBICACION_POR_ESPECIALIDAD,
          { cod_especialidad: selectedEspe?.code },
          token
        ]
      : null
  )
  const { data: Turnos } = useSWR(
    ubicacionCitaChange?.code && selectedEspe?.code && token
      ? [
          vistaSolicitudCitas.TURNOS_DIASSEMANALES_ESPECIALIDAD,
          {
            cod_especialidad: selectedEspe?.code,
            co_locacion: ubicacionCitaChange?.code
          },
          token
        ]
      : null
  )
  const { data: DisabledDatesConsult } = useSWR(
    ubicacionCitaChange?.code &&
      selectedEspe?.code &&
      selectedTurno?.code &&
      token
      ? [
          vistaSolicitudCitas.DIAS_DISABLED_ESPECIALIDAD,
          {
            cod_especialidad: selectedEspe?.code,
            co_locacion: ubicacionCitaChange?.code,
            co_turno: selectedTurno?.code
          },
          token
        ]
      : null
  )
  /* DropDown */

  /* Calendar */
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()
  const fechamaxima = new Date()
  const DisabledDates = DisabledDatesConsult?.getDiasDisablePorEspecialidad.map(
    (fecha) => new Date(fecha)
  )
  const diasSemanalesTotal = [1, 2, 3, 4, 5, 6, 0]
  const diaSemanalSelect =
    selectedTurno?.co_dia_semana === 7 ? [0] : [selectedTurno?.co_dia_semana]
  const diasSemanalesDisabled = diasSemanalesTotal.filter(
    (dia) => !diaSemanalSelect?.includes(dia)
  )

  if (fechamaxima.getDate() >= 23) {
    fechamaxima.setDate(30)
    fechamaxima.setMonth(month + 1)
    fechamaxima.setFullYear(year)
  } else {
    fechamaxima.setDate(
      new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    )
    fechamaxima.setMonth(month)
    fechamaxima.setFullYear(year)
  }

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
  /* Calendar */

  /* Consultas */
  const consultaDatosPaciente = ({ cedulaI, nacionalidadI }) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaSolicitudCitas.DATOS_PACIENTE_CITA,
      { cedula: cedulaI, nacionalidad: nacionalidadI },
      { authorization: `Bearer ${token}` }
    )
  }

  const getTipoPaciente = ({ nomina }) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaSolicitudCitas.TIPO_PACIENTE_PARA_CITA,
      { userNomina: nomina },
      { authorization: `Bearer ${token}` }
    )
  }

  const consultaCargaFamiliar = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaSolicitudCitas.CARGA_FAMILIAR_CITA_MEDICA,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  const consultaNacimientoEdadFun = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaSolicitudCitas.NACIMIENTO_EDAD_FUNCIONARIO,
      variables,
      { authorization: `Bearer ${token}` }
    )
  }

  const solicitarCitaInsert = (variables) => {
    return request(
      process.env.NEXT_PUBLIC_URL_BACKEND,
      vistaSolicitudCitas.SOLICITAR_CITA_MEDICA,
      { InputSolicitudCita: variables },
      { authorization: `Bearer ${token}` }
    )
  }

  const onTipoPacChange = (e) => {
    setSelectedTipoPac(e.value)
    setSelectedEspe(null)
    setSelectedParentesco(null)
    setUbicacionCitas(null)
    setUbicacionCitasChange()
    setFechaCita(null)
    setSelectedTurno(null)
  }

  const onEspeChange = (e) => {
    setSelectedEspe(e.value)
    setUbicacionCitas(null)
    setUbicacionCitasChange()
    setSelectedTurno(null)
    setFechaCita(null)
    setSelectedTipoConsult(null)
  }

  const onChangeTipoConsult = (e) => {
    setSelectedTipoConsult(e.value)
    setUbicacionCitas(null)
    setUbicacionCitasChange()
    setSelectedTurno(null)
    setFechaCita(null)
  }

  const onUbicacionChange = (e) => {
    e.preventDefault()
    const object = e.value
    setUbicacionCitasChange(e.value)
    setUbicacionCitas(object.name)
    setSelectedTurno(null)
  }

  const onTurno = (e) => {
    setSelectedTurno(e.value)
    setFechaCita(null)
  }

  const onChangeFechaCita = (e) => {
    setFechaCita(e.value)
    if (selectedTipoPac?.code) setBotonSolicitar(false)
  }

  const onTipoCargaChange = (e) => {
    setUbicacionCitas(null)
    setUbicacionCitasChange()
    setSelectedParentesco(e.value)
    setNombreCargaCompleto('')
    setCedulaPaciente('')
    setUbicacionCitas(null)
    setBotonSolicitar(true)

    if (e.value.code !== null) {
      const tipocarga = e.value.code
      consultaCargaFamiliar({
        id_personal: idPaciente,
        id_parentesco: tipocarga
      }).then(
        ({ getCitasCargasFamiliares: { status, type, message, response } }) => {
          setTablaCargaFamiliar(response)
        }
      )
    }
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <Fragment>
        <Button
          icon="pi pi-check-circle"
          tooltip="Seleccionar"
          className="p-button-rounded p-button-outlined p-button-secondary"
          onClick={(e) => selectedPacienteCita(e, rowData)}
        />
      </Fragment>
    )
  }

  const BodyFeCita = (rowData) => {
    return (
      <Fragment>
        {new Date(parseInt(rowData.fe_cita)).toISOString().slice(0, 10)}
      </Fragment>
    )
  }
  /* Consultas */

  /* UseEfects */
  useEffect(() => {
    if (selectedTipoPac?.code === 2) {
      setFuncionarioApellidos('')
      setFuncionarioNombres('')
      setCedulaPaciente('')
    } else {
      setFuncionarioNombres(s_primer_nombre + ' ' + s_segundo_nombre)
      setFuncionarioApellidos(s_primer_apellido + ' ' + s_segundo_apellido)
      setCedulaPaciente(cedula)
    }
  }, [selectedTipoPac])

  useEffect(() => {
    if (cedula?.length > 5 && nacionalidad) {
      setCargaNombreCompleto(true)
      consultaDatosPaciente({
        cedulaI: parseInt(cedula),
        nacionalidadI: nacionalidad.code
      }).then(({ getDatosFuncionario }) => {
        if (getDatosFuncionario?.nombre1) {
          setErrorCedula(false)
          const nombre_1 = getDatosFuncionario?.nombre1
          const nombre_2 =
            getDatosFuncionario?.nombre2 !== null
              ? getDatosFuncionario?.nombre2
              : ''
          const apellido_1 = getDatosFuncionario?.apellido1
          const apellido_2 =
            getDatosFuncionario?.apellido2 !== null
              ? getDatosFuncionario?.apellido2
              : ''
          const nominaUser = getDatosFuncionario?.idpaciente !== null

          setSexo(getDatosFuncionario?.sexo)
          setSPrimerNombre(nombre_1)
          setSSegundoNombre(nombre_2)
          setSPrimerApellido(apellido_1)
          setSSegundoApellido(apellido_2)
          setIdPaciente(getDatosFuncionario?.idpaciente)
          setSNombreCompleto(
            nombre_1 + ' ' + nombre_2 + ' ' + apellido_1 + ' ' + apellido_2
          )
          setCargaNombreCompleto(false)
          getTipoPaciente({ nomina: nominaUser }).then(
            ({ gettipopaciente }) => {
              setTipoPaciente(gettipopaciente)
            }
          )
        } else {
          setErrorCedula(true)
          setSNombreCompleto('')
        }
      })
    } else {
      setSexo(null)
      setSPrimerNombre('')
      setSSegundoNombre('')
      setSPrimerApellido('')
      setSSegundoApellido('')
      setIdPaciente(null)
      setSNombreCompleto('')
    }
  }, [cedula, nacionalidad])
  /* UseEfects */

  /* Funciones */
  const selectedPacienteCita = (e, rowData) => {
    e.preventDefault()
    setNombreCargaCompleto(rowData.nombres + ' ' + rowData.apellidos)
    setCedulaPaciente(rowData.cedula)
    setFechaNacimientoCarga(rowData.fecha_nacimiento)
    setEdadCarga(rowData.edad)
    setSexoCarga(rowData.sexo)
    setDiscapacidadCarga(rowData.discapacidad)
    if (selectedEspe.name === 'MEDICINA GENERAL' && rowData.edad < 18) {
      toast.current.show({
        severity: 'error',
        summary: 'Atención',
        detail:
          'El paciente no posee la edad para ser atendido en la especialidad',
        life: 4000
      })
      setBotonSolicitar(true)
    } else if (selectedEspe.name === 'GINECOLOGÍA' && rowData.sexo !== 'F') {
      toast.current.show({
        severity: 'error',
        summary: 'Atención',
        detail:
          'El paciente para la especialidad seleccionada debe ser femenino',
        life: 4000
      })
      setBotonSolicitar(true)
    } else if (selectedEspe.name === 'PEDIATRÍA' && rowData.edad >= 18) {
      toast.current.show({
        severity: 'error',
        summary: 'Atención',
        detail:
          'El paciente para la especialidad seleccionada debe ser menor de 18 años',
        life: 4000
      })
      setBotonSolicitar(true)
    } else {
      setBotonSolicitar(false)
    }
  }

  const solicitar = (e) => {
    e.preventDefault()
    if (selectedTipoPac?.code === 2) {
      solicitudFinal.fe_solicitud = new Date().toISOString().slice(0, 10)
      solicitudFinal.ced_solicitante = parseInt(cedula)
      solicitudFinal.co_especialidad = selectedEspe.code
      solicitudFinal.co_tipo_paciente = selectedTipoPac.code
      solicitudFinal.id_parentesco = selectedParentesco.code
      /* datos del paciente */
      solicitudFinal.cedula_paciente = parseInt(
        cedulaPaciente.slice(2, cedulaPaciente.length)
      )
      solicitudFinal.nacionalidad_paciente = cedulaPaciente.slice(0,1)
      solicitudFinal.nombre_paciente = nombreCargaCompleto
      solicitudFinal.fecha_nacimiento = fechaNacimientoCarga
      solicitudFinal.sexo = sexoCarga
      /* datos del paciente */
      solicitudFinal.nu_edad = edadCarga
      solicitudFinal.co_locacion = ubicacionCitaChange.code
      // eslint-disable-next-line no-unneeded-ternary
      solicitudFinal.discapacidad = discapacidadCarga === 'NO' ? false : true
      solicitudFinal.fe_cita =
        fechaCita?.getFullYear() +
        '/' +
        (fechaCita?.getMonth() + 1) +
        '/' +
        fechaCita?.getDate()
      solicitudFinal.co_tipo_consulta = selectedTipoConsult.code
      solicitudFinal.co_turno = selectedTurno.code
      // eslint-disable-next-line no-unneeded-ternary
      solicitudFinal.bl_orden = false

      insertCita()
    } else if (selectedTipoPac?.code !== 2) {
      consultaNacimientoEdadFun({
        cedula: parseInt(cedulaPaciente),
        nacionalidadU: nacionalidad.code
      }).then(
        ({ getEdadNacimientoFuncionario: { edad, fecha_nacimiento } }) => {
          if (fecha_nacimiento !== null) {
            solicitudFinal.fe_solicitud = new Date().toISOString().slice(0, 10)
            solicitudFinal.ced_solicitante = parseInt(cedula)
            solicitudFinal.co_especialidad = selectedEspe.code
            solicitudFinal.co_tipo_paciente = selectedTipoPac.code
            solicitudFinal.id_parentesco = 0
            /* datos del paciente */
            solicitudFinal.cedula_paciente = parseInt(cedulaPaciente)
            solicitudFinal.nombre_paciente =
              funcionarioNombres + ' ' + funcionarioApellidos
            solicitudFinal.fecha_nacimiento = new Date(
              parseInt(fecha_nacimiento)
            )
              .toISOString()
              .slice(0, 10)
            solicitudFinal.sexo = sexo
            /* datos del paciente */
            solicitudFinal.co_locacion = ubicacionCitaChange.code
            solicitudFinal.fe_cita =
              fechaCita?.getFullYear() +
              '/' +
              (fechaCita?.getMonth() + 1) +
              '/' +
              fechaCita?.getDate()
            solicitudFinal.nu_edad = edad
            solicitudFinal.co_tipo_consulta = selectedTipoConsult.code
            solicitudFinal.co_turno = selectedTurno.code
            // eslint-disable-next-line no-unneeded-ternary
            solicitudFinal.bl_orden = false
            solicitudFinal.nacionalidad = nacionalidad.code

            insertCita()
          }
        }
      )
    }
  }

  const insertCita = () => {
    solicitarCitaInsert(solicitudFinal).then(
      ({ solicitarCitaMedica: { status, type, message } }) => {
        toast.current.show({
          severity: type,
          summary: 'Atención',
          detail: message,
          life: 3000
        })
        setTimeout(() => {
          router.reload()
        }, 2900)
      }
    )
  }
  /* Funciones */

  /* [leer, crear, modificar, eliminar] */
  /* console.log(Acceso?.getRolAcceso.response.tx_permisos) */
  const permisos = Acceso?.getRolAcceso.response

  if (!Acceso) {
    return (
      <AppLayoutMenus items={items}>
        <div className="flex justify-center items-center">
          <div className=" text-[#2c9eaa] text-2xl xl:text-4xl font-extrabold tracking-widest">
            <h1>Cargando...</h1>
            <ProgressSpinner
              className="w-[50px] h-[50px] mt-[10px] ml-[80px]"
              strokeWidth="8"
              fill="var(--surface-ground)"
              animationDuration=".5s"
            />
          </div>
        </div>
      </AppLayoutMenus>
    )
  }
  if (
    Acceso?.getRolAcceso.status !== 200 &&
    typeof Acceso?.getRolAcceso.status !== 'undefined'
  ) {
    cerrarSesion()
  }
  return (
    <AppLayoutMenus title="RECEPCIÓN" items={items}>
      <div className="grid grid-cols-4 gap-5 ">
        <Toast ref={toast} position="top-center" />
        {/* Cita Medica */}
        <center className="col-span-4">
          <div
            style={{ fontSize: '30px', fontWeight: '600' }}
            className="bg-[#2a7e87] text-white w-60 redondeo-xl"
          >
            <h1>CITAS MÉDICAS</h1>
          </div>
        </center>
        <div className="flex flex-row">
          <SelectButton
            optionLabel="code"
            value={nacionalidad}
            options={nacionalidades}
            onChange={(e) => setNacionalidad(e.value)}
            className="nacionalidad"
          />
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
              <Button
                icon="pi pi-search"
                className="redondeo-input-buttom-right"
                disabled
              />
            </div>
            {errorCedula && (
              <small className="block text-red-600 text-center">
                Verifique la Cédula o Dirijase a Registrar Paciente.
              </small>
            )}
          </div>
        </div>
        <div className="field">
          <span className="p-input-icon-right">
            {cargaNombreCompleto && (
              <i className="pi pi-spin pi-spinner z-10 mr-3" />
            )}
            <span className="p-float-label">
              <InputText
                className="redondeo-lg w-[37vh]"
                value={s_nombreCompleto}
                disabled
                id="DropDown"
              />
              <label htmlFor="username">Nombres del Solicitante</label>
            </span>
          </span>
        </div>
        {cedula?.length > 5 && !cargaNombreCompleto && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={selectedTipoPac}
                options={TipoPaciente}
                onChange={onTipoPacChange}
                optionLabel="name"
              />
              <label htmlFor="username">Paciente</label>
            </span>
          </div>
        )}
        {selectedTipoPac?.code === 2 && cedula?.length > 5 && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={selectedParentesco}
                options={parentesco?.getparentescos}
                onChange={onTipoCargaChange}
                optionLabel="name"
              />
              <label htmlFor="username">Parentesco</label>
            </span>
          </div>
        )}
        {selectedTipoPac !== null && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={selectedEspe}
                options={especialidades?.getespecialidades}
                onChange={onEspeChange}
                optionLabel="name"
              />
              <label htmlFor="username">Especialidad</label>
            </span>
          </div>
        )}
        {selectedEspe !== null && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={selectedTipoConsult}
                options={TipoConsulta?.getTipoConsulta}
                onChange={onChangeTipoConsult}
                optionLabel="name"
              />
              <label htmlFor="username">Motivo de Consulta</label>
            </span>
          </div>
        )}
        {selectedTipoPac !== null &&
          selectedEspe?.orden === true &&
          selectedTipoConsult?.code && (
            <center className="-mt-3">
              <label
                className="block"
                style={{ fontSize: '20px', fontWeight: '400' }}
              >
                ¿Posee Orden Médica?
              </label>
              <SelectButton
                optionLabel="name"
                value={orden}
                options={BlOrden}
                onChange={(e) => setOrden(e.value)}
                style={{ height: '10px' }}
              />
            </center>
          )}
        {selectedEspe?.code && selectedTipoPac && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={ubicacionCitaChange}
                options={Ubicacion?.getLocalizacionPorEspecialidad}
                onChange={onUbicacionChange}
                optionLabel="name"
              />
              <label htmlFor="username">Ubicación</label>
            </span>
          </div>
        )}
        {selectedEspe?.code && selectedTipoPac && ubicacionCitaChange?.code && (
          <div className="field">
            <span className="p-float-label">
              <Dropdown
                emptyMessage="No existen opciones disponibles"
                className="redondeo-lg w-[96%]"
                value={selectedTurno}
                options={Turnos?.getDiasSemanalesTurnos?.turnos}
                onChange={onTurno}
                optionLabel="name"
              />
              <label htmlFor="username">Turno</label>
            </span>
          </div>
        )}
        {selectedTipoPac?.code && ubicacionCita && selectedTurno?.code && (
          <span className="p-float-label">
            <Calendar
              inputId="Calender"
              className="redondeo-lg w-[96%]"
              locale="es"
              value={fechaCita}
              onChange={(e) => onChangeFechaCita(e)}
              dateFormat="yy-mm-dd"
              showIcon
              readOnlyInput
              minDate={today}
              maxDate={fechamaxima}
              disabledDays={diasSemanalesDisabled}
              disabledDates={DisabledDates}
            />
            <label htmlFor="username">Fecha para la Cita</label>
          </span>
        )}
        {/* Fin Cita Medica */}

        {/* Carga Familiar */}
        {selectedTipoPac?.code === 2 && selectedParentesco !== null ? (
          <center className="col-span-4">
            <Divider align="center" type="solid" />
            <div
              style={{ fontSize: '30px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-[30%] redondeo-xl"
            >
              <h1>FAMILIARES DEL SOLICITANTE</h1>
            </div>
            <DataTable
              value={tablaCargaFamiliar}
              className="p-datatable-responsive-demo"
              dataKey="cedula"
              stripedRows={true}
              emptyMessage={
                'No Hay Carga Familiar Registrada como' +
                ' ' +
                selectedParentesco?.name
              }
            >
              <Column
                field="parentesco"
                header="Parentesco"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="cedula"
                header="Cédula"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="nombres"
                header="Nombres"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="apellidos"
                header="Apellidos"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="fecha_nacimiento"
                header="Fecha de Nacimiento"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="edad"
                header="Edad"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="sexo"
                header="Sexo"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                field="discapacidad"
                header="Discapacidad"
                style={{ width: 'auto', textAlign: 'center' }}
              />
              <Column
                header="Seleccionar"
                body={actionBodyTemplate}
                style={{ width: '8%', textAlign: 'center' }}
              />
            </DataTable>
          </center>
        ) : (
          <center className="col-span-4">
            <Divider align="center" type="solid" />
          </center>
        )}

        {selectedParentesco?.code && fechaCita && (
          <center className="col-span-4">
            <Divider align="center" type="solid" />
          </center>
        )}

        {selectedTipoPac?.code && fechaCita && (
          <center className="col-span-4 -mt-5">
            <div
              style={{ fontSize: '30px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-60 redondeo-xl"
            >
              <h1>PACIENTE</h1>
            </div>
          </center>
        )}

        {selectedParentesco?.code && fechaCita && (
          <span className="p-float-label"></span>
        )}

        {selectedParentesco?.code && fechaCita && (
          <span className="p-float-label col-span-1">
            <InputText
              className="redondeo-lg w-[46vh]"
              value={nombreCargaCompleto}
              disabled
              id="DropDown"
            />
            <label htmlFor="username">Nombre</label>
          </span>
        )}

        {selectedParentesco?.code && fechaCita && (
          <span className="p-float-label ml-[20%]">
            <InputText
              className="redondeo-lg"
              value={cedulaPaciente}
              disabled
              id="DropDown"
            />
            <label htmlFor="username">Cédula</label>
          </span>
        )}

        {selectedParentesco?.code && fechaCita && permisos?.tx_permisos[1] && (
          <center className="col-span-4">
            <Button
              id="botonSolicitar"
              className="p-button-success p-1"
              onClick={(e) => solicitar(e)}
              disabled={botonSolicitar}
            >
              <i className="pi pi-eject px-2" />
              <span className="pr-2">Solicitar</span>
            </Button>
          </center>
        )}

        {selectedParentesco?.code && fechaCita && (
          <center className="col-span-4 -mt-4">
            <Divider align="center" type="solid" />
          </center>
        )}
        {/* Fin Carga Familiar */}

        {/* Funcionario */}
        {selectedTipoPac?.code && fechaCita && !selectedParentesco?.code && (
          <span className="p-float-label"></span>
        )}
        {selectedTipoPac?.code && fechaCita && !selectedParentesco?.code && (
          <span className="p-float-label ">
            <InputText
              className="redondeo-lg w-[45vh]"
              value={s_nombreCompleto}
              disabled
              id="DropDown"
            />
            <label htmlFor="username">Nombre</label>
          </span>
        )}

        {selectedTipoPac?.code && fechaCita && !selectedParentesco?.code && (
          <span className="p-float-label ml-[20%]">
            <InputText
              className="redondeo-lg"
              value={cedulaPaciente}
              disabled
              id="DropDown"
            />
            <label htmlFor="username">Cédula</label>
          </span>
        )}

        {selectedTipoPac?.code &&
          fechaCita &&
          !selectedParentesco?.code &&
          permisos?.tx_permisos[1] && (
            <center className="col-span-4">
              <Button
                id="botonSolicitar"
                className="p-button-success p-1"
                onClick={(e) => solicitar(e)}
                disabled={botonSolicitar}
              >
                <i className="pi pi-eject px-2" />
                <span className="pr-2">Solicitar</span>
              </Button>
            </center>
          )}

        {selectedTipoPac?.code && fechaCita && !selectedParentesco?.code && (
          <center className="col-span-4">
            <Divider align="center" type="solid" />
          </center>
        )}

        {/* Fin Funcionario */}

        {/* Citas Solicitadas */}
        {statusCita?.statusSolicitudCita.length >= 1 && cedula?.length > 5 && (
          <center id="selectedPaciente" className="col-span-4 -mt-4">
            <div
              style={{ fontSize: '30px', fontWeight: '600' }}
              className="bg-[#2a7e87] text-white w-[20%] md:w-[25%] redondeo-xl"
            >
              <h1>CITAS SOLICITADAS</h1>
            </div>
            <DataTable
              value={statusCita?.statusSolicitudCita}
              className="p-datatable-responsive-demo mt-4"
              dataKey="cedula"
              stripedRows={true}
              emptyMessage={'No Hay Citas Solicitadas'}
            >
              <Column field="nu_cedula" header="Cédula" />
              <Column field="tx_nombre1" header="Nombre" />
              <Column field="tx_apellido1" header="Apellido" />
              <Column field="nb_especialidad" header="Especialidad" />
              <Column
                field="fe_cita"
                header="Fecha de Cita"
                body={BodyFeCita}
              />
            </DataTable>
          </center>
        )}
        {/* Fin Citas Solicitadas */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style jsx global>{`
          .nacionalidad .p-button {
            min-width: 1rem !important;
            padding: 7px;
            margin-top: 3px;
            margin-right: -1px;
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
          .redondeo-input-buttom-right {
            border-top-right-radius: 0px !important;
            border-bottom-right-radius: 0.5rem !important;
          }
          .redondeo-input-buttom-left {
            border-bottom-left-radius: 0.5rem !important;
            border-top-left-radius: 0.5rem !important;
          }
          .p-button:disabled {
            background: #3f51b5 !important;
            color: #ffffff !important;
            opacity: 1;
          }
          .p-divider.p-divider-horizontal:before {
            border-top: 1px solid #2a7e8788;
          }
        `}</style>
      </div>
    </AppLayoutMenus>
  )
}

export default CrearCitas
