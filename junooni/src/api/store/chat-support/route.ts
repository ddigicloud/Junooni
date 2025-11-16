// // File: app/api/support-request/route.js
// // Place this file in your Next.js app directory structure

// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { name, email, orderNumber, category, message, formattedMessage } = body;

//     // Your Chatwoot configuration
//     const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
//     const CHATWOOT_API_ACCESS_TOKEN = process.env.CHATWOOT_API_ACCESS_TOKEN;
//     const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
//     const CHATWOOT_INBOX_ID = process.env.CHATWOOT_INBOX_ID;

//     if (!CHATWOOT_API_ACCESS_TOKEN || !CHATWOOT_ACCOUNT_ID || !CHATWOOT_INBOX_ID) {
//       throw new Error('Chatwoot configuration is missing');
//     }

//     // Step 1: Create or get contact
//     const contactResponse = await fetch(
//       `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
//         },
//         body: JSON.stringify({
//           inbox_id: CHATWOOT_INBOX_ID,
//           name: name,
//           email: email,
//           custom_attributes: {
//             order_number: orderNumber || 'N/A',
//             support_category: category,
//             source: 'Support Request Form'
//           }
//         })
//       }
//     );

//     let contactData;
//     if (contactResponse.ok) {
//       contactData = await contactResponse.json();
//     } else {
//       // If contact already exists, search for it
//       const searchResponse = await fetch(
//         `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(email)}`,
//         {
//           headers: {
//             'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
//           }
//         }
//       );
      
//       if (searchResponse.ok) {
//         const searchData = await searchResponse.json();
//         contactData = { payload: searchData.payload[0] };
//       } else {
//         throw new Error('Failed to create or find contact');
//       }
//     }

//     const contactId = contactData.payload.id || contactData.payload.contact?.id;

//     // Step 2: Create a conversation
//     const conversationResponse = await fetch(
//       `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
//         },
//         body: JSON.stringify({
//           source_id: `support-form-${Date.now()}`,
//           inbox_id: CHATWOOT_INBOX_ID,
//           contact_id: contactId,
//           status: 'open',
//           custom_attributes: {
//             order_number: orderNumber || 'N/A',
//             category: category,
//             submitted_via: 'Support Request Form'
//           }
//         })
//       }
//     );

//     if (!conversationResponse.ok) {
//       const errorText = await conversationResponse.text();
//       console.error('Conversation creation failed:', errorText);
//       throw new Error('Failed to create conversation');
//     }

//     const conversationData = await conversationResponse.json();
//     const conversationId = conversationData.id;

//     // Step 3: Send the message to the conversation
//     const messageResponse = await fetch(
//       `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
//         },
//         body: JSON.stringify({
//           content: formattedMessage || message,
//           message_type: 'incoming',
//           private: false
//         })
//       }
//     );

//     if (!messageResponse.ok) {
//       const errorText = await messageResponse.text();
//       console.error('Message sending failed:', errorText);
//       throw new Error('Failed to send message');
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Support request submitted successfully',
//       conversationId: conversationId
//     });

//   } catch (error) {
//     console.error('Error in support request API:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message || 'Failed to submit support request' 
//       },
//       { status: 500 }
//     );
//   }
// }

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const { name, email, orderNumber, category, message } = req.body;

    // Validate required fields
    if (!name || !email || !category || !message) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, category, and message are required"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
      return;
    }

    // Chatwoot configuration
    const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://chat.junooni.com';
    const CHATWOOT_API_ACCESS_TOKEN = process.env.CHATWOOT_API_ACCESS_TOKEN;
    const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
    const CHATWOOT_INBOX_ID = process.env.CHATWOOT_INBOX_ID;

    if (!CHATWOOT_API_ACCESS_TOKEN || !CHATWOOT_ACCOUNT_ID || !CHATWOOT_INBOX_ID) {
      console.error('Chatwoot configuration is missing');
      res.status(500).json({
        success: false,
        error: 'Support system configuration error. Please contact support directly at support@junooni.com'
      });
      return;
    }

    // Format message for Chatwoot
    const formattedMessage = `
📋 **New Support Request**

**Name:** ${name}
**Email:** ${email}
${orderNumber ? `**Order Number:** ${orderNumber}` : ''}
**Category:** ${category}

**Message:**
${message}

---
*Submitted via Support Request Form*
    `.trim();

    // Step 1: Create or get contact
    let contactId;
    try {
      const contactResponse = await fetch(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            inbox_id: CHATWOOT_INBOX_ID,
            name: name,
            email: email,
            custom_attributes: {
              order_number: orderNumber || 'N/A',
              support_category: category,
              source: 'Support Request Form'
            }
          })
        }
      );

      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        contactId = contactData.payload.id || contactData.payload.contact?.id;
      } else {
        // If contact already exists, search for it
        const searchResponse = await fetch(
          `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(email)}`,
          {
            headers: {
              'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
            }
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.payload && searchData.payload.length > 0) {
            contactId = searchData.payload[0].id;
          } else {
            throw new Error('Failed to create or find contact');
          }
        } else {
          throw new Error('Failed to search for contact');
        }
      }
    } catch (error) {
      console.error('Error creating/finding contact:', error);
      throw error;
    }

    // Step 2: Create a conversation
    let conversationId;
    try {
      const conversationResponse = await fetch(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            source_id: `support-form-${Date.now()}`,
            inbox_id: CHATWOOT_INBOX_ID,
            contact_id: contactId,
            status: 'open',
            custom_attributes: {
              order_number: orderNumber || 'N/A',
              category: category,
              submitted_via: 'Support Request Form'
            }
          })
        }
      );

      if (!conversationResponse.ok) {
        const errorText = await conversationResponse.text();
        console.error('Conversation creation failed:', errorText);
        throw new Error('Failed to create conversation');
      }

      const conversationData = await conversationResponse.json();
      conversationId = conversationData.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    // Step 3: Send the message to the conversation
    try {
      const messageResponse = await fetch(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            content: formattedMessage,
            message_type: 'incoming',
            private: false
          })
        }
      );

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('Message sending failed:', errorText);
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Success response
    res.status(200).json({ 
      success: true, 
      message: 'Support request submitted successfully',
      conversationId: conversationId
    });

  } catch (error) {
    console.error('Error in support request endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit support request. Please try again or contact us directly at support@junooni.com'
    });
  }
};