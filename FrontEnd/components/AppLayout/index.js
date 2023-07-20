import Header from './Header'
import Footer from './Footer'
import styles from 'styles/AppLayout.module.css'

export default function Index({
  children,
  marca = false,
  verMenu = true,
  verHeader = false,
  verFooter = false
}) {
  return (
    <div className={marca ? styles.container_marca : styles.container}>
      <Header verMenu={verMenu} />
      <main className={styles.main}>{children}</main>
      <Footer verFooter={verFooter} />
    </div>
  )
}
