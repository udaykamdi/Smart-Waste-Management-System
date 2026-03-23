import React, { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    // Create script element for Voiceflow chat
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      (function(d, t) {
        var v = d.createElement(t), 
            s = d.getElementsByTagName(t)[0];
        v.onload = function() {
          window.voiceflow.chat.load({
            verify: { projectID: '689edaa1621b7286c8e4e046' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: '689edaa1621b7286c8e4e047',
            render: {
              assistant: {
                avatar: {
                  src: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                }
              }
            },
            autostart: false,
            allowDangerousHTML: true,
            assistant: {
              style: {
                "background": "#4CAF50"
              }
            }
          });
        }
        v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; 
        s.parentNode.insertBefore(v, s);
      })(document, 'script');
    `;
    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
      // Remove any chat elements if they exist
      const chatElements = document.querySelectorAll('[class*="vf-"]');
      chatElements.forEach(el => el.remove());
    };
  }, []);

  return null; // This component doesn't render anything directly
};

export default Chatbot;
