import React from 'react'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { useRouter } from 'next/router'

function Salir({ visible, setVisible }) {
  const router = useRouter()

  function accept() {
    router.push('/')
  }

  function reject() {
    setVisible(false)
  }

  return (
    <>
    <ConfirmDialog 
      visible={visible}
      onHide={() => setVisible(false)}
      message="¿Seguro desea salir del Sistema CAMI?"
      header="Confirmación"
      icon="pi pi-exclamation-triangle"
      accept={() => accept()}
      reject={() => reject()}
      headerClassName="redondeo-dialog-header"
      rejectLabel='No'
      acceptLabel='Si'
    />
    {/* eslint-disable-next-line react/no-unknown-property */}
    <style jsx global>{`
        .redondeo-dialog-header {
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0px !important;
        }
        .p-dialog-footer {
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
        }
      `}</style>
    </>
  )
}

export default Salir
