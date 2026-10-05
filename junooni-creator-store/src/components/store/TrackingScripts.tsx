"use client"

import Script from "next/script"

export default function TrackingScripts({ store }: { store: any }) {
  if (!store) return null
  const gtmId     = store.gtm_id?.trim()
  const ga4Id     = store.ga4_id?.trim()
  const gadsId    = store.gads_id?.trim()
  const metaPixel = store.meta_pixel_id?.trim()

  if (!gtmId && !ga4Id && !gadsId && !metaPixel) return null

  return (
    <>
      {gtmId && (
        <Script id={`gtm-${gtmId}`} strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
      )}
      {ga4Id && !gtmId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id={`ga4-${ga4Id}`} strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');
          `}</Script>
        </>
      )}
      {gadsId && !gtmId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gadsId}`} strategy="afterInteractive" />
          <Script id={`gads-${gadsId}`} strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gadsId}');
          `}</Script>
        </>
      )}
      {metaPixel && (
        <Script id={`pixel-${metaPixel}`} strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
          s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${metaPixel}');
          fbq('track','PageView');
        `}</Script>
      )}
    </>
  )
}