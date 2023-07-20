import React from 'react'
import styles from 'styles/Footer.module.css'

export default function Footer({ verFooter }) {
  return (
    <footer
      className={`${styles.footer} text-center`}
      style={verFooter ? { display: 'block' } : { display: 'none' }}
    >
      <span className="shadow-8 text-indigo-900 font-bold text-lg bg-indigo-50">
        Intranet CNE
      </span>
    </footer>
  )
}
