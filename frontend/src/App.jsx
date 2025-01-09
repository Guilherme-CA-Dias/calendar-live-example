import React, { useState, useEffect } from "react";
import {
  IntegrationAppProvider,
  useIntegrationApp,
} from "@integration-app/react";
import axios from "axios";
import "./App.css";

function App() {
  const customerId = "1234567"; // Fixed customer ID
  const customerName = "GD tesat"; // Fixed customer Name

  // Define the fetchToken function correctly
  const fetchToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-token",
        {
          customerId,
          customerName,
        }
      );
      return response.data.token; // Return the token directly
    } catch (error) {
      console.error("Failed to fetch token:", error);
      throw new Error("Token fetch failed");
    }
  };

  return (
    <IntegrationAppProvider fetchToken={fetchToken}>
      <MyComponent customerId={customerId} />
    </IntegrationAppProvider>
  );
}

function MyComponent({ customerId }) {
  const integrationApp = useIntegrationApp();
  const [integrations, setIntegrations] = useState([]);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentId, setParentId] = useState("");
  const [actionPayload, setActionPayload] = useState("");

  // Fetch available integrations
  useEffect(() => {
    let interval;

    const fetchIntegrations = async () => {
      try {
        const { items: integrations } =
          await integrationApp.integrations.find();
        console.log("Fetched Integrations Payload", integrations); // Log payload for debugging
        setIntegrations(integrations);
      } catch (error) {
        console.error("Error fetching integrations:", error);
      }
    };

    fetchIntegrations();

    interval = setInterval(fetchIntegrations, 5000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [integrationApp]);

  const enableFlow = async () => {
    try {
      for (const integration of integrations) {
        if (integration.connection) {
          const flow = await integrationApp
            .connection(integration.key)
            .flow("send-company-events")
            .patch({ enabled: true }); // Enable the flow

          console.log(`Flow enabled for ${integration.name}`, flow);
          alert(`Flow enabled for ${integration.name}`);
        }
      }
    } catch (error) {
      console.error("Error enabling flow:", error);
      alert("Failed to enable flow. See console for details.");
    }
  };

  // Create a flow instance for this customer
  const createFlowInstance = async () => {
    try {
      const result = await integrationApp
        .connection("google-calendar")
        .flow("new-updates-on-meetings")
        .patch({
          //Using Patch here already sets up the external event to the flow
          parameters: { id: 'guilherme.dias@integration.app'} // We can pass the parameters here, on your case probably we set up as calendarId, but you'd have to change in the flow to pull from flow_instances>paramenters>calendarId
        });

      console.log("Flow instance created successfully:", result);
      // alert('Flow instance created for the customer!');
    } catch (error) {
      console.error("Error creating flow instance:", error);
      // alert('Failed to create flow instance.');
    }
  };

  //////////////////// Create Flow instances code
  const createFlowInstancesWithParameters = async () => {
    const calendarIds = [
      "AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0ArLVYsR1rXEeM6xWl3bQz0AADk3bQKAAA",
      "calendar2@example.com",
      "calendar3@example.com",
    ]; // Replace with your actual calendar IDs

    try {
      for (const calendarId of calendarIds) {
        const result = await integrationApp
          .connection("microsoft-outlook") // Replace with your connection key
          .flow("new-updates-on-meetings", { instanceKey: calendarId }) // Use calendarId as the instanceKey
          .patch({
            parameters: { id: calendarId }, // Pass calendarId as a parameter
          });

        console.log(
          `Flow instance created successfully for calendar ID: ${calendarId}`,
          result
        );
      }

      // alert('Flow instances with parameters created successfully for all calendars!');
    } catch (error) {
      console.error("Error creating flow instances with parameters:", error);
      // alert('Failed to create flow instances with parameters for one or more calendars.');
    }
  };
  /////////////////////
  //////////////////// Create multiple flow instances

  const createFlowInstances = async () => {
    const calendarIds = [
      "AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0ArLVYsR1rXEeM6xWl3bQz0AADk3bQKAAA",
      "calendar2@example.com",
    ]; // Replace with actual calendar IDs

    try {
      for (const calendarId of calendarIds) {
        // Use calendarId as the unique instanceKey
        const instanceKey = `${calendarId}`;

        const result = await integrationApp
          .connection("microsoft-outlook") // Replace with your connection key
          .flow("new-updates-on-meetings", { instanceKey }) // Unique instanceKey
          .get({ autoCreate: true }); // Create the flow instance automatically if it doesn't exist

        console.log(
          `Flow instance created successfully for calendar ID: ${calendarId}`,
          result
        );
      }

      alert("Flow instances created successfully for all calendars!");
    } catch (error) {
      console.error("Error creating flow instances:", error);
      alert("Failed to create flow instances for one or more calendars.");
    }
  };

  ///////////////////////

  /////////////////////// Run action to pull calendar list

  const calendarList = async () => {
    try {
      const calendar = await integrationApp
        .connection("microsoft-outlook")
        .action("calendar")
        .run();

      alert(`Calendars fetched: ${JSON.stringify(calendar)}`);
      console.log(`Calendars fetched: ${JSON.stringify(calendar)}`);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  //////////////////////////////////
  ////////////////////////////////// Run specific action

  const runaction = async () => {
    const appkey = "test-6769546cbb23aa39c55acced";

    try {
      const actionResponse = await integrationApp
        .connection(appkey)
        .action("list-data-records")
        .run("");

      setActionPayload(actionResponse);
      alert(`action ran succesfully for ${appkey}`);
    } catch (error) {
      console.error("Error running action:", error);
      alert("Failed to run action. See console for details.");
    }
  };

  //////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();

    const inputPayload = {
      description,
      dueDate,
      parentId,
    };

    try {
      // Iterate over each integraton and run the flow
      for (const integration of integrations) {
        if (integration.connection) {
          const result = await integrationApp
            .connection(integration.key)
            .flow("tasks")
            .run({ input: inputPayload });

          console.log("Flow ran for ${integration.key}", result);
        }
      }

      console.log("Form submited:", inputPayload);

      // Clear the fields after submission

      setDescription("");
      setDueDate("");
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputPayloadWebhook),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`Webhook response:`, responseData);

      // Clear the fields after submission

      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error executing flows", error);
    }
  };

  return (
    <div>
      <button onClick={() => integrationApp.open()}>Integrate</button>
      <h2>Avaiable integrations</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {integrations.map((integration) => (
          <div
            key={integration.id}
            style={{ position: "relative", textAlign: "center" }}
          >
            {/* Icon as a button */}
            <button
              onClick={() => integrationApp.integration(integration.key).open()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
              }}
            >
              <img
                src={integration.logoUri}
                alt={integration.name}
                style={{ width: "60px", height: "60px", borderRadius: "8px" }}
              />
            </button>

            {/* Connected status */}
            {integration.connection?.disconnected === false && (
              <div
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "lightgrey",
                  color: "black",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  padding: "2px 5px",
                }}
              >
                Connected
              </div>
            )}

            {/* Integration name */}
            <div
              style={{ marginTop: "8px", fontSize: "14px", fontWeight: "500" }}
            >
              {integration.name}
            </div>
          </div>
        ))}
      </div>
      <div>
        <button onClick={createFlowInstance} className="global-button">
          Create Flow Instance
        </button>
        <button onClick={enableFlow} style={{ marginTop: "20px" }}>
          Enable Flow
        </button>
        <button onClick={calendarList}>get calendar</button>
        <button onClick={runaction}>Run action</button>
      </div>

      {/* Render Action Payload */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          borderTop: "1px solid #ccc",
        }}
      >
        <h3>Action Payload:</h3>
        {actionPayload ? (
          <pre
            style={{
              textAlign: "left",
              backgroundColor: "#f9f9f9",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(actionPayload, null, 2)}
          </pre>
        ) : (
          <p>No action has been run yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
