// components/ChatwootWidget.tsx
import React, { useEffect } from 'react';

const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d,t) {
       var BASE_URL = "http://localhost:3000";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.defer = true;
        g.async = true;
        s.parentNode.insertBefore(g,s);
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: 'BqrxfRV6KzG8mPjS8ZuZ6wrr',
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