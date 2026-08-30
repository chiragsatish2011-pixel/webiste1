import { useEffect, useRef, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import Lenis from 'lenis'

// human-made inspirations: Terminal Industries (REJOUICE) — type-driven minimal + generous whitespace
// Siena Film Foundation — editorial typography + 12-col grid
// Obys Agency — ink-blot hover + pure black + motion
// Monolith Studio — brutalist concrete + grid
// Blueprint 2026 — isogrid + schematic linework (Pinterest Zeka)
// Dark Moody — low-key warm #FF6500 vs cool #05080C

function useReveal(threshold = 0.14) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fallback = setTimeout(() => setInView(true), 1600)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true)
        clearTimeout(fallback)
        io.unobserve(e.target)
      }
    }, { threshold })
    io.observe(el)
    return () => { clearTimeout(fallback); io.disconnect() }
  }, [threshold])
  return [ref, inView] as const
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeHover, setActiveHover] = useState(1)
  const [scrollY, setScrollY] = useState(0)
  const { scrollYProgress } = useScroll()

  const [introRef] = useReveal(0.18)
  const [whatRef] = useReveal(0.12)
  const [prodRef] = useReveal(0.1)
  const [projRef] = useReveal(0.08)
  const [stmtRef] = useReveal(0.16)
  const [contactRef] = useReveal(0.14)

  // Lenis — smooth + resize-aware, tablet/touch preserves momentum
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.18, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: 'vertical', gestureOrientation: 'vertical', smoothWheel: true, touchMultiplier: 1.6 })
    let rafId = 0
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    let resizeTimer: number | undefined
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => lenis.resize(), 120) as unknown as number }
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); clearTimeout(resizeTimer); lenis.destroy() }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }
  const scrolled = scrollY > 36

  return (
    <div className="min-h-screen bg-[#05080C] overflow-x-hidden selection:bg-[#FF6500] selection:text-white antialiased">
      <motion.div className="fixed top-0 left-0 right-0 h-[1.5px] z-[100] pointer-events-none origin-left bg-[#FF6500]" style={{ scaleX: scrollYProgress }} />

      {/* HERO — fluid dvh + smooth */}
      <div className="relative w-full h-[100vh] h-[100dvh] min-h-[600px] sm:min-h-[640px] lg:min-h-[700px] max-h-[1080px] overflow-hidden bg-[#050D17]">
        <div className="absolute inset-0 z-[1] overflow-hidden flex items-center justify-center">
          <img src="/hero-bg.png" alt="" className="absolute w-[94%] h-[94%] object-cover rounded-[2px] will-change-transform" style={{ objectPosition: '50% 46%', left: '3%', top: '3%', transform: `translateY(${scrollY * 0.04}px) scale(1.02)` }} loading="eager" decoding="async" />
          {/* human isogrid — Blueprint 2026 */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 86% 78% at 50% 44%, transparent 46%, rgba(3,8,15,0.42) 88%)' }} />
          <div className="absolute inset-0 opacity-[0.07]" style={{ background: 'linear-gradient(180deg, rgba(7,19,33,0.16) 0%, transparent 48%, rgba(5,8,12,0.14) 100%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-[#05080C] via-[#05080C]/70 to-transparent" />
          {/* volumetric light — human warm practicals */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[22%] w-[68%] h-[22%] bg-[#FF6500]/[0.06] blur-[42px] rounded-full pointer-events-none" />
        </div>

        {/* BUILD — Figma 1043×375 */}
        <div className="hero-build absolute z-[6] left-1/2 -translate-x-1/2 select-none pointer-events-none" style={{ top: '8.9%', width: '62.4vw', maxWidth: '1043px', opacity: mounted ? 1 : 0, transform: mounted ? 'translate3d(-50%, 0, 0)' : 'translate3d(-50%, 16px, 0)', transition: 'opacity 900ms ease 500ms, transform 900ms ease 500ms' }}>
          <img src="/build-mask.png" alt="BUILD" className="w-full h-auto object-contain" style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.46)) contrast(1.04) brightness(1.02)' }} loading="eager" decoding="async" />
          {/* human concrete grain inside letters — mask */}
          <div className="absolute inset-0 opacity-[0.032] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, WebkitMaskImage: 'url(/build-mask.png)', maskImage: 'url(/build-mask.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
        </div>

        <div className="absolute z-[7] left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: '8%', width: 'min(40vw, 520px)', height: '68%', maxHeight: '680px', minWidth: '320px', opacity: mounted ? 1 : 0, transition: 'opacity 600ms ease 900ms' }}>
          <div className="absolute left-[34.8%] bottom-[43.4%] w-[10px] h-[10px] bg-[#FFB84A] rounded-full blur-[0.7px] shadow-[0_0_14px_4px_rgba(255,170,40,0.95),0_0_28px_10px_rgba(255,120,20,0.38)]" style={{ opacity: mounted ? 0.92 : 0, transition: 'opacity 600ms ease 1050ms' }} />
          <div className="absolute right-[32.6%] bottom-[43.9%] w-[10px] h-[10px] bg-[#FFB84A] rounded-full blur-[0.7px] shadow-[0_0_14px_4px_rgba(255,170,40,0.95),0_0_28px_10px_rgba(255,120,20,0.38)]" style={{ opacity: mounted ? 0.92 : 0, transition: 'opacity 600ms ease 1100ms' }} />
        </div>

        <div className="absolute inset-0 z-[8] pointer-events-none" style={{ background: 'radial-gradient(ellipse 84% 72% at 50% 42%, transparent 40%, rgba(2,6,12,0.14) 74%, rgba(2,6,12,0.44) 100%)' }} />

        {/* header — Terminal Industries minimal, human 8pt */}
        <header className={`fixed top-0 inset-x-0 z-[30] flex items-center justify-between px-6 lg:px-10 border-b transition-all duration-500 ${scrolled ? 'bg-[#05080C]/82 backdrop-blur-[12px] border-white/[0.06] h-[64px]' : 'bg-transparent border-transparent h-[78px]'} `} style={{ paddingTop: scrolled ? '0px' : '6px' }}>
          <div className="flex items-center gap-2.5 shrink-0" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 600ms ease 900ms, transform 600ms ease 900ms' }}>
            <img src="/logo.png" alt="" className="h-[20px] w-auto object-contain" loading="eager" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="font-condensed font-semibold tracking-[0.14em] text-[13px] lg:text-[13.5px] text-[#F2EFE6]">CONTRICTORS</span>
            <span className="text-[8px] -ml-1 -mt-2 text-[#F2F2EE]/60">®</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 md:gap-8 lg:gap-12 absolute left-1/2 -translate-x-1/2" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 600ms ease 950ms' }}>
            {[
              { label: 'HOME', active: true },
              { label: 'About', active: false },
              { label: 'PRODUCTS', active: false },
              { label: 'CONTACT', active: false },
            ].map((item) => (
              <a key={item.label} href="#" onClick={(e) => { e.preventDefault(); if (item.label === 'HOME') window.scrollTo({ top: 0, behavior: 'smooth' }); else if (item.label === 'PRODUCTS') scrollTo('products'); else if (item.label === 'CONTACT') scrollTo('contact'); else scrollTo('about'); }} className={`relative font-condensed text-[11px] md:text-[11.5px] lg:text-[12.5px] tracking-[0.18em] transition-colors duration-300 group ${item.active ? 'text-white' : 'text-white/65 hover:text-white'}`}>
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-[#FF6500] transition-all duration-300 ${item.active ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
              </a>
            ))}
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] -mr-2" aria-label="Menu" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 600ms ease 950ms' }}>
            <span className={`w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
          <div className="hidden md:block w-[120px] shrink-0" />
        </header>

        <div className={`absolute top-[72px] inset-x-0 z-[9] md:hidden bg-[#05080C]/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col p-6 gap-5">
            {['HOME', 'About', 'PRODUCTS', 'CONTACT'].map((l) => (
              <a key={l} href="#" onClick={(e) => { e.preventDefault(); if (l === 'HOME') window.scrollTo({ top: 0, behavior: 'smooth' }); else if (l === 'PRODUCTS') scrollTo('products'); else if (l === 'CONTACT') scrollTo('contact'); else scrollTo('about'); }} className="font-condensed tracking-[0.18em] text-[14px] text-white/80 hover:text-[#FF6500] transition-colors">{l}</a>
            ))}
          </nav>
        </div>

        {/* CTA — Figma 377×347 */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }} className="hero-cta absolute z-[10] backdrop-blur-[8px] border border-white/[0.08] overflow-hidden" style={{ left: '5.14vw', bottom: '7.22vh', width: '377px', height: '347px', background: 'linear-gradient(180deg, rgba(18,18,18,0.88) 0%, rgba(52,52,52,0.66) 56%, rgba(86,86,86,0.52) 100%)', boxShadow: '0 16px 48px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <div className="absolute" style={{ left: '26px', right: '26px', top: '44px' }}>
            <p className="font-sans font-[300] text-white antialiased" style={{ fontSize: '35px', lineHeight: '1.22', letterSpacing: '-0.01em', textRendering: 'geometricPrecision' as any }}>
              Hire us for<br />anything<br /><span className="tracking-[-0.01em]">you can imagine.</span>
            </p>
          </div>
          <motion.button whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => scrollTo('about')} className="group absolute flex items-center justify-between bg-[#FF6500] hover:bg-[#FF7A1A] active:bg-[#E65A00] transition-colors" style={{ left: '16px', right: '16px', bottom: '20px', height: '70.8px', padding: '0 22px' }}>
            <span className="font-condensed font-[650] tracking-[0.04em] text-white whitespace-nowrap antialiased" style={{ fontSize: '28px', letterSpacing: '0.02em' }}>BUILD NOW</span>
            <span className="text-black transition-transform duration-300 group-hover:translate-x-[5px] group-hover:-translate-y-[1px] flex items-center justify-center w-8 h-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square" strokeLinejoin="miter"><path d="M7 17L17 7" /><path d="M8.5 7H17V15.5" /></svg>
            </span>
          </motion.button>
        </motion.div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-50 z-[10]" />
      </div>

      {/* INTRO — compact, conserved */}
      <section ref={introRef as any} id="about" className="relative bg-[#05080C] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover opacity-[0.10]" style={{ top: '-10%', height: '120%', filter: 'brightness(0.68) saturate(0.28) contrast(1.06)', transform: `translateY(${scrollY * 0.018}px)` }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #05080C 0%, transparent 28%, transparent 68%, #05080C 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 78% 68% at 50% 46%, transparent 38%, rgba(5,8,12,0.52) 100%)' }} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6500]/14 to-transparent -mt-px" />
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10 py-10 md:py-14 lg:py-20">
          <div className="grid lg:grid-cols-[1.18fr_0.92fr] gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-start smooth-resize">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              <h2 className="font-condensed font-[800] leading-[0.82] tracking-[-0.025em] text-[#F2EFE6] antialiased" style={{ fontSize: 'clamp(46px, 7.2vw, 122px)', textRendering: 'geometricPrecision' as any }}>
                WE BUILD<br /><span className="text-[#D8D0BC] tracking-[-0.015em]">WHAT</span><br />COMES NEXT<span className="text-[#FF6500]">.</span>
              </h2>
              <div className="mt-6 max-w-[560px] border-l-2 border-[#FF6500] pl-5 py-1">
                <p className="text-[16px] leading-[1.6] text-white/85">Heavy infrastructure. <span className="text-[#D8D0BC] font-[500]">Precision systems.</span></p>
              </div>
              {/* axonometrics — scrolltriggered */}
              <div className="mt-8 md:mt-10 hidden md:block max-w-[580px] smooth-resize">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&auto=format&fit=crop&q=80',
                  ].map((src, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 14, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }} className="relative h-[108px] md:h-[118px] lg:h-[126px] overflow-hidden border border-white/[0.10] bg-[#0A111A] group shadow-[0_12px_32px_rgba(0,0,0,0.32)] smooth-resize">
                      <img src={src} alt="" loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&auto=format&fit=crop&q=80' }} className="absolute inset-0 w-full h-full object-cover opacity-[0.92] group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-700" style={{ filter: 'brightness(0.84) contrast(1.08) saturate(0.72)' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* mobile — scrolltriggered */}
              <div className="mt-6 md:hidden flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-1">
                {[
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&auto=format&fit=crop&q=80',
                ].map((src, idx) => (
                  <motion.div key={`m-${idx}`} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.07 }} className="relative h-[112px] w-[168px] shrink-0 snap-start overflow-hidden border border-white/[0.10] bg-[#0A111A]">
                    <img src={src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-[0.92]" style={{ filter: 'brightness(0.84) saturate(0.72)' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }} className="lg:pt-[6px] max-w-[560px] md:max-w-none lg:max-w-[560px] w-full">
              <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} className="hidden md:block overflow-hidden border border-white/[0.10] bg-[#0A121E]/70 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.04)] smooth-resize">
                <div className="relative h-[320px] md:h-[360px] lg:h-[420px] overflow-hidden bg-[#070B13] smooth-resize">
                  <motion.img initial={{ scale: 1.04 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16,1,0.3,1] }} src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80" alt="Blueprint" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.86) contrast(1.10) saturate(0.52)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,8,12,0.06) 0%, transparent 42%, rgba(5,8,12,0.68) 100%)' }} />
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`, backgroundSize: '22px 22px' }} />
                </div>
              </motion.div>
              {/* mobile blueprint — scrolltriggered */}
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-6 md:hidden overflow-hidden border border-white/[0.10] bg-[#0A121E]/70">
                <div className="relative h-[280px] overflow-hidden bg-[#070B13]">
                  <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80" alt="Blueprint" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.86) contrast(1.10) saturate(0.52)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,8,12,0.68) 100%)' }} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mx-6 lg:mx-10" />
      </section>

      {/* WHAT WE BUILD — human editorial, opposite box */}
      <section ref={whatRef as any} className="relative bg-[#070B13] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6500]/18 to-transparent translate-y-px" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover opacity-[0.07]" style={{ top: '-10%', height: '120%', filter: 'brightness(0.55) saturate(0.18) contrast(1.08)', transform: `translateY(${scrollY * 0.012}px)` }} />
        </div>
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10 py-10 md:py-14 lg:py-20 smooth-resize">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mb-6 md:mb-10">
            <h3 className="font-condensed font-[800] tracking-[-0.03em] leading-none text-[#F2EFE6]" style={{ fontSize: 'clamp(28px, 4.2vw, 56px)' }}>WHAT WE BUILD</h3>
          </motion.div>
          <div className="border-t border-white/[0.08]">
            {[
              { n: '01', t: 'CONSTRUCTION', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80' },
              { n: '02', t: 'ENGINEERING', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&auto=format&fit=crop&q=80' },
              { n: '03', t: 'INFRASTRUCTURE', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80' },
              { n: '04', t: 'INDUSTRIAL SYSTEMS', img: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&auto=format&fit=crop&q=80' },
            ].map((row, i) => (
              <motion.div key={row.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: i * 0.09, duration: 0.7, ease: [0.16,1,0.3,1] }} onMouseEnter={() => setActiveHover(i)} className={`group relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center py-4 lg:py-6 border-b border-white/[0.07] transition-all duration-500 cursor-pointer smooth-resize ${activeHover === i ? 'bg-white/[0.045] border border-white/[0.09] shadow-[0_12px_40px_rgba(0,0,0,0.32)] -mx-3 px-3 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6' : 'border border-transparent hover:bg-white/[0.018]'}`}>
                <div>
                  <h4 className={`font-condensed font-[800] tracking-[-0.02em] leading-none transition-all duration-300 ${activeHover === i ? 'text-[#F2EFE6] translate-x-[2px]' : 'text-[#F2EFE6]/90'}`} style={{ fontSize: 'clamp(22px, 2.9vw, 40px)' }}>{row.t}</h4>
                  <div className={`mt-3 h-[1.5px] bg-[#FF6500] transition-all duration-500 ${activeHover === i ? 'w-[72px] md:w-[88px] opacity-100' : 'w-0 opacity-0'}`} />
                </div>
                <div className="relative w-full h-[160px] sm:h-[180px] lg:h-[200px] overflow-hidden bg-[#0A111A] border border-white/[0.06] smooth-resize">
                  <img src={row.img} alt="" loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80' }} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${activeHover === i ? 'scale-[1.04] opacity-100 grayscale-0' : 'scale-[1.01] opacity-90 grayscale-0'}`} style={{ filter: activeHover === i ? 'brightness(0.92) contrast(1.06) saturate(0.92)' : 'brightness(0.86) contrast(1.06) saturate(0.78)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05080C]/55 via-transparent to-transparent" />
                  <div className={`absolute bottom-3 right-3 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${activeHover === i ? 'bg-[#FF6500] border-[#FF6500] text-white' : 'bg-white/[0.04] border-white/20 text-white/50'}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 17L17 7" /><path d="M8 7H17V16" /></svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS — bento fluid, smooth */}
      <section ref={prodRef as any} id="products" className="relative bg-[#05080C] py-10 md:py-14 lg:py-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6500]/14 to-transparent translate-y-px" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover opacity-[0.06]" style={{ top: '-10%', height: '120%', filter: 'brightness(0.5) saturate(0.16)', transform: `translateY(${scrollY * 0.014}px)` }} />
        </div>
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mb-8 md:mb-10 lg:mb-14">
            <h3 className="font-condensed font-[800] tracking-[-0.03em] leading-[0.88] text-[#F2EFE6]" style={{ fontSize: 'clamp(28px, 4.6vw, 66px)' }}>FEATURED<br /><span className="text-[#D8D0BC]">MACHINERY</span></h3>
          </motion.div>
          <div className="grid grid-cols-12 gap-3 md:gap-4 lg:gap-5 auto-rows-[200px] sm:auto-rows-[220px] md:auto-rows-[280px] lg:auto-rows-[360px] smooth-resize">
            {[
              { cls: 'col-span-12 lg:col-span-8', title: 'EXCAVATORS', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&auto=format&fit=crop&q=80' },
              { cls: 'col-span-12 sm:col-span-6 lg:col-span-4', title: 'CRANES', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80' },
              { cls: 'col-span-12 sm:col-span-6 lg:col-span-4', title: 'LOADERS', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80' },
              { cls: 'col-span-12 sm:col-span-6 lg:col-span-4', title: 'DOZERS', img: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1000&auto=format&fit=crop&q=80' },
              { cls: 'col-span-12 sm:col-span-6 lg:col-span-4', title: 'SPECIALIZED', img: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=900&auto=format&fit=crop&q=80' },
            ].map((card, idx) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: idx * 0.08, duration: 0.6 }} className={`${card.cls} relative overflow-hidden group bg-[#070B11] border border-white/[0.06] cursor-pointer smooth-resize`}>
                <img src={card.img} alt={card.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04] opacity-[0.90]" style={{ filter: 'brightness(0.70) contrast(1.11) saturate(0.62)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,8,12,0.06) 0%, rgba(5,8,12,0.14) 55%, rgba(5,8,12,0.70) 100%)' }} />
                <div className="absolute bottom-0 inset-x-0 p-6 lg:p-7">
                  <h4 className="font-condensed font-[800] tracking-[-0.02em] text-[#F2EFE6] leading-none" style={{ fontSize: card.cls.includes('lg:col-span-8') ? 'clamp(22px, 2.1vw, 30px)' : '21px' }}>{card.title}</h4>
                  <div className="mt-3 h-[1.5px] w-0 group-hover:w-12 bg-[#FF6500] transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS — fluid gallery */}
      <section ref={projRef as any} className="relative bg-[#070B13] py-10 md:py-14 lg:py-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6500]/14 to-transparent translate-y-px" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover opacity-[0.06]" style={{ top: '-10%', height: '120%', filter: 'brightness(0.48) saturate(0.14)', transform: `translateY(${scrollY * 0.016}px)` }} />
        </div>
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mb-8 md:mb-10 lg:mb-14">
            <h3 className="font-condensed font-[800] tracking-[-0.03em] leading-none text-[#F2EFE6]" style={{ fontSize: 'clamp(26px, 4.2vw, 60px)' }}>SELECTED PROJECTS</h3>
          </motion.div>
          <div className="grid lg:grid-cols-12 gap-4 md:gap-5 lg:gap-5 smooth-resize">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.05 }} className="lg:col-span-7 group cursor-pointer">
              <div className="relative h-[360px] sm:h-[400px] md:h-[440px] lg:h-[560px] overflow-hidden bg-[#070B11] border border-white/[0.06] smooth-resize">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80" alt="Harbor Ridge" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" style={{ filter: 'brightness(0.78) contrast(1.08) saturate(0.68)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080C]/65 via-transparent to-transparent" />
              </div>
              <div className="mt-4">
                <h4 className="font-condensed font-[700] tracking-[-0.02em] text-[#F2EFE6] text-[16px]">HARBOR RIDGE COMPLEX</h4>
              </div>
            </motion.div>
            <div className="lg:col-span-5 flex flex-col gap-4 md:gap-5 lg:gap-5">
              {[
                { title: 'NORD QUAY TERMINAL', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80' },
                { title: 'ATLAS WORKS', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80' },
              ].map((sub, idx) => (
                <motion.div key={sub.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.12 + idx * 0.08 }} className="group cursor-pointer">
                  <div className="relative h-[260px] sm:h-[280px] md:h-[300px] lg:h-[310px] overflow-hidden bg-[#070B11] border border-white/[0.06] smooth-resize">
                    <img src={sub.img} alt={sub.title} loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80' }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]" style={{ filter: 'brightness(0.78) contrast(1.08) saturate(0.68)' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05080C]/60 to-transparent" />
                  </div>
                  <div className="mt-3">
                    <h4 className="font-condensed font-[700] text-[#F2EFE6] text-[15px] tracking-[-0.02em]">{sub.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.22 }} className="lg:col-span-5 group cursor-pointer lg:mt-2">
              <div className="relative h-[320px] sm:h-[340px] md:h-[380px] lg:h-[460px] overflow-hidden bg-[#070B11] border border-white/[0.06] smooth-resize">
                <img src="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&auto=format&fit=crop&q=80" alt="Vantage Foundry" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" style={{ filter: 'brightness(0.78) contrast(1.08) saturate(0.68)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080C]/60 to-transparent" />
              </div>
              <div className="mt-3">
                <h4 className="font-condensed font-[700] text-[#F2EFE6] text-[15px] tracking-[-0.02em]">VANTAGE FOUNDRY</h4>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.26 }} className="lg:col-span-7 group cursor-pointer lg:mt-2">
              <div className="relative h-[320px] sm:h-[340px] md:h-[380px] lg:h-[460px] overflow-hidden bg-[#070B11] border border-white/[0.06] smooth-resize">
                <img src="https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1200&auto=format&fit=crop&q=80" alt="Crestline Dam" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" style={{ filter: 'brightness(0.78) contrast(1.08) saturate(0.68)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080C]/60 to-transparent" />
              </div>
              <div className="mt-3">
                <h4 className="font-condensed font-[700] text-[#F2EFE6] text-[15px] tracking-[-0.02em]">CRESTLINE DAM & RESERVOIR</h4>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATEMENT — compact */}
      <section ref={stmtRef as any} className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[680px] overflow-hidden bg-[#070B13] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1920&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover" style={{ top: '-18%', height: '136%', filter: 'brightness(0.50) contrast(1.06) saturate(0.52)', transform: `translateY(${scrollY * 0.025}px)` }} />
          {/* 320px soft feather — no hard line, matches screenshot gap */}
          <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-[#070B13] via-[#070B13]/38 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-[#080F1A] via-[#070B13]/45 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(180deg, rgba(7,11,19,0.08) 0%, rgba(5,8,12,0.14) 42%, rgba(5,8,12,0.68) 100%)' }} />
          <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse 74% 62% at 50% 48%, transparent 40%, rgba(5,8,12,0.42) 100%)' }} />
          {/* isogrid — subtle */}
          <div className="absolute inset-0 z-[1] opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 w-full max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <h3 className="font-condensed font-[800] leading-[0.84] tracking-[-0.025em] text-[#F2EFE6] antialiased" style={{ fontSize: 'clamp(52px, 9vw, 152px)', textRendering: 'geometricPrecision' as any }}>
              BUILT FOR<br />THE<br />IMPOSSIBLE<span className="text-[#FF6500]">.</span>
            </h3>
          </motion.div>
        </div>
      </section>

      {/* CONTACT — fluid, tablet previews visible */}
      <section ref={contactRef as any} id="contact" className="relative bg-[#080F1A] py-10 md:py-14 lg:py-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6500]/22 to-transparent" />
        {/* bg image blended — top feather from statement, bottom solid before footer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-x-0 w-full object-cover opacity-[0.09]" style={{ top: '-10%', height: '120%', filter: 'brightness(0.52) saturate(0.22) contrast(1.06)', transform: `translateY(${scrollY * 0.015}px)` }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '44px 44px' }} />
          <div className="absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-[#04070A] via-[#080F1A]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[160px] bg-gradient-to-t from-[#080F1A] to-transparent" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 42%, rgba(8,15,26,0.62) 100%)' }} />
        </div>
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-12 lg:gap-16 items-center smooth-resize">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="">
              <h3 className="font-condensed font-[800] leading-[0.86] tracking-[-0.02em] text-[#F2EFE6] antialiased" style={{ fontSize: 'clamp(44px, 7vw, 108px)', textRendering: 'geometricPrecision' as any }}>
                READY TO<br />BUILD?
              </h3>
              <div className="mt-8 hidden md:grid grid-cols-2 gap-3 md:gap-4 max-w-[480px] smooth-resize">
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative h-[132px] overflow-hidden border border-white/[0.12] bg-[#0F1929] group shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80" alt="Oslo HQ" className="absolute inset-0 w-full h-full object-cover opacity-[0.88] group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(0.72)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }} className="relative h-[132px] overflow-hidden border border-white/[0.12] bg-[#0F1929] group shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80" alt="Dubai" className="absolute inset-0 w-full h-full object-cover opacity-[0.88] group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(0.72)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </motion.div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.12 }} className="lg:pl-10 w-full smooth-resize">
              <div className="bg-[#0F1929]/90 border border-white/[0.10] p-6 lg:p-8 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="font-condensed font-[700] tracking-[-0.02em] text-[#F2EFE6] text-[20px]">Start a project</p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Project inquiry received. Our engineering team will contact you within 24 hours.') }} className="mt-6 space-y-3">
                  <input required placeholder="Full name" className="w-full h-[48px] px-4 bg-[#05080C]/80 border border-white/[0.10] text-[#F2EFE6] placeholder:text-white/30 text-[13px] focus:outline-none focus:border-[#FF6500]/45 focus:bg-[#05080C] transition-colors" />
                  <input required type="email" placeholder="Work email" className="w-full h-[48px] px-4 bg-[#05080C]/80 border border-white/[0.10] text-[#F2EFE6] placeholder:text-white/30 text-[13px] focus:outline-none focus:border-[#FF6500]/45 focus:bg-[#05080C] transition-colors" />
                  <textarea required placeholder="Project scope — location, scale, timeline" rows={3} className="w-full px-4 py-3 bg-[#05080C]/80 border border-white/[0.10] text-[#F2EFE6] placeholder:text-white/30 text-[13px] focus:outline-none focus:border-[#FF6500]/45 focus:bg-[#05080C] transition-colors resize-none" />
                  <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }} type="submit" className="group w-full h-[56px] bg-[#FF6500] hover:bg-[#FF7A1A] text-white font-condensed font-[700] tracking-[0.08em] text-[13.5px] flex items-center justify-center gap-3 transition-colors shadow-[0_12px_32px_rgba(255,100,0,0.28)] hover:shadow-[0_16px_40px_rgba(255,100,0,0.38)]">
                    START A PROJECT <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="relative bg-[#020408] overflow-hidden border-t border-white/[0.04]">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6500]/30 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent translate-y-[2px]" />
        <div className="absolute inset-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" style={{ filter: 'brightness(0.28) saturate(0.06) contrast(1.08)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #020408 0%, transparent 45%, transparent 75%, #020408 100%)' }} />
        </div>
        {/* masked watermark — sits in footer only, not bleeding into contact */}
        <div className="absolute -bottom-6 right-4 lg:right-10 leading-none select-none pointer-events-none hidden lg:block overflow-hidden" style={{ fontFamily: "'Barlow Condensed','Oswald', sans-serif", fontWeight: 900, fontSize: '132px', letterSpacing: '-0.06em', lineHeight: 0.9 }}>
          <span className="block bg-clip-text text-transparent opacity-[0.06]" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center 40%', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>CONTRICTORS®</span>
        </div>
        <div className="relative max-w-[1560px] mx-auto px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16 smooth-resize">
          <div className="grid md:grid-cols-2 lg:grid-cols-[1.45fr_0.85fr_0.95fr] gap-10 md:gap-12 lg:gap-16 xl:gap-20">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="" className="h-[16px] w-auto object-contain opacity-90" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
                <span className="font-condensed font-[700] tracking-[0.14em] text-[12px] text-[#F2EFE6]">CONTRICTORS®</span>
              </div>
              <p className="mt-4 max-w-[360px] text-[13px] leading-[1.65] text-white/55">We build what comes next. Heavy infrastructure, precision engineering and industrial systems for clients who cannot afford failure.</p>
              <div className="mt-6 flex gap-2">
                {['IN', 'IG', 'X', 'YT'].map((s) => (
                  <a key={s} href="#" className="w-8 h-8 rounded-full border border-white/[0.12] bg-white/[0.04] flex items-center justify-center font-mono text-[10px] tracking-[0.08em] text-white/60 hover:border-[#FF6500]/50 hover:bg-[#FF6500]/10 hover:text-[#FF6500] transition-colors">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-1.5">
                {['HOME', 'ABOUT', 'PRODUCTS', 'PROJECTS', 'CONTACT', 'CAREERS'].map((l) => (
                  <a key={l} href="#" onClick={(e) => { e.preventDefault(); if (l === 'HOME') window.scrollTo({ top: 0, behavior: 'smooth' }); else if (l === 'PRODUCTS') scrollTo('products'); else if (l === 'CONTACT') scrollTo('contact'); else scrollTo('about'); }} className="font-condensed tracking-[0.11em] text-[13px] text-white/65 hover:text-[#FF6500] transition-colors py-1">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="space-y-3 text-[13px] leading-[1.6] text-white/60">
                <p>CONTRICTORS HQ<br />Karenslyst Allé 2, 0278 Oslo, Norway</p>
                <p>hello@contrictors.com<br />+47 22 33 44 55</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.07] flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-[11px] tracking-[0.08em] text-white/35">© 2026 CONTRICTORS® — ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed inset-0 opacity-[0.016] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      <style>{`
        .hero-breathe { animation: heroBreathe 18s ease-in-out infinite alternate; transform-origin: center; }
        @keyframes heroBreathe { 0% { transform: scale(1) } 100% { transform: scale(1.04) } }
        /* tablet 769-1024 smooth already via clamp, mobile overrides */
        @media (max-width: 768px) {
          header { height: 64px !important; }
          .hero-cta {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            width: calc(100vw - 32px) !important;
            max-width: 360px !important;
            height: 298px !important;
            bottom: 4.5vh !important;
          }
          .hero-build {
            width: 84vw !important;
            max-width: none !important;
            top: 11% !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-cta { left: 3.5vw !important; width: clamp(300px, 36vw, 360px) !important; height: clamp(280px, 32vw, 320px) !important; }
          .hero-build { width: 70vw !important; top: 10% !important; }
        }
        html, body { overflow-x: hidden; scroll-behavior: smooth; }
        * { scrollbar-width: thin; scrollbar-color: #1A2332 #05080C; }
        /* smooth resize on any viewport change */
        @media (prefers-reduced-motion: no-preference) {
          .hero-cta, .hero-build, section, header, footer { will-change: transform, width, height; }
        }
      `}</style>
    </div>
  )
}
