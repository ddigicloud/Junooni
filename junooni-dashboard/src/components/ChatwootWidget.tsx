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

// import React, { useEffect } from 'react';

// const ChatwootWidget: React.FC = () => {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.innerHTML = `
//       (function(d,t) {
//         var BASE_URL = "https://chat.junooni.com";
//         var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
//         g.src = BASE_URL + "/packs/js/sdk.js";
//         g.async = true;
//         s.parentNode.insertBefore(g, s);
//         g.onload = function() {
//           window.chatwootSDK.run({
//             websiteToken: 'G16Yd9z25gtHLDfXnc9BE6B8',
//             baseUrl: BASE_URL
//           });

//           // Wait for iframe to load and inject custom CSS
//           setTimeout(() => {
//             const iframe = document.getElementById('chatwoot_live_chat_widget');
//             if (iframe) {
//               const style = document.createElement('style');
//               style.innerHTML = \`
//                 /* Hide "Powered by Chatwoot" footer */
//                 .powered-by, .cwc-footer__powered-by, [class*="powered"] {
//                   display: none !important;
//                 }

//                 /* Example: customize footer background */
//                 .cwc-footer, footer {
//                   background: #ffffff !important;
//                   border-top: 1px solid #eee !important;
//                 }
//               \`;
//               iframe.contentWindow.document.head.appendChild(style);
//             }
//           }, 4000); // wait a few seconds for the widget to mount
//         };
//       })(document, "script");
//     `;
//     document.body.appendChild(script);

//     return () => {
//       if (script.parentNode) {
//         document.body.removeChild(script);
//       }
//     };
//   }, []);

//   return null;
// };

// export default ChatwootWidget;

