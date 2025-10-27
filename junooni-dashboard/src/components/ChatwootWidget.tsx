// components/ChatwootWidget.tsx
import React, { useEffect } from 'react';

const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d,t) {
        var BASE_URL = "https://chat.junooni.com";
        var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
        g.src = BASE_URL + "/packs/js/sdk.js";
        g.async = true;
        s.parentNode.insertBefore(g, s);
        g.onload = function() {
          window.chatwootSDK.run({
            websiteToken: 'G16Yd9z25gtHLDfXnc9BE6B8',
            baseUrl: BASE_URL
          });
        };
      })(document, "script");
    `;

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default ChatwootWidget;
