
import * as React from "react"

// Define breakpoints for different screen sizes
const MOBILE_BREAKPOINT = 640  // sm in Tailwind
const TABLET_BREAKPOINT = 768  // md in Tailwind
const LAPTOP_BREAKPOINT = 1024 // lg in Tailwind

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useIsLaptop() {
  const [isLaptop, setIsLaptop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px) and (max-width: ${LAPTOP_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsLaptop(window.innerWidth >= TABLET_BREAKPOINT && window.innerWidth < LAPTOP_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsLaptop(window.innerWidth >= TABLET_BREAKPOINT && window.innerWidth < LAPTOP_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isLaptop
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LAPTOP_BREAKPOINT}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= LAPTOP_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= LAPTOP_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}
