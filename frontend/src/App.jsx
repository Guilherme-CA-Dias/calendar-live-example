import React, { useState, useEffect } from 'react';
import { IntegrationAppProvider, useIntegrationApp } from '@integration-app/react';
import axios from 'axios';
import './App.css';

function App() {
    const customerId = '1234567'; // Fixed customer ID
    const customerName = 'GD tesat'; // Fixed customer Name
    const [token, setToken] = useState('');

    useEffect(() => {
      const fetchToken = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/generate-token', {
                customerId,
                customerName,
            });
            setToken(response.data.token);
        } catch (error){
            console.error(error);
            alert('Failed to generate token.', error);
        }
    };
   

    fetchToken();
    }, []);


    return (

      <IntegrationAppProvider token={token}>
      <MyComponent customerId={customerId} />
    </IntegrationAppProvider>
  );
}

function MyComponent( {customerId} ) {
  const integrationApp = useIntegrationApp();
  const [integrations, setIntegrations] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [parentId, setParentId] = useState('');

  // Fetch available integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const { items: integrations } = await integrationApp.integrations.find();
        console.log("Fetched Integrations Payload", integrations); // Log payload for debugging
        setIntegrations(integrations);
      } catch (error) {
        console.error("Error fetching integrations:", error);
      }
    };

    fetchIntegrations();
  }, [integrationApp]);

    const handleSubmit = async (e) => {
      e.preventDefault();

      const inputPayload = {
        description,
        dueDate,
        parentId,
      };

      try {
          // Iterate over each integraton and run the flow
          for ( const integration of integrations ) {
            if ( integration.connection) {
            const result = await integrationApp
            .connection(integration.key)
            .flow('tasks')
            .run({ input: inputPayload });

            console.log("Flow ran for ${integration.key}", result);
            }
          }
        


      console.log('Form submited:', inputPayload);


      // Clear the fields after submission

      setDescription('');
      setDueDate('');
        } catch (error) {
          console.error("Error executing flows", error);
        }
    };

    const eventSubmit = async (e) => {
      e.preventDefault();
       
      const webhookUrl = `https://api.integration.app/webhooks/app-events/da97b8a9-8a75-4dbd-aa21-eee811b05abe?userId=${customerId}`;
      const inputPayloadWebhook = {
        description,
        dueDate,
        parentId,
      };

      try {
        // Make a post request to the webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputPayloadWebhook),
        });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const responseData = await response.json();
          console.log(`Webhook response:`, responseData);

            // Clear the fields after submission

          setDescription('');
          setDueDate('');
        } catch (error) {
          console.error("Error executing flows", error);
        }
    
    };

  return (
    <div>
      <button onClick={() => integrationApp.open()}>Integrate</button>
      <h2>Avaiable integrations</h2>
      <ul>
        {integrations.map((integration) => (
          <li key={integration.id} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={integration.logoUri}
                alt={integration.name}
                style={{ width: "30px", height: "30px", marginRight: "10px" }}
              />
              <span>
                {integration.name} -{" "}
                {integration.connection?.disconnected === false ? (
                       <span style={{ color: "green" }}>Connected</span>
                       ) : (
                       <span style={{ color: "red" }}>Not Connected</span>
                       )}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <h3>Submit details</h3>
        <form onSubmit={handleSubmit}>
          <div>
          <label>ParentId</label>
          <input
            id="parentId"
            type="text"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)} 
          />
          </div>
          <div>
          <label>Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)} 
          />
          <div>
          <label>Due date</label>
          <input
            id="dueDate"
            type="text"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)} 
          />
          </div>
          <button type="submit">
            Submit
          </button>
          <button type="button" onClick={eventSubmit}>
              Submit to Webhook
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;