import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { motion } from 'framer-motion'

function VerMas({ activeDialog, data, setDialog }) {
  const orden = data?.bl_orden ? 'SI' : 'NO'
  const discapacidad = data?.bl_discapacidad ? 'SI' : 'NO'
  const CedSolicitante = data?.ced_solicitante
  const tipoPaciente = data?.tp_paciente
  const parentesco = data?.nb_parentesco

  function primeraLetra(str) {
    if (str) {
      return str[0].toUpperCase() + str.slice(1).toLowerCase()
    }
  }

  function animation(input) {
    // eslint-disable-next-line prefer-const
    let container = {
      hidden: { opacity: 1, scale: 0 },
      visible: {
        opacity: 1,
        scale: [0, 1.2, 1],
        transition: { delay: 0.02 }
      }
    }

    for (let i = 0; i < input; i++) {
      container.visible.transition.delay += 0.3
    }

    return container
  }

  

  return (
    <Dialog
      visible={activeDialog}
      onHide={() => setDialog(false)}
      className="h-full w-full md:h-auto md:w-auto redondeo-xl"
      header={
        'Paciente: ' +
        primeraLetra(data?.tx_nombre1) +
        ' ' +
        primeraLetra(data?.tx_apellido1)
      }
      draggable={false}
      resizable={false}
      contentClassName="redondeo-dialog-content"
      headerClassName="redondeo-dialog-header"
    >
      <div className="p-3 w-full h-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-7 content-evenly">
          <motion.span
            variants={animation(1)}
            initial="hidden"
            animate="visible"
            className="p-float-label"
          >
            <InputText className="redondeo-lg" value={orden} disabled />
            <label htmlFor="username">Orden Médica</label>
          </motion.span>
          <motion.span
            variants={animation(2)}
            initial="hidden"
            animate="visible"
            className="p-float-label"
          >
            <InputText className="redondeo-lg" value={discapacidad} disabled />
            <label htmlFor="username">Discapacidad</label>
          </motion.span>
          <motion.span
            variants={animation(3)}
            initial="hidden"
            animate="visible"
            className="p-float-label"
          >
            <InputText className="redondeo-lg" value={tipoPaciente} disabled />
            <label htmlFor="username">Tipo de Paciente</label>
          </motion.span>
          <motion.span
            variants={animation(4)}
            initial="hidden"
            animate="visible"
            className="p-float-label"
          >
            <InputText className="redondeo-lg" value={parentesco} disabled />
            <label htmlFor="username">Parentesco/Titular</label>
          </motion.span>
          <motion.span
            variants={animation(5)}
            initial="hidden"
            animate="visible"
            className="p-float-label"
          >
            <InputText
              className="redondeo-lg"
              value={CedSolicitante}
              disabled
            />
            <label htmlFor="username">Cédula del Solicitante</label>
          </motion.span>
        </div>
      </div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .p-disabled,
        .p-component:disabled {
          opacity: 1;
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

export default VerMas
