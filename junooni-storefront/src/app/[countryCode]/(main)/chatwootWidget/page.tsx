// components/ChatwootWidget.tsx
'use client'

import React, { useEffect } from 'react';

const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d,t) {
        var BASE_URL="https://chat.junooni.com";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.async = true;
        s.parentNode.insertBefore(g,s);
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: 'RScGx9Ddg5z1b94oRENU29Js',
            baseUrl: BASE_URL
          })
        }
      })(document,"script");
    `;
    
    // Append to document body
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  return null;
};

export default ChatwootWidget;