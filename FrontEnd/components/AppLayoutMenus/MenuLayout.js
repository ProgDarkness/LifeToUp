import { Button } from 'primereact/button'
import { motion } from 'framer-motion'
import { SlideMenu } from 'primereact/slidemenu'
import { useRouter } from 'next/router'
import { useRef, useEffect, useState } from 'react'
import Salir from 'components/salir.js'

function ReponseMenu({ items }) {
  const menu = useRef(null)
  const router = useRouter()
  const [itemsMenu, setItemsMenu] = useState()
  const [confirmSalir, setConfirmSalir] = useState(false)

  useEffect(() => {
    const _items = items ? JSON.parse(items) : null

    if (_items !== null) {
      const _itemsMenu = _items.map((item) => {
        return {
          label: item.label,
          icon: item.icon,
          /* eslint no-eval: 0 */
          command: eval(item.command),
          style: item.command.includes(router.route)
            ? {
                backgroundColor: '#2a7e87',
                color: '#ffffff'
              }
            : { backgroundColor: '#ffffff' }
        }
      })
      _itemsMenu.push({
        label: 'Salir',
        icon: 'pi pi-arrow-left',
        command: () => setConfirmSalir(true)
      })
      setItemsMenu(_itemsMenu)
    }
  }, [items])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: [1, 0.9, 1] }}
      transition={{ duration: 0.8 }}
    >
      <motion.div whileTap={{ scale: 0.9 }}>
        <SlideMenu
          id="slide-menu"
          ref={menu}
          model={itemsMenu}
          popup
          viewportHeight={205}
          className="redondeo-lg border-[#2c9eaa] border-2 overflow-auto"
        />
        <Button
          className="flex xl:hidden h-7 bg-[#2c9eaa] redondeo-lg enabled:hover:bg-[#2c9eaa] p-4"
          type="button"
          icon="pi pi-bars"
          label="Menú"
          iconPos="right"
          onClick={(event) => menu.current.toggle(event)}
        />
      </motion.div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .p-menuitem {
          border-radius: 0.5rem 0rem 0.5rem 0.5rem;
        }
        #ReponseMenu.p-slidemenu .p-menuitem-link {
          padding: 0.35rem;
        }
        #ReponseMenu.p-slidemenu.p-slidemenu-overlay {
          border: 2px solid #2a7e87;
        }
        #ReponseMenu.p-slidemenu .p-slidemenu-backward span {
          vertical-align: middle;
        }
        #slide-menu .p-menuitem * {
          color: inherit !important;
        }
      `}</style>
      <Salir visible={confirmSalir} setVisible={setConfirmSalir} />
    </motion.div>
  )
}

function Menu({ items }) {
  const router = useRouter()
  const [itemsMenu, setItemsMenu] = useState()
  const [confirmSalir, setConfirmSalir] = useState(false)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const [sizeText, setSizeText] = useState('14px')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calculoHeight = window?.screen.height - 145
      const calculoWidth = window?.screen.width

      if (calculoWidth > 1774) {
        setWidth(193)
      } else if (calculoWidth === 1280) {
        setWidth(173)
      } else if (calculoWidth < 1774) {
        setWidth(173)
      }

      if (window?.screen.height > 758) {
        setSizeText('17px')
      } else if (window?.screen.height <= 758) {
        setSizeText('14px')
      }

      setHeight(calculoHeight)
    }
  }, [])

  useEffect(() => {
    const _items = items ? JSON.parse(items) : null

    if (_items !== null) {
      const _itemsMenu = _items.map((item) => {
        return {
          label: item.label,
          icon: item.icon,
          command: eval(item.command),
          style: item.command.includes(router.route)
            ? {
                backgroundColor: '#2a7e87',
                color: '#ffffff'
              }
            : { backgroundColor: '#ffffff' }
        }
      })
      _itemsMenu.push({
        label: 'Salir',
        icon: 'pi pi-arrow-left',
        command: () => setConfirmSalir(true)
      })
      setItemsMenu(_itemsMenu)
    }
  }, [items])

  return (
    <>
      {/* 1366 x 657 */}
      <SlideMenu
        id="slide-menu"
        className="w-full redondeo-xl border-2 h-[80vh] max-h-[80vh] lg:h-full"
        style={{ fontSize: `${sizeText}` }}
        model={itemsMenu}
        viewportHeight={height}
        menuWidth={width}
      />

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .p-menuitem {
          border-radius: 0.5rem 0rem 0.5rem 0.5rem;
        }
        #ReponseMenu.p-slidemenu .p-menuitem-link {
          padding: 0.35rem;
        }
        #ReponseMenu.p-slidemenu.p-slidemenu-overlay {
          border: 2px solid #2a7e87;
        }
        #ReponseMenu.p-slidemenu .p-slidemenu-backward span {
          vertical-align: middle;
        }
        #slide-menu .p-menuitem * {
          color: inherit !important;
        }
      `}</style>
      <Salir visible={confirmSalir} setVisible={setConfirmSalir} />
    </>
  )
}

export { ReponseMenu, Menu }
