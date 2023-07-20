/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppLayoutMenus } from '../../components/AppLayoutMenus/AppLayoutMenus.js'
import Salir from 'components/salir.js'
import { ProgressSpinner } from 'primereact/progressspinner'

export default function index() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [confirmSalir, setConfirmSalir] = useState(false)

  useEffect(() => {
    router.push('/recepcion/solicitudes')
  }, [])
  /* const [colorBoton, setColorBoton] = useState()

  console.log({ colorBoton })

  const fnColorBoton = (n, ruta) => {
    // setColorBoton(router.route === ruta ? 'bg-red-700' : 'bg-blue-500')

    // items[n].style = { backgroundColor: '#2a7e87', color: '#ffffff' }
    items[n].className = router.route === ruta ? 'bg-red-700' : 'bg-blue-500'

    setItems([...items])
  }
 */
  const [items, setItems] = useState([
    {
      label: 'Salir',
      icon: 'pi pi-arrow-left',
      command: () => setConfirmSalir(true)
    }
  ])

  return (
    <AppLayoutMenus
      setActiveIndex={setActiveIndex}
      activeIndex={activeIndex}
      title="RECEPCIÓN"
      items={items}
      setItems={setItems}
    >
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
      <Salir visible={confirmSalir} setVisible={setConfirmSalir} />
    </AppLayoutMenus>
  )
}
